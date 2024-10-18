// import React, { createRef } from 'react';
// import { View, Text, Switch, StyleSheet } from 'react-native';
// import { Checkbox } from 'native-base';
// import * as WebBrowser from 'expo-web-browser';

// const _selected = ["checkbox"];
// const _notSelected = [];
// const checkBoxRef = createRef(null);

// const _transformer = {
//   parse: (value) => (value || []).includes("checkbox"),
//   format: (value) => value ? _selected : _notSelected
// }

// class CustomCheckbox extends React.Component {
//   onChange = (value) => {
//     return this.props.onChange(_transformer.parse(value));
//   }
//   render() {
//     const { children, value, onChange, ...rest } = this.props;
//     return (
//       <Checkbox.Group
//         {...rest}
//         value={_transformer.format(value)}
//         onChange={this.onChange}
//       >
//         <Checkbox value={"checkbox"}>
//           {children}
//         </Checkbox>
//       </Checkbox.Group>
//     )
//   }
// }

// const LINK_COLOR = '#0000EE';

// const styles = StyleSheet.create({
//   link: {
//     color: LINK_COLOR,
//     textDecorationLine: 'underline'
//   }
// })

// class WebviewLink extends React.Component {
//   onLinkPressed = () => {
//     this.props.url && WebBrowser.openBrowserAsync(this.props.url);
//   }
//   getStyle = () => {
//     const styleList = [];
//     if (this.props.style) {
//       styleList.push(this.props.style);
//     }
//     if (this.props.url) {
//       styleList.push(styles.link);
//     }
//     return styleList;
//   }
//   render() {
//     const { url, children, style, ...rest } = this.props;
//     return (
//       <Text
//         onPress={url ? this.onLinkPressed : undefined}
//         style={this.getStyle()}
//         {...rest}
//       >
//         {children}
//       </Text>
//     )
//   }
// }


// function checkbox(locals) {
//   if (locals.hidden) {
//     return null;
//   }
//   const { url } = locals.config || {};

//   var stylesheet = locals.stylesheet;
//   var formGroupStyle = stylesheet.formGroup.normal;
//   var formGroupInnerStyle = stylesheet.formGroupInner.normal;
//   var checkboxLabelStyle = stylesheet.checkboxLabelStyle.normal;
//   var checkboxStyle = stylesheet.checkbox.normal;
//   var helpBlockStyle = stylesheet.helpBlock.normal;
//   var errorBlockStyle = stylesheet.errorBlock;

//   if (locals.hasError) {
//     formGroupStyle = stylesheet.formGroup.error;
//     formGroupInnerStyle = stylesheet.formGroupInner.error;
//     checkboxLabelStyle = stylesheet.checkboxLabelStyle.error;
//     checkboxStyle = stylesheet.checkbox.error;
//     helpBlockStyle = stylesheet.helpBlock.error;
//   }

//   var label = locals.label ? (
//     <WebviewLink style={checkboxLabelStyle} url={url}>{locals.label}</WebviewLink>
//   ) : null;
//   var help = locals.help ? (
//     <Text style={helpBlockStyle}>{locals.help}</Text>
//   ) : null;
//   var error =
//     locals.hasError && locals.error ? (
//       <Text accessibilityLiveRegion="polite" style={errorBlockStyle}>
//         {locals.error}
//       </Text>
//     ) : null;

//   return (
//     <View style={formGroupStyle}>
//       <CustomCheckbox
//         accessibilityLabel={locals.label}
//         ref={checkBoxRef}
//         isDisabled={locals.disabled}
//         value={locals.value}
//         onChange={locals.onChange}
//         size="md"
//       >
//         {label}
//       </CustomCheckbox>
//       {help}
//       {error}
//     </View>
//   );
// }

// export default checkbox;
