import NfcManager from 'react-native-nfc-manager';
import * as Clipboard from 'expo-clipboard';

import { Button, ButtonText, ButtonSpinner, ButtonIcon } from '@/components/ui/button';
import { InputIcon, InputSlot, Input, InputField } from '@/components/ui/input';
import { FormControl, FormControlLabel, FormControlLabelText, FormControlHelper, FormControlHelperText, FormControlError, FormControlErrorIcon, FormControlErrorText } from '@/components/ui/form-control';
import { Accordion, AccordionHeader, AccordionIcon, AccordionItem, AccordionTitleText, AccordionTrigger, AccordionContent, AccordionContentText } from "@/components/ui/accordion";
import { Divider } from "@/components/ui/divider";
import { AlertCircleIcon, ChevronDownIcon, ChevronUpIcon } from "@/components/ui/icon";
import { SmartphoneNfcIcon, ClipboardCopyIcon } from "lucide-react-native";

import { Table, TableBody, TableHead, TableHeader, TableRow, TableData } from "@/components/ui/table";
import { VStack } from "@/components/ui/vstack";
import { PassportData, getMRZKey, scanPassport } from "@/modules/custom-ios-passport-reader";
import React, { useCallback, useEffect, useState } from "react";
import { Fab, FabIcon, FabLabel } from '@/components/ui/fab';
import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast';
const _initialMRZData = {
  documentNumber: '',
  dateOfBirth: '',
  dateOfExpiry: ''
};
const MRZDataRegex = {
  documentNumber: /^[A-Z0-9]{9}$/,
  dateOfBirth: /^[0-9]{2}(?:10|11|12|0[1-9])[0-3][1-9]/,
  // YYMMDD format,
  dateOfExpiry: /^[0-9]{2}(?:10|11|12|0[1-9])[0-3][1-9]/
};
const _initialInvalid = {
  documentNumber: false,
  dateOfBirth: false,
  dateOfExpiry: false
};

function ExportButton({ mrzKey, scannedData, openPassportData }:{mrzKey:any,scannedData:any,openPassportData:any}) {
  
  const toast = useToast();

  const handlePress = useCallback(() => {
    const str = JSON.stringify({ mrzKey, scannedData, openPassportData }, null, 2);
    Clipboard.setStringAsync(str)
      .then(() => ({ action: 'success', message: "All data copied to clipboard", title: 'Success' }))
      .catch(e => ({ action: 'error', message: e.message || "Failed to copy to clipboard", title: 'Failed' }))
      .then((res) => toast.show({
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action={res.action as 'success' | 'error'} variant="outline">
            <ToastTitle>{res.title}</ToastTitle>
            <ToastDescription>
              {res.message}
            </ToastDescription>
          </Toast>
        )
      }));
  }, [mrzKey, scannedData, openPassportData]);

  return (
    <Fab size="sm" placement="bottom left" onPress={handlePress}>
      <FabIcon as={ClipboardCopyIcon} />
      <FabLabel>Copy All to Clipboard</FabLabel>
    </Fab>
  )
}

function ScanButton({ mrzKey, handlePassportScanned }: { mrzKey?: string, handlePassportScanned: (any)=>void}) {
  const [nfcSupported, setNFCSupported] = useState<boolean | undefined>();
  const [nfcEnabled, setNFCEnabled] = useState<boolean | undefined>();
  const toast = useToast();

  useEffect(() => {
    NfcManager.isSupported()
     .then((isSupported) => setNFCSupported(isSupported))
     .catch(() => setNFCSupported(false));
  }, [])

  useEffect(() => {
    if (!nfcSupported) return;
    NfcManager.isEnabled()
     .then(setNFCEnabled)
     .catch(() => setNFCEnabled(false));
  }, [nfcSupported]);

  console.log({ nfcEnabled, nfcSupported, mrzKey })
  const handlePress = useCallback(() => {
    if (!mrzKey) return;
    console.log('Scanning passport NFC...');
    scanPassport(mrzKey)
      .then(handlePassportScanned)
      .catch(error => {
        toast.show({
          render: ({ id }) => (
            <Toast nativeID={`toast-${id}`} action="error" variant="solid">
              <ToastTitle>{error.code || "Failed"}</ToastTitle>
              <ToastDescription>
                {error.message || "Failed to scan passport"}
              </ToastDescription>
            </Toast>
          )
        })
      })
  }, [mrzKey, handlePassportScanned]);

  return (
    <Fab size="sm" placement="bottom right" isDisabled={!nfcEnabled || !mrzKey} onPress={handlePress}>
      <FabIcon as={SmartphoneNfcIcon} />
      <FabLabel>
        {
          nfcSupported === false ? 'NFC not supported' 
            : nfcEnabled === false? 'NFC not enabled' 
            : 'Scan Passport NFC'
        }
      </FabLabel>
    </Fab>
  )
}

