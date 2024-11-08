import NfcManager from 'react-native-nfc-manager';
import * as Clipboard from 'expo-clipboard';

import { serializeError } from 'serialize-error';

import { PassportData, getMRZKey, scanPassport } from "@/modules/custom-passport-reader";
import React, { createRef, useCallback, useEffect, useRef, useState } from "react";

import tw from '@/tw';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import dayjs from 'dayjs';
import moment from 'moment'; // todo unify date libraries at some point.
import { Button, Card, Chip, Divider, FAB, List, Text } from 'react-native-paper';
import { useToast } from 'react-native-paper-toast';
import base64 from 'react-native-base64'
import useRefMemo from '@/hooks/useRefMemo';
// import * as t from 'io-ts'
import 'tcomb-form-native-cr';
import t from 'tcomb-validation';
import ContractWebView from '@/components/contractWebView';
import MRZScanner from '@/components/mrzScanner';
//@ts-ignore
const Form = t.form.Form;

const MRZData = t.struct({
  documentNumber: t.refinement(t.String, s => /^[A-Z0-9]{9}$/.test(s)),
  dateOfBirth: t.Date,
  dateOfExpiry: t.Date,
});
const formOptions = {
  // label: 'MRZ',
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
      maximumDate: dayjs().add(10, 'year').startOf('day').toDate(),
    },
  }
}

// type MRZDataType = {
//   documentNumber: string;
//   dateOfBirth?: Date;
//   dateOfExpiry?: Date;
// }
type MRZFormProps = { setMRZKey: (mrzKey: string) => void, mrzKey: string };

class MRZFormComponent extends React.PureComponent<MRZFormProps> {
  formRef: React.RefObject<any>;
  initialValues?: { documentNumber: string; dateOfBirth: Date; dateOfExpiry: Date; };
  constructor(props: MRZFormProps) {
    super(props);
    this.formRef = createRef();
    if (this.props.mrzKey) {
      this.initialValues = {
        documentNumber: props.mrzKey.substring(0, 9),
        dateOfBirth: moment(props.mrzKey.substring(10, 16), 'YYMMDD').toDate(),
        dateOfExpiry: moment(props.mrzKey.substring(17, 23), 'YYMMDD').toDate(),
      };
    }
  }

  handleSubmit = () => {
    const formValues = this.formRef.current?.getValue();
    if (!formValues) return; // not valid
    const { documentNumber, dateOfBirth, dateOfExpiry } = formValues;
    this.initialValues = { documentNumber, dateOfBirth, dateOfExpiry };
    this.props.setMRZKey(
      getMRZKey(
        documentNumber, 
        dayjs(dateOfBirth).format('YYMMDD'), 
        dayjs(dateOfExpiry).format('YYMMDD')
      )
    );
  }
  render() {
    return (
      <View style={tw`px-2 pb-4`}>
        <Card>
          <Card.Content>
            <Form
              value={this.initialValues}
              ref={this.formRef}
              type={MRZData}
              options={formOptions}
            />
          </Card.Content>
          <Card.Actions>
            <MRZScanner />
            <Button mode='contained' onPress={this.handleSubmit}>
              Calculate MRZ Key
            </Button>
          </Card.Actions>
        </Card>
      </View>
    );
  }
}

