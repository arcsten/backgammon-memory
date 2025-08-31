//
//  Use this file to import your target's public headers that you would like to expose to Swift.
//

#ifdef __cplusplus
namespace facebook { namespace jsi { class Runtime; }}
extern "C" void installWildBGEngine(facebook::jsi::Runtime *rt);
extern "C" void installBackgammonCV(facebook::jsi::Runtime *rt);
#endif