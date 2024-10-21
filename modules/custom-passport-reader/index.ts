import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to CustomPassportReader.web.ts
// and on native platforms to CustomPassportReader.ts
import CustomPassportReaderModule from './src/CustomPassportReaderModule';
import { PassportData } from './src/CustomPassportReader.types';
import { pad, calcCheckSum } from './src/helpers';

/**
 * This function calculates and returns the Machine Readable Zone (MRZ) key for a given passport number,
 * date of birth, and date of expiry.
 *
 * @param passportNumber - The passport number as a string.
 * @param dateOfBirth - The date of birth in the format 'YYMMDD'.
 * @param dateOfExpiry - The date of expiry in the format 'YYMMDD'.
 *
 * @returns A string representing the calculated MRZ key.
 */
export function getMRZKey(passportNumber: string, dateOfBirth: string, dateOfExpiry: string): string {
  // Check out NFCPassPortReader/Examples/Example_SPM/Model/PassportUtils.swift

  // Pad fields if necessary
  const pptNr = pad(passportNumber, 9);
  const dob = pad(dateOfBirth, 6);
  const exp = pad(dateOfExpiry, 6);

  // Calculate checksums
  let passportNrChksum = calcCheckSum(pptNr)
  let dateOfBirthChksum = calcCheckSum(dob)
  let expiryDateChksum = calcCheckSum(exp)

  const mrzKey = `${pptNr}${passportNrChksum}${dob}${dateOfBirthChksum}${exp}${expiryDateChksum}`;

  return mrzKey;
  // return CustomPassportReaderModule.getMRZKey(passportNumber, dateOfBirth, dateOfExpiry);
}

/**
 * This function scans a passport using the provided MRZ key and returns the extracted passport data.
 *
 * @param mrzKey - The Machine Readable Zone (MRZ) key as a string.
 * 
 * @returns A Promise that resolves to the extracted passport data as a PassportData object.
 * */
export async function scanPassport(mrzKey: string): Promise<PassportData> {
  return await CustomPassportReaderModule.scanPassport(mrzKey);
}

export { PassportData };
