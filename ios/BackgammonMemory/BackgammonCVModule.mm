#import "BackgammonCVModule.h"
#import <React/RCTLog.h>

// Forward declaration from BackgammonCV.mm
std::string BackgammonCVProcessUri(const std::string &uri);

@implementation BackgammonCVModule

RCT_EXPORT_MODULE();

RCT_REMAP_METHOD(processImage,
                 processImageWithUri:(NSString *)uri
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  if (uri == nil || uri.length == 0) {
    reject(@"EINVAL", @"image uri is required", nil);
    return;
  }
  @try {
    std::string res = BackgammonCVProcessUri(std::string([uri UTF8String]));
    NSString *json = [NSString stringWithUTF8String:res.c_str()];
    resolve(json);
  } @catch (NSException *exception) {
    reject(@"EFAIL", exception.reason, nil);
  }
}

@end
