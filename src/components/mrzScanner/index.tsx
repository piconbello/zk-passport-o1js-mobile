import React from 'react';
import { View } from 'react-native';
import MrzReader, { CameraSelector, DocType } from '@corupta/react-native-mrz-reader';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';

import { Button, Text } from 'react-native-paper';

// TODO REQUEST PERMISSION HERE.

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

  startScanner = () => {
    this.bottomSheetRef?.current?.present();
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