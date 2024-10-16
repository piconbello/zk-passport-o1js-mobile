import ExpoModulesCore
import NFCPassportReader

public class CustomIosPassportReaderModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('CustomIosPassportReader')` in JavaScript.
    Name("CustomIosPassportReader")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    // Constants([
    //   "PI": Double.pi
    // ])

    // We expect dateOfBirth, dateOfExpiry etc as YYMMdd
    Function("getMRZKey") { (passportNumber: String, dateOfBirth: String, dateOfExpiry: String) -> String in
      // Check out NFCPassPortReader/Examples/Example_SPM/Model/PassportUtils.swift

      // Pad fields if necessary
      let pptNr = pad( passportNumber, fieldLength:9)
      let dob = pad( dateOfBirth, fieldLength:6)
      let exp = pad( dateOfExpiry, fieldLength:6)
      
      // Calculate checksums
      let passportNrChksum = calcCheckSum(pptNr)
      let dateOfBirthChksum = calcCheckSum(dob)
      let expiryDateChksum = calcCheckSum(exp)

      let mrzKey = "\(pptNr)\(passportNrChksum)\(dob)\(dateOfBirthChksum)\(exp)\(expiryDateChksum)"
      
      return mrzKey
    }

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    AsyncFunction("scanPassport") { (mrzKey: String, promise: Promise) in

      // Check out NFCPassPortReader/Examples/Example_SPM/Views/MainView.swift
      //  and https://github.com/zk-passport/openpassport/blob/main/app/ios/PassportReader.swift
      hideKeyboard()

      let masterListURL = Bundle.main.url(forResource: "masterList", withExtension: ".pem")!
        passportReader.setMasterListURL( masterListURL )

      // Set whether to use the new Passive Authentication verification method (default true) or the old OpenSSL CMS verifiction
      passportReader.passiveAuthenticationUsesOpenSSL = !settings.useNewVerificationMethod
      
      // If we want to read only specific data groups we can using:
      //   let dataGroups : [DataGroupId] = [.COM, .SOD, .DG1, .DG2, .DG7, .DG11, .DG12, .DG14, .DG15]
      //   passportReader.readPassport(mrzKey: mrzKey, tags:dataGroups, completed: { (passport, error) in

      Task {
        let customMessageHandler : (NFCViewDisplayMessage)->String? = { (displayMessage) in
          switch displayMessage {
            case .requestPresentPassport:
              return "Hold your iPhone near an NFC enabled passport."
            default:
              // Return nil for all other messages so we use the provided default
              return nil
          }
        }
        
        do {
          let passport = try await passportReader.readPassport( mrzKey: mrzKey, useExtendedMode: false,  customDisplayMessage:customMessageHandler)
          let dump = passport.dumpPassportData(selectedDataGroups: DataGroupId.allCases, includeActiveAuthenticationData: true)

          var ret = [String:String]()
          // print("documentType", passport.documentType)

          ret["documentType"] = passport.documentType
          ret["documentSubType"] = passport.documentSubType
          ret["documentNumber"] = passport.documentNumber
          ret["issuingAuthority"] = passport.issuingAuthority
          ret["documentExpiryDate"] = passport.documentExpiryDate
          ret["dateOfBirth"] = passport.dateOfBirth
          ret["gender"] = passport.gender
          ret["nationality"] = passport.nationality
          ret["lastName"] = passport.lastName
          ret["firstName"] = passport.firstName
          ret["passportMRZ"] = passport.passportMRZ
          ret["placeOfBirth"] = passport.placeOfBirth
          ret["residenceAddress"] = passport.residenceAddress
          ret["phoneNumber"] = passport.phoneNumber
          ret["personalNumber"] = passport.personalNumber

          let passportPhotoData = passport.passportPhoto // [UInt8]
          if let passportPhotoData = passport.passportPhoto {
            let data = Data(passportPhotoData)
            let base64String = data.base64EncodedString()
            
            ret["passportPhoto"] = base64String 
          }

          // documentSigningCertificate
          // countrySigningCertificate

          if let serializedDocumentSigningCertificate = serializeX509Wrapper(passport.documentSigningCertificate) {
            ret["documentSigningCertificate"] = serializedDocumentSigningCertificate
          }

          if let serializedCountrySigningCertificate = serializeX509Wrapper(passport.countrySigningCertificate) {
            ret["countrySigningCertificate"] = serializedCountrySigningCertificate
          }
          // print("passport.documentSigningCertificate", passport.documentSigningCertificate)
          // print("passport.countrySigningCertificate", passport.countrySigningCertificate)

          ret["LDSVersion"] = passport.LDSVersion
          ret["dataGroupsPresent"] = passport.dataGroupsPresent.joined(separator: ", ")

          // print("passport.LDSVersion", passport.LDSVersion)

          // ret["dataGroupsAvailable"] = passport.dataGroupsAvailable.map(dataGroupIdToString)

          // print("passport.dataGroupsAvailable", passport.dataGroupsAvailable)
          // print("passport.dataGroupsRead", passport.dataGroupsRead)
          // print("passport.dataGroupHashes", passport.dataGroupHashes)

          // do {
          //   let dataGroupsReadData = try JSONSerialization.data(withJSONObject: passport.dataGroupsRead.mapValues { self.convertDataGroupToSerializableFormat($0) }, options: [])
          //   let dataGroupsReadJsonString = String(data: dataGroupsReadData, encoding: .utf8) ?? ""
          //   ret["dataGroupsRead"] = dataGroupsReadJsonString
          // } catch {
          //   print("Error serializing dataGroupsRead: \(error)")
          // }

          // ret["dataGroupsRead"] = passport.dataGroupsRead.mapValues { convertDataGroupToSerializableFormat($0) }
          do {
              let dataGroupHashesDict = passport.dataGroupHashes.mapKeys { "\($0)" }
              let serializableDataGroupHashes = dataGroupHashesDict.mapValues { convertDataGroupHashToSerializableFormat($0) }
              let dataGroupHashesData = try JSONSerialization.data(withJSONObject: serializableDataGroupHashes, options: [])
              let dataGroupHashesJsonString = String(data: dataGroupHashesData, encoding: .utf8) ?? ""
              ret["dataGroupHashes"] = dataGroupHashesJsonString
          } catch {
              print("Error serializing dataGroupHashes: \(error)")
          }


          // cardAccess
          // BACStatus
          // PACEStatus
          // chipAuthenticationStatus
          ret["passportCorrectlySigned"] = String(passport.passportCorrectlySigned)
          ret["documentSigningCertificateVerified"] = String(passport.documentSigningCertificateVerified)
          ret["passportDataNotTampered"] = String(passport.passportDataNotTampered)
          ret["activeAuthenticationPassed"] = String(passport.activeAuthenticationPassed)
          ret["activeAuthenticationChallenge"] = encodeByteArrayToHexString(passport.activeAuthenticationChallenge)
          ret["activeAuthenticationSignature"] = encodeByteArrayToHexString(passport.activeAuthenticationSignature)
          ret["verificationErrors"] = encodeErrors(passport.verificationErrors).joined(separator: ", ")

          ret["isPACESupported"] = String(passport.isPACESupported)
          ret["isChipAuthenticationSupported"] = String(passport.isChipAuthenticationSupported)

          // passportImage
          // signatureImage

          // activeAuthenticationSupported

          // print("passport.certificateSigningGroups", passport.certificateSigningGroups)

          // ret["certificateSigningGroups"] = passport.certificateSigningGroups.mapKeys(certificateTypeToString).mapValues(encodeX509WrapperToJsonString)
          // if let passportDataElements = passport.passportDataElements {
          //   ret["passportDataElements"] = passportDataElements
          // } else {
          //   ret["passportDataElements"] = [:]
          // }

          do {
            let sod = passport.getDataGroup(DataGroupId.SOD) as! SOD

            // ret["concatenatedDataHashes"] = try sod.getEncapsulatedContent().base64EncodedString() // this is what we call concatenatedDataHashes, not the true eContent
            ret["eContentBase64"] = try sod.getEncapsulatedContent().base64EncodedString() // this is what we call concatenatedDataHashes, not the true eContent

            ret["signatureAlgorithm"] = try sod.getSignatureAlgorithm()
            ret["encapsulatedContentDigestAlgorithm"] = try sod.getEncapsulatedContentDigestAlgorithm()
            
            let messageDigestFromSignedAttributes = try sod.getMessageDigestFromSignedAttributes()
            let signedAttributes = try sod.getSignedAttributes()
            // print("messageDigestFromSignedAttributes", messageDigestFromSignedAttributes)

            ret["signedAttributes"] = signedAttributes.base64EncodedString()
            // if let pubKey = convertOpaquePointerToSecKey(opaquePointer: sod.pubKey),
            //   let serializedPublicKey = serializePublicKey(pubKey) {
            //     ret["publicKeyBase64"] = serializedPublicKey
            // } else {
            //     // Handle the case where pubKey is nil
            // }

            if let serializedSignature = serializeSignature(from: sod) {
              ret["signatureBase64"] = serializedSignature
            }

          } catch {
            // print("Error serializing SOD data: \(error)")
            promise.reject("E_PASSPORT_READ", error.localizedDescription, error)
          }

          let stringified = String(data: try JSONEncoder().encode(ret), encoding: .utf8)

          dict["openpassport"] = ret
          promise.resolve(dict)
        } catch {
          promise.reject("E_PASSPORT_READ", error.localizedDescription, error)
        }
      }
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { (value: String) in
      // Send an event to JavaScript.
      self.sendEvent("onChange", [
        "value": value
      ])
    }
  }
}