type DataGroup = { dataGroupName: string, rawData: string, decodedData: string };
type ScannedDataGroupListProps = { scannedDataGroupList: [string, string][] };
function ScannedDataGroupList({ scannedDataGroupList }: ScannedDataGroupListProps) {
  const dataGroupList = useRefMemo(() => {
    return scannedDataGroupList.map(([key, value]) => ({
      dataGroupName: key,
      rawData: value,
      decodedData: base64.decode(value).replace(/[\s\n]+/g,''),
    }));
  }, [scannedDataGroupList]);
  // const keyExtractor = useCallback((item: DataGroup) => item.dataGroupName, []);

  let children = [<Chip style={tw`text-center`}>No scanned data found</Chip>];

  if (scannedDataGroupList.length > 0) {
    children = dataGroupList.map((item, index) => (
      <Card key={item.dataGroupName} style={tw`my-2`}>
       <Card.Title title={item.dataGroupName} subtitle={item.rawData} />
       <Card.Content>
         <Text variant='bodySmall' style={tw`font-mono`}>
           {item.decodedData}
         </Text>
       </Card.Content>
     </Card>
    ));
  }

  return (
    <View style={tw`px-2 pb-4`}>
      {children}
    </View>
  );
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

type ExportButtonProps = { mrzKey: string, scannedDataGroupList: [string, string][], openPassportData: any, webViewLogs: object[] };
function ExportButton({ mrzKey, scannedDataGroupList, openPassportData, webViewLogs }: ExportButtonProps) {
  const toaster = useToast();

  const handleExport = useCallback(() => {
    const jsonString = JSON.stringify({ 
      mrzKey, scannedDataGroupList, openPassportData, webViewLogs
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

type WebViewLogType = { date: number, type: string, data: object }
const contractUri = 'https://zkweb.netlify.app/'; //'https://zksandbox.netlify.app/'
type SendToWebViewProps = {
  mrzKey: string, 
  scannedDataGroupList: [string, string][], 
  openPassportData: any,
  webViewLogs: WebViewLogType[],
  setWebViewLogs: (setter: (prev: WebViewLogType[]) => WebViewLogType[]) => void
};
function SendToWebView({ 
  mrzKey, scannedDataGroupList, openPassportData, 
  webViewLogs, setWebViewLogs 
}: SendToWebViewProps) {
  const wRef = useRef<ContractWebView>(null);
  const handleNotify = useCallback((data: object) => {
    setWebViewLogs(prev => [...prev, { date: Date.now(), type: 'notify', data }]);
  }, [setWebViewLogs]);
  const sendToWebView = useCallback(() => {
    const command = {
      action: 'sendPassportData',
      mrzKey,
      scannedDataGroupList,
      openPassportData
    };
    setWebViewLogs(prev => [...prev, { date: Date.now(), type: 'command', data: command }]);
    wRef.current?.sendCommandToWebApp(command)
      .then((response) => {
        setWebViewLogs(prev => [...prev, { date: Date.now(), type: 'response', data: response }])
      }).catch((error) => {
        setWebViewLogs(prev => [...prev, { date: Date.now(), type: 'error', data: serializeError(error) }])
      });
  }, [mrzKey, scannedDataGroupList, openPassportData, setWebViewLogs]);
  return (
    <View style={tw`px-2 pb-4`}>
      <ContractWebView
        ref={wRef}
        uri={contractUri}
        onNotify={handleNotify}
      />
      <Button mode='contained' onPress={sendToWebView} style={tw`-mt-1 rounded-none rounded-b-lg  border border-solid border-amber-800 border-t-0`}>
        Send to WebView
      </Button>
      {webViewLogs.reverse().map((log: WebViewLogType, index) => (
        <Card key={index} style={tw`mt-2`}>
          <Card.Title 
            title={`#${webViewLogs.length - index}: ${log.type} ~ (${
              (new Date(log.date)).toLocaleString()
            })`}
          />
          <Card.Content>
            <Text variant='bodySmall' style={tw`font-mono`}>
              {JSON.stringify(log.data)}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </View>
  )
}

export default function TabPassportScan() {
  const [mrzKey, setMRZKey] = useState("");
  const [scannedDataGroupList, setScannedDataGroupList] = useState<[string, string][]>([]);
  const [openPassportData, setOpenPassportData] = useState<object>({});
  const [webViewLogs, setWebViewLogs] = useState<WebViewLogType[]>([]);
  const handlePassportScanned = useCallback(async ({
    openpassport,
    ...nextScannedDataGroupList
  }: PassportData) => {
    setScannedDataGroupList(
      Object.entries(nextScannedDataGroupList
        ).sort(([a], [b]) => a.localeCompare(b)));
    try {
      let nextOpenPassportData = openpassport as object;
      if (typeof openpassport === 'string') {
        nextOpenPassportData = JSON.parse(openpassport);
      }
      setOpenPassportData(nextOpenPassportData);
    } catch (err) {
      console.log(err);
    }
  }, [setScannedDataGroupList, setOpenPassportData]);
  const [expandedId, setExpandedId] = useState<string | number>("mrz");
  const handleAccordionPress = useCallback((id: string | number) => {
    setExpandedId(prev => prev === id? '' : id);
  }, []);

  return (
    <>
      <ScrollView contentContainerStyle={tw`pb-24`}>
        <List.AccordionGroup expandedId={expandedId} onAccordionPress={handleAccordionPress}>
          <List.Accordion title={`MRZ Key: ${mrzKey}`} id="mrz">
            <MRZFormComponent setMRZKey={setMRZKey} mrzKey={mrzKey} />
          </List.Accordion>
          <Divider />
          <List.Accordion title={scannedDataGroupList.length === 0 ? 'No data group scanned yet' : `${scannedDataGroupList.map(([k,v])=>k).join(', ')}`} 
            id="scannedDataGroupList">
            <ScannedDataGroupList scannedDataGroupList={scannedDataGroupList} />
          </List.Accordion>
          <Divider />
          <List.Accordion title="Open Passport Formatted Data"
            id="openPassportData">
            <ScrollView horizontal={true} contentContainerStyle={tw`flex-grow`}>
              <Text variant='bodySmall' style={tw`font-mono px-2 pb-4`}>
                {JSON.stringify(openPassportData, null, 2)}
              </Text>
            </ScrollView>
          </List.Accordion>
          <Divider />
          <List.Accordion title="Send to Webview" id="sendToWebView">
            <SendToWebView
              mrzKey={mrzKey}
              scannedDataGroupList={scannedDataGroupList}
              openPassportData={openPassportData}
              webViewLogs={webViewLogs}
              setWebViewLogs={setWebViewLogs}
            >
            </SendToWebView>
          </List.Accordion>
          <Divider />
        </List.AccordionGroup>
      </ScrollView>
      <ScanButton mrzKey={mrzKey} onPassportScanned={handlePassportScanned} />
      <ExportButton 
        mrzKey={mrzKey} 
        scannedDataGroupList={scannedDataGroupList} 
        openPassportData={openPassportData} 
        webViewLogs={webViewLogs}
      />
    </>
  )
}