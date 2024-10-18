
// patch @react-navigation/bottom-tabs used by expo to use react-native-paper's MaterialBottomTabNavigator
require('@react-navigation/bottom-tabs').createBottomTabNavigator = 
    require('react-native-paper/react-navigation').createMaterialBottomTabNavigator;

