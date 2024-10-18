import NfcManager from 'react-native-nfc-manager';
import * as Clipboard from 'expo-clipboard';

import { PassportData, getMRZKey, scanPassport } from "@/modules/custom-ios-passport-reader";
import React, { useCallback, useEffect, useRef, useState } from "react";

import tw from '@/tw';
import { ScrollView, TextInput } from 'react-native';
import { Button, Collapse, DatePicker, Form, Input, List, Tag, Toast, View, WingBlank } from '@ant-design/react-native';
import dayjs from 'dayjs';
import DatePickerInput from '@/components/DatePickerInput';


type MRZDataType = {
  documentNumber: string;
  dateOfBirth?: Date;
  dateOfExpiry?: Date;
}
const normalizers = {
  documentNumber: (s) => s.toUpperCase().replace(/[^A-Z0-9]/g, ''),
  // dateOfBirth: (s) => dayjs(s, 'YYYY-MM-DD', true).isValid()? dayjs(s, 'YYYY-MM-DD').format('YYYYMMDD') : '',
  // dateOfExpiry: (s) => s.replace(/[^0-9]/g, '')
}
type MRZFormProps = { setMRZKey: (mrzKey: string) => void };
function MRZForm({ setMRZKey }: MRZFormProps) {
  const [form] = Form.useForm<MRZDataType>();

  const handleFinish = useCallback((values: MRZDataType) => setMRZKey(
    getMRZKey(
      values.documentNumber, 
      dayjs(values.dateOfBirth).format('YYMMDD'), 
      dayjs(values.dateOfExpiry).format('YYMMDD')
    )
  ), []);

  const normalizeDocumentNumber = useCallback((value: string) => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }, []);

  return (
    <Form 
      form={form}
      name="mrzForm"
      onFinish={handleFinish}
      layout='horizontal'
    >
      <Form.Item<MRZDataType>
        name="documentNumber"
        label="Document Number"
        rules={[
          { required: true, message: 'Please input your document number!' },
          { pattern: /^[A-Z0-9]{9}$/, message: 'Invalid document number' }
        ]}
        normalize={normalizeDocumentNumber}
      >
        <Input
          type='text'
          maxLength={9}
          placeholder="X12345678"
        />
      </Form.Item>
      <Form.Item<MRZDataType>
        name="dateOfBirth"
        label="Date of Birth"
        rules={[
          { required: true, message: 'Please input your date of birth!' },
        ]}
      >
        <DatePicker
          precision='day'
          format="YYYY/MM/DD" 
          minDate={new Date(1900, 0, 1)}
          maxDate={new Date()}
        >
          <DatePickerInput placeholder='potato' />
        </DatePicker>
      </Form.Item>
      <Form.Item<MRZDataType>
        name="dateOfExpiry"
        label="Date of Expiry"
        rules={[
          { required: true, message: 'Please input your date of expiry!' },
        ]}
      >
        <DatePicker 
          precision='day'
          format="YYYY/MM/DD" 
          minDate={dayjs().subtract(20, 'year').startOf('day').toDate()}
          maxDate={dayjs().add(10, 'year').startOf('day').toDate()}
        >
          <DatePickerInput/>
        </DatePicker>
      </Form.Item>

      <Form.Item>
        <Button type="primary" onPress={() => form.submit()}>
          Calculate MRZ Key
        </Button>
      </Form.Item>
    </Form>
  );
}

type ScannedDataListProps = { scannedDataList: [string, string][] };
function ScannedDataList({ scannedDataList }: ScannedDataListProps) {
  return (
    <List>
      {scannedDataList.map(([key, value]) => (
        <List.Item key={key} wrap
          thumb={<Tag small style={tw`font-bold`}>{key}</Tag>}
        >
          {value}
        </List.Item>
      ))}
    </List>
  );
}


type ExportButtonProps = { mrzKey: string, scannedDataList: [string, string][], openPassportData: any };
function ExportButton({ mrzKey, scannedDataList, openPassportData }: ExportButtonProps) {
  const handleExport = useCallback(() => {
    const jsonString = JSON.stringify({ 
      mrzKey, scannedDataList, openPassportData 
    }, null, 2);
    Clipboard.setStringAsync(jsonString)
      .then(() => {
        Toast.success({ content: 'All data copied to clipboard' });
      }).catch((e) => {
        Toast.fail({ content: `Failed to copy to clipboard: ${e.message}` });
        console.log(e);
      })
  }, [mrzKey, scannedDataList, openPassportData]);

  return (
    <Button type="ghost" onPress={handleExport}
      style={tw`absolute left-4 bottom-2 rounded-full`}
    >
      Copy All
    </Button>
  );
}


type ScanButtonProps = { mrzKey: string, onPassportScanned: (data: any)=>void };
function ScanButton({ mrzKey, onPassportScanned }: ScanButtonProps) {
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
        Toast.fail({ content: `Failed to scan passport: ${e.message}` });
        console.log(e);
      });
  }, [mrzKey, onPassportScanned]);

  const isDisabled = !nfcEnabled || !mrzKey;

  return (
    <Button type="primary" onPress={handlePress}
      disabled={isDisabled}
      style={tw`absolute right-4 bottom-2 rounded-full`}
    >
      {
        nfcSupported === false ? 'No NFC' 
          : nfcEnabled === false? 'NFC Unabled' 
          : 'Scan Passport NFC'
      }
    </Button>
  );
}
export default function TabPassportScan() {
  const [mrzKey, setMRZKey] = useState("");
  const [scannedDataList, setScannedDataList] = useState<[string, string][]>([]);
  const [openPassportData, setopenPassportData] = useState<any>(null);
  const handlePassportScanned = useCallback(async ({
    openpassport,
    ...nextScannedDataList
  }: PassportData) => {
    setScannedDataList(Object.entries(nextScannedDataList).sort(([a], [b]) => a.localeCompare(b)));
    try {
      const nextopenPassportData = JSON.parse(openpassport);
      setopenPassportData(nextopenPassportData);
    } catch (err) {
      console.log(err);
    }
  }, [setScannedDataList, setopenPassportData]);
  return (
    <>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Collapse defaultActiveKey={'mrz'} accordion>
          <Collapse.Panel key="mrz" title={`MRZ Key: ${mrzKey}`} >
            <MRZForm setMRZKey={setMRZKey} />
          </Collapse.Panel>
          <Collapse.Panel key="scannedData" title={`Scanned Data: ${scannedDataList.join(', ')}`}>
            <ScannedDataList scannedDataList={scannedDataList} />
          </Collapse.Panel>
          <Collapse.Panel key="openPassportData" title="Open Passport Formatted Data"
            styles={{ Content: tw`font-mono`}}>
            {JSON.stringify(openPassportData, null, 2)}
          </Collapse.Panel>
        </Collapse>
      </ScrollView>
      <ScanButton mrzKey={mrzKey} onPassportScanned={handlePassportScanned} />
      <ExportButton mrzKey={mrzKey} scannedDataList={scannedDataList} openPassportData={openPassportData} />
    </>
  )
}