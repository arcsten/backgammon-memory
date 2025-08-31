// Include OpenCV (before Apple headers to avoid NO/Point/Size macro conflicts)
#import <opencv2/opencv.hpp>

#import <React/RCTBridge+Private.h>
#import <ReactCommon/CallInvoker.h>
#import <jsi/jsi.h>

using namespace facebook;
// Avoid bringing cv symbols into global namespace; use cv:: explicitly

static std::string stripFileScheme(const std::string &uri) {
  if (uri.rfind("file://", 0) == 0) {
    return uri.substr(7);
  }
  return uri;
}

static bool loadImageBGR(const std::string &uri, cv::Mat &out) {
  std::string path = stripFileScheme(uri);
  out = cv::imread(path, cv::IMREAD_COLOR);
  return !out.empty();
}

static std::vector<cv::Point2f> orderCornersClockwise(const std::vector<cv::Point> &corners) {
  // Convert to float and order as top-left, top-right, bottom-right, bottom-left
  std::vector<cv::Point2f> pts;
  for (auto &p : corners) pts.emplace_back(static_cast<float>(p.x), static_cast<float>(p.y));
  // Compute centroid
  cv::Point2f c(0, 0);
  for (auto &p : pts) c += p;
  c *= (1.0f / static_cast<float>(pts.size()));
  std::vector<cv::Point2f> ordered(4);
  for (auto &p : pts) {
    if (p.x < c.x && p.y < c.y) ordered[0] = p; // TL
    else if (p.x > c.x && p.y < c.y) ordered[1] = p; // TR
    else if (p.x > c.x && p.y > c.y) ordered[2] = p; // BR
    else ordered[3] = p; // BL
  }
  return ordered;
}

static bool detectBoardQuad(const cv::Mat &gray, std::vector<cv::Point> &outQuad) {
  cv::Mat blurred, edges;
  cv::GaussianBlur(gray, blurred, cv::Size(5, 5), 0);
  cv::Canny(blurred, edges, 50, 150);

  std::vector<std::vector<cv::Point>> contours;
  cv::findContours(edges, contours, cv::RETR_LIST, cv::CHAIN_APPROX_SIMPLE);

  double bestArea = 0.0;
  std::vector<cv::Point> bestQuad;
  const double imgArea = gray.cols * gray.rows;
  for (const auto &contour : contours) {
    double peri = cv::arcLength(contour, true);
    std::vector<cv::Point> approx;
    cv::approxPolyDP(contour, approx, 0.02 * peri, true);
    if (approx.size() == 4 && cv::isContourConvex(approx)) {
      double area = fabs(cv::contourArea(approx));
      if (area > imgArea * 0.05 && area > bestArea) { // filter tiny quads
        bestArea = area;
        bestQuad = approx;
      }
    }
  }

  if (bestQuad.size() == 4) {
    outQuad = bestQuad;
    return true;
  }
  return false;
}

static cv::Mat warpBoard(const cv::Mat &bgr, const std::vector<cv::Point2f> &corners, cv::Size targetSize) {
  std::vector<cv::Point2f> dst = {
    cv::Point2f(0, 0),
    cv::Point2f(static_cast<float>(targetSize.width - 1), 0),
    cv::Point2f(static_cast<float>(targetSize.width - 1), static_cast<float>(targetSize.height - 1)),
    cv::Point2f(0, static_cast<float>(targetSize.height - 1))
  };
  cv::Mat M = cv::getPerspectiveTransform(corners, dst);
  cv::Mat warped;
  cv::warpPerspective(bgr, warped, M, targetSize);
  return warped;
}

struct DetectedPiece { cv::Point center; int radius; std::string color; };

static void detectPieces(const cv::Mat &warpedBGR, std::vector<DetectedPiece> &piecesOut) {
  cv::Mat gray;
  cv::cvtColor(warpedBGR, gray, cv::COLOR_BGR2GRAY);
  cv::GaussianBlur(gray, gray, cv::Size(9, 9), 2);
  std::vector<cv::Vec3f> circles;
  cv::HoughCircles(gray, circles, cv::HOUGH_GRADIENT, 1, 20, 100, 30, 8, 40);

  cv::Mat hsv;
  cv::cvtColor(warpedBGR, hsv, cv::COLOR_BGR2HSV);

  for (auto &c : circles) {
    cv::Point center(cvRound(c[0]), cvRound(c[1]));
    int radius = cvRound(c[2]);
    // Sample small ROI around center
    int r = std::max(3, radius / 2);
    int x0 = std::max(0, center.x - r);
    int y0 = std::max(0, center.y - r);
    int x1 = std::min(hsv.cols, center.x + r);
    int y1 = std::min(hsv.rows, center.y + r);
    cv::Rect roi(x0, y0, std::max(1, x1 - x0), std::max(1, y1 - y0));
    cv::Mat patch = hsv(roi);
    cv::Scalar meanHSV = cv::mean(patch);
    double H = meanHSV[0], S = meanHSV[1], V = meanHSV[2];
    std::string color = "unknown";
    // Heuristic thresholds
    if (S < 60 && V > 160) {
      color = "white";
    } else {
      // red wraparound ranges near 0 degrees (0..10 and 170..180)
      if ((H < 10 || H > 170) && S > 80 && V > 60) color = "red";
    }
    if (color != "unknown") {
      piecesOut.push_back({center, radius, color});
    }
  }
}

