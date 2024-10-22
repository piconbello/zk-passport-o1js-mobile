Pod::Spec.new do |s|
  s.name           = 'CustomPassportReader'
  s.version        = '1.0.0'
  s.summary        = 'A sample project summary'
  s.description    = 'A sample project description'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '15.0' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  # s.dependency 'NFCPassportReader'

  s.subspec 'NFCPassportReader' do |ss|
    ss.source_files = 'NFCPassportReader/Sources/**/*.{swift}'
    ss.dependency "OpenSSL-Universal", '1.1.2301'
  end

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
  s.exclude_files = "NFCPassportReader/**/*"
end
