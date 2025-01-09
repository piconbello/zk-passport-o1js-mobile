import React from 'react';
import { View, Platform } from 'react-native';
import NfcManager from 'react-native-nfc-manager';
import { } from 'react-native-paper-toast';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';

import { Button, Text, FAB, Icon, MD3Colors } from 'react-native-paper';
import tw from '@/tw';
import { Subscription, scanPassport, addMessageListener, stopScan } from '@/modules/custom-passport-reader';

// TODO REQUEST PERMISSION HERE.w

// TOOD disable keyboard
// TODO dismiss on pressing outer region of bottom sheet modal.

type NFCScannerProps = {
  mrzKey: string,
  onPassportScanned?: (data: any)=>void,
  onError?: (error: Error)=>void,
}
type NFCScannerState = {
  isScannerRunning: boolean,
  lastMessage: string,
  isNFCSupported: boolean | undefined,
  isNFCEnabled: boolean | undefined,
  succeeded: boolean,
}
const _snapPoints = ['50%']
class NFCScanner extends React.PureComponent<NFCScannerProps, NFCScannerState> {
  bottomSheetRef: any;
  messageSubscription?: Subscription;
  constructor(props: NFCScannerProps) {
    super(props);
    this.bottomSheetRef = React.createRef<BottomSheetModal>();
    this.state = {
      isScannerRunning: false,
      lastMessage: '',
      isNFCSupported: undefined,
      isNFCEnabled: undefined,
      succeeded: false,
    };
  }
  componentDidMount(){
    (async () => {
      let isNFCSupported = false;
      try {
        isNFCSupported = await NfcManager.isSupported();
      } catch (e: any) {
        console.log(`Ignoring NFCManager error: ${e?.message ?? e}`);
      }
      this.setState({ isNFCSupported }, this.reloadNFCEnabled);
    })();
    this.messageSubscription = addMessageListener(this.handleEventMessage);
  }
  componentWillUnmount(): void {
    this.messageSubscription?.remove();
    this.messageSubscription = undefined;
  }

  handleEventMessage = (message: string) => {
    console.log('received event message: ', message);
    this.setState({ lastMessage: message });
  }

  reloadNFCEnabled = async () => {
    if (!this.state.isNFCSupported) {
      return;
    }
    let isNFCEnabled = false;
    try {
      isNFCEnabled = await NfcManager.isEnabled();
    } catch (e: any) {
      console.log(`Ignoring NFCManager error: ${e?.message?? e}`);
    }
    if (isNFCEnabled !== this.state.isNFCEnabled) {
      this.setState({ isNFCEnabled });
    }
  }

  startScanning = () => {
    scanPassport(this.props.mrzKey)
      .then((data) => {
        this.setState({ succeeded: true });
        this.props.onPassportScanned?.(data);
      }).catch((error) => {
        console.log(error);
        if (error?.code !== 'E_STOPPED') {
          // DON'T CALL ON ERROR IF IT WAS STOPPED BY USER.
          this.props.onError?.(error);
        }
      }).finally(() => {
        this.setState({ isScannerRunning: false });
        setTimeout(() => {
          this.bottomSheetRef?.current?.dismiss();
        }, 1000);
      });
  }

  stopScanning = () => {
    stopScan();
  }

  handleSheetChange = (index: any) => {
    // console.log('Bottom sheet change:', index);
    if (index === -1) {
      this.stopScanning();
      this.setState({ isScannerRunning: false });
      // TODO can we stop an NFC session, if so do it here?
      // this.setState({ isScannerRunning: false, lastMessage: '' });
    } else {
      this.startScanning();
      // this.setState({ isScannerRunning: true });
    }
  }

  handleStartScan = () => {
    if (!this.props.mrzKey || this.state.isScannerRunning) {
      return;
    }
    console.log('Scanning passport NFC...');
    this.setState({ isScannerRunning: true, lastMessage: '', succeeded: false }, () => {
      if (Platform.OS === 'ios') {
        this.startScanning();
      } else {
        this.bottomSheetRef?.current?.present();
      }
    });
  }

  handleEnableNFC = () => {
    if (Platform.OS === 'android') {
      NfcManager.goToNfcSetting();
    }
  }

  renderBottomSheetView() {
    if (Platform.OS !== 'android') {
      return null;
    }
    return (
      <BottomSheetModal
        ref={this.bottomSheetRef}
        snapPoints={_snapPoints}
        onChange={this.handleSheetChange}
        index={1}
      >
        <BottomSheetView style={tw`p-4`}>
          <Text variant="headlineMedium" style={tw`font-bold text-center mt-1`}>
            Ready to Scan
          </Text>
          <Text variant='bodyMedium' style={tw`text-center mt-1`}>
            {this.state.lastMessage}
          </Text>
          {/* Some NFC Image similar to IOS might be nicer :) */}
          <View style={tw`items-center mt-4`}>
            { 
              this.state.succeeded ? (
                <Icon source="check-circle" size={128} color={MD3Colors.primary50} />
              ) : (
                <Icon source="cellphone-nfc" size={128} color={MD3Colors.secondary50} />
              )
            }
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    )
  }

  render() {
    const handlePress = this.state.isNFCEnabled === false 
      ? this.handleEnableNFC : this.handleStartScan;
    const isDisabled = !this.state.isNFCEnabled || !this.props.mrzKey;
    const label = this.state.isNFCSupported === false ? 'No NFC'
      : this.state.isNFCEnabled === false ? 'Enable NFC'
      : 'Scan Passport NFC';

    return (
      <>
        <FAB icon="cellphone-nfc" variant="primary" size='small' mode="elevated"
          style={tw`absolute right-4 bottom-2 rounded-full`}
          disabled={isDisabled} label={label} onPress={handlePress}
        />
        {this.renderBottomSheetView()}
      </>
    )
  }
}

export default NFCScanner;