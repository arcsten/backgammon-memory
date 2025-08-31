#import <React/RCTBridge+Private.h>
#import <ReactCommon/CallInvoker.h>
#import <jsi/jsi.h>

using namespace facebook;

static jsi::Value evaluatePosition(jsi::Runtime &rt, const jsi::Value *args, size_t count) {
  auto encoded = std::string(args[0].asString(rt).utf8(rt));
  // Stub: return a simple object compatible with PositionAnalysis
  jsi::Object res(rt);
  res.setProperty(rt, "positionId", jsi::String::createFromAscii(rt, encoded.c_str()));
  jsi::Object chances(rt);
  chances.setProperty(rt, "win", 50.0);
  chances.setProperty(rt, "gammon", 10.0);
  chances.setProperty(rt, "backgammon", 2.0);
  res.setProperty(rt, "winningChances", chances);
  res.setProperty(rt, "evaluation", 0.0);
  res.setProperty(rt, "bestMoves", jsi::Array(rt, 0));
  res.setProperty(rt, "confidence", 0.5);
  return res;
}

static jsi::Value initEngine(jsi::Runtime &rt, const jsi::Value *args, size_t count) {
  return jsi::Value(true);
}

extern "C" void installWildBGEngine(jsi::Runtime *rt) {
  auto &runtime = *rt;
  jsi::Object engine(runtime);
  engine.setProperty(runtime, "init", jsi::Function::createFromHostFunction(runtime, jsi::PropNameID::forAscii(runtime, "init"), 1, initEngine));
  engine.setProperty(runtime, "evaluatePosition", jsi::Function::createFromHostFunction(runtime, jsi::PropNameID::forAscii(runtime, "evaluatePosition"), 1, evaluatePosition));
  runtime.global().setProperty(runtime, "WildBGEngine", std::move(engine));
}


