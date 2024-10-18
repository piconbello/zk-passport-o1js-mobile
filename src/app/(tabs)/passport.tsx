import NfcManager from 'react-native-nfc-manager';
import * as Clipboard from 'expo-clipboard';

import { PassportData, getMRZKey, scanPassport } from "@/modules/custom-ios-passport-reader";
import React, { useCallback, useEffect, useRef, useState } from "react";

import tw from '@/tw';
import { FlatList, ScrollView, View } from 'react-native';
import dayjs from 'dayjs';
import { Button, Card, FAB, List, Text } from 'react-native-paper';
import { useToast } from 'react-native-paper-toast';
import base64 from 'react-native-base64'
import useRefMemo from '@/hooks/useRefMemo';
// import * as t from 'io-ts'
import 'tcomb-form-native-cr';
import t from 'tcomb-validation';
//@ts-ignore
const Form = t.form.Form;

const MRZData = t.struct({
  documentNumber: t.refinement(t.String, s => /^[A-Z0-9]{9}$/.test(s)),
  dateOfBirth: t.Date,
  dateOfExpiry: t.Date,
});
const formOptions = {
  label: 'Form label?',
  fields: {
    documentNumber: {
      placeholder: 'X12345678',
      autoCapitalize: 'characters',
      help: 'Input your document number (9 digits/letters)',
      error: 'Invallid document number (must be 9 digits/letters)',
    },
    dateOfBirth: {
      mode: 'single',
      minimumDate: dayjs().subtract(100, 'year').startOf('day').toDate(), 
      maximumDate: dayjs().startOf('day').toDate(),
    },
    dateOfExpiry: {
      mode: 'single',
      minimumDate: dayjs().subtract(10, 'year').startOf('day').toDate(),
      maximumDate: dayjs().add(10).startOf('day').toDate(),
    },
  }
}

// type MRZDataType = {
//   documentNumber: string;
//   dateOfBirth?: Date;
//   dateOfExpiry?: Date;
// }
type MRZFormProps = { setMRZKey: (mrzKey: string) => void };
function MRZFormComponent({ setMRZKey }: MRZFormProps) {
  const formRef = useRef();

  const handleSubmit = useCallback(() => {
    // @ts-ignore
    const isFormValid = formRef?.current?.getValue();
    if (!isFormValid) return;
    const { documentNumber, dateOfBirth, dateOfExpiry } = formRef.current?.getValue()!;
    setMRZKey(
      getMRZKey(
        documentNumber, 
        dayjs(dateOfBirth).format('YYMMDD'), 
        dayjs(dateOfExpiry).format('YYMMDD')
      )
    );
  }, []);

  return (
    <View style={tw`ml-6 mr-7`}>
      <Form
        ref={formRef}
        type={MRZData}
        options={formOptions}
      />
      <Button mode='contained' onPress={handleSubmit}>
        Calculate MRZ Key
      </Button>
    </View>
  );
}

type DataGroup = { dataGroupName: string, rawData: string, decodedData: string };
type ScannedDataGroupListProps = { scannedDataGroupList: [string, string][] };
function ScannedDataGroupList({ scannedDataGroupList }: ScannedDataGroupListProps) {
  const dataGroupList = useRefMemo(() => {
    return scannedDataGroupList.map(([key, value]) => ({
      dataGroupName: key,
      rawData: value,
      decodedData: base64.decode(value)
    }));
  }, [scannedDataGroupList]);
  // const keyExtractor = useCallback((item: DataGroup) => item.dataGroupName, []);

  if (scannedDataGroupList.length === 0) return <Text>No scanned data found</Text>;

  return (
    <>
      {
        dataGroupList.map((item, index) => (
          <Card key={item.dataGroupName}>
           <Card.Title title={item.dataGroupName} subtitle={item.rawData} />
           <Card.Content>
             <Text variant='bodySmall' style={tw`font-mono`}>
               {item.decodedData}
             </Text>
           </Card.Content>
         </Card>
        ))
      }
    </>
  )
  // return (
  //   <FlatList
  //     data={dataGroupList}
  //     keyExtractor={keyExtractor}
  //     renderItem={({ item }) => (
  //       <Card>
  //         <Card.Title title={item.dataGroupName} subtitle={item.rawData} />
  //         <Card.Content>
  //           <Text variant='bodySmall' style={tw`font-mono`}>
  //             {item.decodedData}
  //           </Text>
  //         </Card.Content>
  //       </Card>
  //     )}
  //   />
  // );
}

