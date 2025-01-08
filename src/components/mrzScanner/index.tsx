import React from 'react';
import { View, Platform } from 'react-native';
import MrzReader, { CameraSelector, DocType } from '@corupta/react-native-mrz-reader';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import * as Permissions from 'react-native-permissions';

import { Button, Text } from 'react-native-paper';

// TODO REQUEST PERMISSION HERE.

const cameraPermissionName = (() => {
  switch(Platform.OS) {
    case 'ios':
      return Permissions.PERMISSIONS.IOS.CAMERA;
    case 'android':
      return Permissions.PERMISSIONS.ANDROID.CAMERA;
    default:
      throw new Error(`Unsupported platform: ${Platform.OS}`);
  }
})();

type MRZScannerProps = {
  onMRZRead?: (mrz: string) => void,
}
type MRZScannerState = {
  isScannerRunning: boolean,
}
const _snapPoints = ['40%']
class MRZScanner extends React.PureComponent<MRZScannerProps, MRZScannerState> {
  bottomSheetRef: any;
  constructor(props: MRZScannerProps) {
    super(props);
    this.bottomSheetRef = React.createRef<BottomSheetModal>();
    this.state = {
      isScannerRunning: false,
    };
    // MrzScannerNative.setScannerType(MrzScannerNative.SCANNER_TYPE.DOCUMENT_IMAGE_PASSPORT);
    // MrzScannerNative.setScannerType(MrzScannerNative.SCANNER_TYPE.MRZ);
  }
  componentDidMount(){   
  }
  componentWillUnmount(): void {
  }
  

  handleSuccessfulScan = (mrz: string) => {
    this.stopScanner();
    console.log('Successful MRZ scan:', JSON.stringify(mrz));
    this.bottomSheetRef?.current?.dismiss();
    this.setState({ isScannerRunning: false });
    this.props.onMRZRead?.(mrz);
  }

  handleSheetChange = (index: any) => {
    // console.log('Bottom sheet change:', index);
    if (index === -1) {
      this.setState({ isScannerRunning: false });
    } else {
      this.setState({ isScannerRunning: true });
    }
  }

  startScanner = async () => {
    try {
      const permissionStatus = await Permissions.request(cameraPermissionName);
      switch(permissionStatus) {
        case Permissions.RESULTS.GRANTED:
        case Permissions.RESULTS.LIMITED:
          break;
        default:
          console.log('No camera permission granted');
          return;
      }
      this.bottomSheetRef?.current?.present();
    } catch (error) {
      console.log('Failed to start camera scanner', error);
    }
  }

  stopScanner = () => {

    // NativeModules.RNMrzscannerlib.closeScanner();
  }

  render() {
    return (
      <View>
        <Button mode="contained-tonal" onPress={this.startScanner} icon={"credit-card-scan-outline"}>
          Scan MRZ
        </Button>
        <BottomSheetModal
          ref={this.bottomSheetRef}
          snapPoints={_snapPoints}
          onChange={this.handleSheetChange}
          index={1}
        >
          <BottomSheetView>
            {
              this.state.isScannerRunning ? (
                <MrzReader
                  style={{width: '100%', height: '100%'}}
                  docType={DocType.Passport}
                  cameraSelector={CameraSelector.Back}
                  onMRZRead={this.handleSuccessfulScan}
                />
              ) : null
            }
          </BottomSheetView>
        </BottomSheetModal>
      </View>
    )
  }
}

export default MRZScanner;