static void mapPiecesToPoints(const cv::Size &boardSize,
                              const std::vector<DetectedPiece> &pieces,
                              std::vector<std::vector<std::string>> &pointsOut,
                              int &barWhite,
                              int &barRed) {
  // pointsOut[0..23] contains color strings for simplicity (we will build JSON later)
  pointsOut.assign(24, {});
  const int W = boardSize.width;
  const int H = boardSize.height;
  const float unit = static_cast<float>(W) / 14.0f; // 12 points + 2 units for bar

  for (size_t i = 0; i < pieces.size(); i++) {
    const auto &p = pieces[i];
    int col = std::min(13, std::max(0, static_cast<int>(floor(p.center.x / unit))));
    bool isTop = p.center.y < H / 2;
    // Center columns (6 and 7) represent the bar – count by color and continue
    if (col == 6 || col == 7) {
      if (p.color == "white") barWhite++;
      else if (p.color == "red") barRed++;
      continue;
    }
    int pointNumber = -1;
    if (!isTop) {
      // bottom points 1..12 from left to right, skipping bar columns 6 and 7
      if (col >= 0 && col <= 5) pointNumber = col + 1; // 1..6
      else if (col >= 8 && col <= 13) pointNumber = (col - 8) + 7; // 7..12
    } else {
      // top points 13..24 from left to right, skipping bar
      if (col >= 0 && col <= 5) pointNumber = 13 + (5 - col); // 18..13 (reverse within block)
      else if (col >= 8 && col <= 13) pointNumber = 19 + (13 - col); // 24..19
    }
    if (pointNumber >= 1 && pointNumber <= 24) {
      pointsOut[pointNumber - 1].push_back(p.color);
    }
  }
}

static std::string buildJSONResult(const std::string &imageUri,
                                   bool isValid,
                                   double confidence,
                                   const std::vector<cv::Point2f> &corners,
                                   const cv::Rect &boardRect,
                                   const std::vector<std::vector<std::string>> &pointsColors,
                                   int barWhite,
                                   int barRed) {
  std::ostringstream oss;
  oss << "{";
  oss << "\"confidence\":" << confidence << ",";
  oss << "\"detection\":{\"isValid\":" << (isValid ? "true" : "false")
      << ",\"confidence\":" << confidence
      << ",\"boardRect\":{\"x\":" << boardRect.x << ",\"y\":" << boardRect.y
      << ",\"width\":" << boardRect.width << ",\"height\":" << boardRect.height << "},\"corners\":[";
  for (int i = 0; i < 4; i++) {
    oss << "{\\\"x\\\":" << corners[i].x << ",\\\"y\\\":" << corners[i].y << "}";
    if (i != 3) oss << ",";
  }
  oss << "]},";
  oss << "\"position\":{\"id\":\"native-" << imageUri << "\",";
  oss << "\"points\":[";
  for (int i = 0; i < 24; i++) {
    oss << "{\\\"number\\\":" << (i + 1) << ",\\\"pieces\\\":[";
    for (size_t k = 0; k < pointsColors[i].size(); k++) {
      oss << "{\\\"color\\\":\\\"" << pointsColors[i][k] << "\\\",\\\"id\\\":\\\"" << pointsColors[i][k] << "-" << (i+1) << "-" << k << "\\\"}";
      if (k + 1 < pointsColors[i].size()) oss << ",";
    }
    oss << "]}";
    if (i != 23) oss << ",";
  }
  oss << "],\"bar\":{\"white\":" << barWhite << ",\"red\":" << barRed << "},\"bearOff\":{\"white\":0,\"red\":0},\"toMove\":\"white\",\"timestamp\":0}}";
  return oss.str();
}