type ExportButtonProps = { mrzKey: string, scannedDataGroupList: [string, string][], openPassportData: any };
function ExportButton({ mrzKey, scannedDataGroupList, openPassportData }: ExportButtonProps) {
  const toaster = useToast();

  const handleExport = useCallback(() => {
    const jsonString = JSON.stringify({ 
      mrzKey, scannedDataGroupList, openPassportData 
    }, null, 2);
    Clipboard.setStringAsync(jsonString)
      .then(() => {
        toaster.show({ type: 'success', message: 'All data copied to clipboard' });
      }).catch((e) => {
        toaster.show({ type: 'error', message: `Failed to copy to clipboard: ${e.message}` });
        console.log(e);
      })
  }, [mrzKey, scannedDataGroupList, openPassportData]);

  return (
    <FAB icon='content-copy' variant="secondary" size='small' mode='elevated'
      label='Copy All' onPress={handleExport}
      style={tw`absolute left-4 bottom-2 rounded-full`}
    />
  );
}

type ScanButtonProps = { mrzKey: string, onPassportScanned: (data: any)=>void };
function ScanButton({ mrzKey, onPassportScanned }: ScanButtonProps) {
  const toaster = useToast();

  const [nfcSupported, setNFCSupported] = useState<boolean | undefined>();
  const [nfcEnabled, setNFCEnabled] = useState<boolean | undefined>();

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

  const handlePress = useCallback(() => {
    if (!mrzKey) return;
    console.log('Scanning passport NFC...');
    scanPassport(mrzKey)
      .then(onPassportScanned)
      .catch(e => {
        toaster.show({ type: 'error', message: `Failed to scan passport: ${e.message}` });
        console.log(e);
      });
  }, [mrzKey, onPassportScanned]);

  const isDisabled = !nfcEnabled || !mrzKey;
  const label = nfcSupported === false ? 'No NFC' 
    : nfcEnabled === false? 'NFC Unabled' 
    : 'Scan Passport NFC'

  return (
    <FAB icon="cellphone-nfc" variant="primary" size='small' mode="elevated"
      style={tw`absolute right-4 bottom-2 rounded-full`}
      disabled={isDisabled} label={label} onPress={handlePress}
    />
  );
}

export default function TabPassportScan() {
  const [mrzKey, setMRZKey] = useState("");
  const [scannedDataGroupList, setScannedDataGroupList] = useState<[string, string][]>([]);
  const [openPassportData, setopenPassportData] = useState<PassportData>();
  const handlePassportScanned = useCallback(async ({
    openpassport,
    ...nextScannedDataGroupList
  }: PassportData) => {
    setScannedDataGroupList(
      Object.entries(nextScannedDataGroupList
        ).sort(([a], [b]) => a.localeCompare(b)));
    try {
      const nextopenPassportData = JSON.parse(openpassport);
      setopenPassportData(nextopenPassportData);
    } catch (err) {
      console.log(err);
    }
  }, [setScannedDataGroupList, setopenPassportData]);
  const [expandedId, setExpandedId] = useState<string | number>("mrz");
  const handleAccordionPress = useCallback((id: string | number) => {
    setExpandedId(prev => prev === id? '' : id);
  }, []);

  return (
    <>
      <ScrollView>
        <List.AccordionGroup expandedId={expandedId} onAccordionPress={handleAccordionPress}>
          <List.Accordion title={`MRZ Key: ${mrzKey}`} id="mrz">
            <MRZFormComponent setMRZKey={setMRZKey} />
          </List.Accordion>
          <List.Accordion title={scannedDataGroupList.length === 0 ? 'Not scanned yet' : `${scannedDataGroupList.map(([k,v])=>k).join(', ')}`} id="scannedDataGroupList">
            <ScannedDataGroupList scannedDataGroupList={scannedDataGroupList} />
          </List.Accordion>
          <List.Accordion title="Open Passport Formatted Data" id="openPassportData">
            <Text variant='bodySmall' style={tw`font-mono`}>
              {JSON.stringify(openPassportData, null, 2)}
            </Text>
          </List.Accordion>
        </List.AccordionGroup>
      </ScrollView>
      <ScanButton mrzKey={mrzKey} onPassportScanned={handlePassportScanned} />
      <ExportButton mrzKey={mrzKey} scannedDataGroupList={scannedDataGroupList} openPassportData={openPassportData} />
    </>
  )
}