function MRZForm({
  setMRZKey
}: {
  setMRZKey: (mrzKey: string) => void;
}) {
  const [mrzData, setMRZData] = React.useState(_initialMRZData);
  const [invalid, setInvalid] = React.useState(_initialInvalid);
  const mrzDataChangeHandler = useCallback((key: string) => (e: any) => {
    setMRZData(prevMRZData => ({
      ...prevMRZData,
      [key]: e.nativeEvent.text
    }));
  }, [setMRZData]);
  const handleSubmit = useCallback(() => {
    let nextInvalid = {
      ..._initialInvalid
    };
    nextInvalid.documentNumber = !MRZDataRegex.documentNumber.test(mrzData.documentNumber);
    nextInvalid.dateOfBirth = !MRZDataRegex.dateOfBirth.test(mrzData.dateOfBirth);
    nextInvalid.dateOfExpiry = !MRZDataRegex.dateOfExpiry.test(mrzData.dateOfExpiry);
    setInvalid(nextInvalid);
    if (!Object.values(nextInvalid).some(Boolean)) {
      setMRZKey(getMRZKey(mrzData.documentNumber, mrzData.dateOfBirth, mrzData.dateOfExpiry));
    }
  }, [mrzData, setMRZKey, setInvalid]);
  // Create a form to input document number, date of birth, and expiration date

  return <VStack className="w-full" space="lg">
    <FormControl isInvalid={invalid.documentNumber} size={"lg"} isRequired>
      <FormControlLabel>
        <FormControlLabelText>Passport Number</FormControlLabelText>
      </FormControlLabel>

      <Input size={"xl"} variant={"outline"} isInvalid={invalid.documentNumber} isRequired className='w-full'>
        <InputField onChange={mrzDataChangeHandler('documentNumber')} value={mrzData.documentNumber} placeholder="XX123456" />
      </Input>

      <FormControlHelper>
        <FormControlHelperText>
          First 9 characters of the passport number. (Pad?)
        </FormControlHelperText>
      </FormControlHelper>

      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>
          Must be 9 uppercase characters letters and numbers.
        </FormControlErrorText>
      </FormControlError>
    </FormControl>

    <FormControl isInvalid={invalid.dateOfBirth} size={"lg"} isRequired>
      <FormControlLabel>
        <FormControlLabelText>Date of Birth</FormControlLabelText>
      </FormControlLabel>

      <Input size={"xl"} variant={"outline"} isInvalid={invalid.dateOfBirth} isRequired>
        <InputField onChange={mrzDataChangeHandler('dateOfBirth')} value={mrzData.dateOfBirth} placeholder="YYMMDD" />
      </Input>

      <FormControlHelper>
        <FormControlHelperText>
          Instead of 1990/01/13 write 900113.
        </FormControlHelperText>
      </FormControlHelper>

      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>
          Must be 6 digits in YYMMDD format.
        </FormControlErrorText>
      </FormControlError>
    </FormControl>

    <FormControl isInvalid={invalid.dateOfExpiry} size={"lg"} isRequired>
      <FormControlLabel>
        <FormControlLabelText>Date of Expiry</FormControlLabelText>
      </FormControlLabel>

      <Input size={"xl"} variant={"outline"} isInvalid={invalid.dateOfExpiry} isRequired>
        <InputField onChange={mrzDataChangeHandler('dateOfExpiry')} value={mrzData.dateOfExpiry} placeholder="YYMMDD" />
      </Input>

      <FormControlHelper>
        <FormControlHelperText>
          Instead of 2030/01/13 write 300113.
        </FormControlHelperText>
      </FormControlHelper>

      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>
          Must be 6 digits in YYMMDD format.
        </FormControlErrorText>
      </FormControlError>
    </FormControl>

    <Button action={"primary"} variant={"solid"} size={"xl"} isDisabled={false} onPress={handleSubmit}>
      <ButtonText>Calculate MRZ Key</ButtonText>
    </Button>
  </VStack>;
}
function ScannedDataList({
  scannedData
}: {
  scannedData: [string, string][];
}) {
  return <Table className="w-full">
    <TableHeader>
      <TableRow>
        <TableHead>DG</TableHead>
        <TableHead>Data</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {scannedData.map(([dg, data]) => <TableRow key={dg}>
        <TableData>{dg}</TableData>
        <TableData>{data}</TableData>
      </TableRow>)}
    </TableBody>
  </Table>;
}
function OpenPassportData({
  openPassportData
}: {
  openPassportData: any;
}) {
  return <AccordionContentText className='font-mono'>
    {JSON.stringify(openPassportData, null, 2)}
  </AccordionContentText>;
}
const _defaultAccordionItem = ['mrz'];
export default function TabPassportScan() {
  const [mrzKey, setMRZKey] = useState("");
  const [scannedData, setScannedData] = useState<[string, string][]>([]);
  const [openPassportData, setopenPassportData] = useState<any>(null);
  const handlePassportScanned = useCallback(async ({
    openpassport,
    ...nextScannedData
  }: PassportData) => {
    setScannedData(Object.entries(nextScannedData).sort(([a], [b]) => a.localeCompare(b)));
    try {
      const nextopenPassportData = JSON.parse(openpassport);
      setopenPassportData(nextopenPassportData);
    } catch (err) {
      console.log(err);
    }
  }, [setScannedData, setopenPassportData]);
  return (
    <>
      <Accordion size="lg" variant="filled" type="single" isCollapsible defaultValue={_defaultAccordionItem}>
        <AccordionItem value="mrz">
          <AccordionHeader>
            <AccordionTrigger>
              {({
                isExpanded
              }) => <>
                  <AccordionTitleText>
                    MRZ Key: {mrzKey}
                  </AccordionTitleText>
                  <AccordionIcon as={isExpanded ? ChevronUpIcon : ChevronDownIcon} className="ml-3" />
                </>}
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>
            <MRZForm setMRZKey={setMRZKey} />
          </AccordionContent>
        </AccordionItem>

        <Divider />

        <AccordionItem value="scannedData" isDisabled={!scannedData}>
          <AccordionHeader>
            <AccordionTrigger>
              {({
                isExpanded
              }) => <>
                  <AccordionTitleText>
                    ScannedData: {scannedData.map(a => a[0]).join(', ')}
                  </AccordionTitleText>
                  <AccordionIcon as={isExpanded ? ChevronUpIcon : ChevronDownIcon} className="ml-3" />
                </>}
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>
            <ScannedDataList scannedData={scannedData} />
          </AccordionContent>
        </AccordionItem>

        <Divider />

        <AccordionItem value="openpassport" isDisabled={!scannedData}>
          <AccordionHeader>
            <AccordionTrigger>
              {({
                isExpanded
              }) => <>
                  <AccordionTitleText>
                    openpassport formatted data
                  </AccordionTitleText>
                  <AccordionIcon as={isExpanded ? ChevronUpIcon : ChevronDownIcon} className="ml-3" />
                </>}
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>
            <OpenPassportData openPassportData={openPassportData} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <ScanButton 
        mrzKey={mrzKey}
        handlePassportScanned={handlePassportScanned} 
      />
      <ExportButton 
        mrzKey={mrzKey}
        openPassportData={openPassportData}
        scannedData={scannedData}
      />
    </>
  );
}