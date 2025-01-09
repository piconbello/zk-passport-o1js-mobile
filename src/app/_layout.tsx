import '@/patches';
import '@/helpers';
import '@/components/tcombNative/index';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import 'react-native-reanimated';

import * as Haptics from 'expo-haptics'

import { useDeviceContext } from 'twrnc';
import tw from '@/tw';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import Themes from '@/constants/Themes';
import { ToastProvider } from 'react-native-paper-toast';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',

};

import { enGB, registerTranslation } from 'react-native-paper-dates';
registerTranslation('en-GB', enGB);

import { keepNodeJSCommunicationLifecycle } from '@/helpers/nodejsWorker';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <RootLayoutNav />
  )
}

function RootLayoutNav() {
  useDeviceContext(tw); 

  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Themes.DarkTheme : Themes.LightTheme;

  keepNodeJSCommunicationLifecycle();

  return (
    <GestureHandlerRootView>
      <PaperProvider theme={theme}>
        <ThemeProvider value={theme}>
          <ToastProvider>
            <BottomSheetModalProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                <Stack.Screen name="R/[proofRequestToken]" options={{ headerTitle: 'Proof Request' }} />
              </Stack>
            </BottomSheetModalProvider>
          </ToastProvider>
        </ThemeProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
