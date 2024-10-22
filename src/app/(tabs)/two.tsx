import ContractWebView from '@/components/contractWebView';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { WebView } from 'react-native-webview';

export default function TabTwoScreen() {
  const wRef = useRef<ContractWebView>(null);

  useEffect(() => {
    setTimeout(async () => {
      const response = await wRef.current?.sendCommandToWebApp({
        action: 'sampleCommand',
        hello: 'world'
      });
      console.log('TabTwoScreen received response:', response);
    }, 3000);
  }, []);

  return (
    <View style={styles.container}>
      <ContractWebView 
        ref={wRef}
        uri="https://guess-number-phi-ochre.vercel.app/" 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
