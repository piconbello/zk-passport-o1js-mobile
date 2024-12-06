import { useToast } from "react-native-paper-toast";
import * as Clipboard from 'expo-clipboard';
import { useCallback } from "react";
import tw from "@/tw";
import { FAB } from "react-native-paper";

function ExportButton(props: any) {
  const toaster = useToast();
  const handleExport = useCallback(() => {
    const jsonString = JSON.stringify(props, null, 2);
    Clipboard.setStringAsync(jsonString)
      .then(() => {
        toaster.show({ type: 'success', message: 'All data copied to clipboard' });
      }).catch((e) => {
        toaster.show({ type: 'error', message: `Failed to copy to clipboard: ${e.message}` });
        console.log(e);
      })
  }, [Object.values(props)]);

  return (
    <FAB icon='content-copy' variant="secondary" size='small' mode='elevated'
      label='Copy All' onPress={handleExport}
      style={tw`absolute left-4 bottom-2 rounded-full`}
    />
  );
}

export default ExportButton;