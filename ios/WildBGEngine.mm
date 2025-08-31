#import <React/RCTBridge+Private.h>
#import <ReactCommon/CallInvoker.h>
#import <jsi/jsi.h>
#import "WildBGXC/Wildbg.xcframework/ios-arm64/Headers/wildbg.h"

using namespace facebook;

static jsi::Value evaluatePosition(jsi::Runtime &rt, const jsi::Value &thisValue, const jsi::Value *args, size_t count) {
  // Arg0: encoded string with counts per point in order 1..24,bar/bearoff ignored
  // Build pips[26] as required by wildbg-c: idx 25=player bar, idx0=opponent bar, 1..24 point counts (player+ / opponent-)
  int pips[26] = {0};
  // Simple parser: BM|w,r;w,r;...|bar:w,r|bear:...|turn:x
  std::string s = std::string(args[0].asString(rt).utf8(rt));
  size_t bodyStart = s.find("BM|");
  if (bodyStart != std::string::npos) {
    bodyStart += 3;
    size_t bodyEnd = s.find("|", bodyStart);
    std::string body = s.substr(bodyStart, bodyEnd - bodyStart);
    // points 1..24
    int idx = 1;
    size_t pos = 0;
    while (pos < body.size() && idx <= 24) {
      size_t next = body.find(';', pos);
      std::string token = body.substr(pos, next == std::string::npos ? std::string::npos : next - pos);
      size_t comma = token.find(',');
      int w = 0, r = 0;
      if (comma != std::string::npos) {
        try { w = std::stoi(token.substr(0, comma)); } catch (...) { w = 0; }
        try { r = std::stoi(token.substr(comma + 1)); } catch (...) { r = 0; }
      }
      pips[idx] = w - r; // player positive, opponent negative
      idx++;
      if (next == std::string::npos) break;
      pos = next + 1;
    }
  }

  Wildbg *engine = wildbg_new();
  CProbabilities probs = probabilities(engine, &pips);
  wildbg_free(engine);

  jsi::Object res(rt);
  res.setProperty(rt, "positionId", jsi::String::createFromAscii(rt, s.c_str()));
  jsi::Object chances(rt);
  chances.setProperty(rt, "win", (double)probs.win);
  chances.setProperty(rt, "gammon", (double)(probs.win_g * 100.0));
  chances.setProperty(rt, "backgammon", (double)(probs.win_bg * 100.0));
  res.setProperty(rt, "winningChances", chances);
  res.setProperty(rt, "evaluation", 0.0);
  res.setProperty(rt, "bestMoves", jsi::Array(rt, 0));
  res.setProperty(rt, "confidence", 0.6);
  return res;
}

static jsi::Value initEngine(jsi::Runtime &rt, const jsi::Value &thisValue, const jsi::Value *args, size_t count) {
  return jsi::Value(true);
}

extern "C" void installWildBGEngine(jsi::Runtime *rt) {
  auto &runtime = *rt;
  jsi::Object engine(runtime);
  engine.setProperty(runtime, "init", jsi::Function::createFromHostFunction(runtime, jsi::PropNameID::forAscii(runtime, "init"), 1, initEngine));
  engine.setProperty(runtime, "evaluatePosition", jsi::Function::createFromHostFunction(runtime, jsi::PropNameID::forAscii(runtime, "evaluatePosition"), 1, evaluatePosition));
  runtime.global().setProperty(runtime, "WildBGEngine", std::move(engine));
}


