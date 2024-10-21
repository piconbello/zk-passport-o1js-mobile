### NFC Passport Reader (PACE / 9303)


Android sources are a derivative of
(tananaev/passport-reader)[https://github.com/tananaev/passport-reader] 
and
(zk-passport/openpassport/app/android/react-native-passport-reader/android
)[https://github.com/zk-passport/openpassport/blob/main/app/android/react-native-passport-reader/android/]
* these use JMRTD as the core (9303 implementation).

IOS sources are a derivative of
(AndyQ/NFCPassportReader/Examples/Example_SPM
/NFCPassportReaderApp)[https://github.com/AndyQ/NFCPassportReader/tree/main/Examples/Example_SPM/NFCPassportReaderApp]
and
(zk-passport/openpassport/app/ios
/PassportReader.swift
)[https://github.com/zk-passport/openpassport/blob/main/app/ios/PassportReader.swift]
* these use AndyQ/NFCPassportReader as the core (9303 implementation).

In the future, we can:
* Remove both deps use a C++ source such as [OpenPACE](https://frankmorgner.github.io/openpace/) and link via react native turbomodules.
* Reduce native code, move validation etc. to javascript
* Completely remove both dependencies and implement PACE in javascript.
* Refer to [AndyQ/NFCPassportReader/issues/119](https://github.com/AndyQ/NFCPassportReader/issues/119) for an interesting case.