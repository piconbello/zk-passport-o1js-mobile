import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to CustomIosPassportReader.web.ts
// and on native platforms to CustomIosPassportReader.ts
import CustomIosPassportReaderModule from './src/CustomIosPassportReaderModule';
import { PassportData } from './src/CustomIosPassportReader.types';

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
export function getMRZKey(passportNumber: string, dateOfBirth: string, dateOfExpiry: string): String {
  return CustomIosPassportReaderModule.getMRZKey(passportNumber, dateOfBirth, dateOfExpiry);
}

/**
 * This function scans a passport using the provided MRZ key and returns the extracted passport data.
 *
 * @param mrzKey - The Machine Readable Zone (MRZ) key as a string.
 * 
 * @returns A Promise that resolves to the extracted passport data as a PassportData object.
 * */
export async function scanPassport(mrzKey: String): Promise<PassportData> {
  return await CustomIosPassportReaderModule.scanPassport(mrzKey);
}

export { PassportData };
