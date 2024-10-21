export type PassportData = {
  // dumpPassportData of NFCPasswordReader output
  // same as dataGroupsRead combined with AAChallenge and AASignature
  // each datagroup is exported as a base64EncodedString
  COM?: string,
  DG1?: string,
  DG2?: string,
  DG3?: string,
  DG4?: string,
  DG5?: string,
  DG6?: string,
  DG7?: string,
  DG8?: string,
  DG9?: string,
  DG10?: string,
  DG11?: string,
  DG12?: string,
  DG13?: string,
  DG14?: string,
  DG15?: string,
  DG16?: string,
  SOD?: string,
  Unknown?: string,

  AAChallenge: string,
  AASignature: string,

  openpassport: string | object, // output exactly same to that of OpenPassport. stringified on ios, map on android
}