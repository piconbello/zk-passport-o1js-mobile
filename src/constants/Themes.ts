import { 
  DarkTheme as NavigationDarkThemeMD2,
  DefaultTheme as NavigationLightThemeMD2
} from '@react-navigation/native';
import {
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
} from 'react-native-paper';

const { 
  LightTheme: NavigationLightThemeMD3, 
  DarkTheme: NavigationDarkThemeMD3, 
} = adaptNavigationTheme({
  reactNavigationLight: NavigationLightThemeMD2,
  reactNavigationDark: NavigationDarkThemeMD2,
});

const LightTheme = {
  ...NavigationLightThemeMD3,
  ...MD3LightTheme,
  colors: {
    ...NavigationLightThemeMD3.colors,
    ...MD3LightTheme.colors,
    // Add custom colors here
  },
};
const DarkTheme = {
  ...NavigationDarkThemeMD3,
  ...MD3DarkTheme,
  colors: {
    ...NavigationDarkThemeMD3.colors,
    ...MD3DarkTheme.colors,
    // Add custom colors here
  },
};


export { LightTheme, DarkTheme };
export default { LightTheme, DarkTheme };