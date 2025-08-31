Pod::Spec.new do |s|
  s.name         = 'WildBGEngine'
  s.version      = '0.0.1'
  s.summary      = 'WildBG JSI wrapper and engine for iOS'
  s.homepage     = 'https://github.com/carsten-wenderdel/wildbg'
  s.license      = { :type => 'Apache-2.0' }
  s.author       = { 'BackgammonMemory' => 'support@backgammonmemory.com' }
  s.platforms    = { :ios => '13.0' }
  s.source       = { :path => '.' }

  s.source_files = 'WildBGEngine.mm'
  s.header_mappings_dir = '.'
  s.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'CLANG_CXX_LIBRARY' => 'libc++',
    'DEFINES_MODULE' => 'YES'
  }

  s.dependency 'React-Core'
  s.vendored_frameworks = 'WildBGXC/Wildbg.xcframework'
  s.pod_target_xcconfig = {
    'HEADER_SEARCH_PATHS' => '$(PODS_TARGET_SRCROOT)/WildBGXC/Wildbg.xcframework/ios-arm64/Headers $(PODS_TARGET_SRCROOT)/WildBGXC/Wildbg.xcframework/ios-arm64_x86_64-simulator/Headers',
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'CLANG_CXX_LIBRARY' => 'libc++'
  }
end