// Expose a reusable pipeline for RN bridge (non-JSI)
std::string BackgammonCVProcessUri(const std::string &uri) {
  cv::Mat bgr;
  if (!loadImageBGR(uri, bgr)) {
    return buildJSONResult(uri, false, 0.0,
                           {cv::Point2f(0,0),cv::Point2f(0,0),cv::Point2f(0,0),cv::Point2f(0,0)},
                           cv::Rect(0,0,0,0), std::vector<std::vector<std::string>>(24), 0, 0);
  }

  cv::Mat gray;
  cv::cvtColor(bgr, gray, cv::COLOR_BGR2GRAY);
  std::vector<cv::Point> quad;
  bool ok = detectBoardQuad(gray, quad);
  if (!ok) {
    return buildJSONResult(uri, false, 0.0,
                           {cv::Point2f(0,0),cv::Point2f(0,0),cv::Point2f(0,0),cv::Point2f(0,0)},
                           cv::Rect(0,0,0,0), std::vector<std::vector<std::string>>(24), 0, 0);
  }

  std::vector<cv::Point2f> ordered = orderCornersClockwise(quad);
  // Confidence heuristic: area ratio
  double area = fabs(cv::contourArea(quad));
  double conf = std::min(1.0, std::max(0.5, area / (bgr.cols * bgr.rows)));

  // Warp to canonical size (wide board)
  cv::Size canonicalSize(1000, 500);
  cv::Mat warped = warpBoard(bgr, ordered, canonicalSize);

  // Detect circular pieces and classify color
  std::vector<DetectedPiece> pieces;
  detectPieces(warped, pieces);

  // Map pieces to 24 points
  std::vector<std::vector<std::string>> pointsColors;
  int barWhite = 0, barRed = 0;
  mapPiecesToPoints(canonicalSize, pieces, pointsColors, barWhite, barRed);

  // Board rect from min/max of quad
  int minx = std::min(std::min(quad[0].x, quad[1].x), std::min(quad[2].x, quad[3].x));
  int maxx = std::max(std::max(quad[0].x, quad[1].x), std::max(quad[2].x, quad[3].x));
  int miny = std::min(std::min(quad[0].y, quad[1].y), std::min(quad[2].y, quad[3].y));
  int maxy = std::max(std::max(quad[0].y, quad[1].y), std::max(quad[2].y, quad[3].y));
  cv::Rect boardRect(minx, miny, std::max(1, maxx - minx), std::max(1, maxy - miny));

  return buildJSONResult(uri, true, conf, ordered, boardRect, pointsColors, barWhite, barRed);
}

static jsi::Value processImage(jsi::Runtime &rt, const jsi::Value &thisValue, const jsi::Value *args, size_t count) {
  if (count < 1 || !args[0].isString()) {
    return jsi::Value::null();
  }
  std::string uri = args[0].asString(rt).utf8(rt);

  cv::Mat bgr;
  if (!loadImageBGR(uri, bgr)) {
    std::string payload = buildJSONResult(uri, false, 0.0, {cv::Point2f(0,0),cv::Point2f(0,0),cv::Point2f(0,0),cv::Point2f(0,0)}, cv::Rect(0,0,0,0), std::vector<std::vector<std::string>>(24), 0, 0);
    return jsi::String::createFromUtf8(rt, payload);
  }

  cv::Mat gray;
  cv::cvtColor(bgr, gray, cv::COLOR_BGR2GRAY);

  std::vector<cv::Point> quad;
  bool ok = detectBoardQuad(gray, quad);
  if (!ok) {
    std::string payload = buildJSONResult(uri, false, 0.0, {cv::Point2f(0,0),cv::Point2f(0,0),cv::Point2f(0,0),cv::Point2f(0,0)}, cv::Rect(0,0,0,0), std::vector<std::vector<std::string>>(24), 0, 0);
    return jsi::String::createFromUtf8(rt, payload);
  }

  std::vector<cv::Point2f> ordered = orderCornersClockwise(quad);
  // Confidence heuristic: area ratio
  double area = fabs(cv::contourArea(quad));
  double conf = std::min(1.0, std::max(0.5, area / (bgr.cols * bgr.rows)));

  // Warp to canonical size (wide board)
  cv::Size canonicalSize(1000, 500);
  cv::Mat warped = warpBoard(bgr, ordered, canonicalSize);

  // Detect circular pieces and classify color
  std::vector<DetectedPiece> pieces;
  detectPieces(warped, pieces);

  // Map pieces to 24 points (simple geometric mapping)
  std::vector<std::vector<std::string>> pointsColors;
  int barWhite = 0, barRed = 0;
  mapPiecesToPoints(canonicalSize, pieces, pointsColors, barWhite, barRed);

  // Board rect from min/max of quad
  int minx = std::min(std::min(quad[0].x, quad[1].x), std::min(quad[2].x, quad[3].x));
  int maxx = std::max(std::max(quad[0].x, quad[1].x), std::max(quad[2].x, quad[3].x));
  int miny = std::min(std::min(quad[0].y, quad[1].y), std::min(quad[2].y, quad[3].y));
  int maxy = std::max(std::max(quad[0].y, quad[1].y), std::max(quad[2].y, quad[3].y));
  cv::Rect boardRect(minx, miny, std::max(1, maxx - minx), std::max(1, maxy - miny));

  std::string payload = buildJSONResult(uri, true, conf, ordered, boardRect, pointsColors, barWhite, barRed);
  return jsi::String::createFromUtf8(rt, payload);
}

extern "C" void installBackgammonCV(jsi::Runtime *rt) {
  auto &runtime = *rt;
  jsi::Object cv(runtime);
  cv.setProperty(
      runtime,
      "processImage",
      jsi::Function::createFromHostFunction(
          runtime,
          jsi::PropNameID::forAscii(runtime, "processImage"),
          1,
          processImage));
  runtime.global().setProperty(runtime, "BackgammonCV", std::move(cv));
}


