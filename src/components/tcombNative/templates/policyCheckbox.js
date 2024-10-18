// import React, { createRef } from 'react';
// import { View, Text, Switch, StyleSheet } from 'react-native';
// import { Checkbox } from 'native-base';
// import * as WebBrowser from 'expo-web-browser';
// import * as appConfig from '../../../../config';

// import { t } from '../../../helpers/i18n';
// import WebViewModal from '../../../components/WebViewModal';
// const _selected = ['checkbox'];
// const _notSelected = [];
// const checkBoxRef = createRef(null);

// const _transformer = {
//   parse: (value) => (value || []).includes('checkbox'),
//   format: (value) => (value ? _selected : _notSelected),
// };

// class CustomCheckbox extends React.Component {
//   onChange = (value) => {
//     return this.props.onChange(_transformer.parse(value));
//   };
//   render() {
//     const { children, value, onChange, ...rest } = this.props;
//     return (
//       <Checkbox.Group {...rest} value={_transformer.format(value)} onChange={this.onChange}>
//         <Checkbox value={'checkbox'}>{children}</Checkbox>
//       </Checkbox.Group>
//     );
//   }
// }

// const LINK_COLOR = '#0000EE';

// const styles = StyleSheet.create({
//   link: {
//     color: LINK_COLOR,
//   },
// });

// class WebviewLink extends React.Component {
//   constructor(params) {
//     super(params);
//     this.state = {
//       isVisible: false,
//     };
//   }
//   onLinkPressed = () => {
//     this.setState({ isVisible: true });
//     // this.props.url && WebBrowser.openBrowserAsync(this.props.url)
//   };
//   getStyle = () => {
//     const styleList = [];
//     if (this.props.style) {
//       styleList.push(this.props.style);
//     }
//     if (this.props.url) {
//       styleList.push(styles.link);
//     }
//     return styleList;
//   };
//   render() {
//     const { title, url, children, style, ...rest } = this.props;
//     const { isVisible } = this.state;
//     // console.log({
//     //   title,
//     //   url,
//     //   isVisible,
//     // })
//     return (
//       <>
//         <Text onPress={url ? this.onLinkPressed : undefined} style={this.getStyle()} {...rest}>
//           {children}
//         </Text>
//         <View style={{ position: 'absolute', left: 0, right: 0, top: 0 }}>
//           <WebViewModal
//             title={title}
//             isVisible={isVisible}
//             onDismiss={() => this.setState({ isVisible: false })}
//             url={url}
//           />
//         </View>
//       </>
//     );
//   }
// }

// function checkbox(locals) {
//   if (locals.hidden) {
//     return null;
//   }
//   const { policyList = [] } = locals.config || {};

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
//   function splitFromRemovedPart(inputString, stringToRemove) {
//     const indexToRemove = inputString.indexOf(stringToRemove);
//     if (indexToRemove === -1) {
//       return [inputString, ''];
//     } else {
//       const part1 = inputString.substring(0, indexToRemove);
//       const part2 = inputString.substring(indexToRemove + stringToRemove.length);
//       return [part1, part2];
//     }
//   }

//   var label = (
//     <Text style={{ margin: 0, padding: 0 }}>
//       {policyList.map(({ key, url, title }, index) => {
//         const [part1, part2] = splitFromRemovedPart(locals.label, title);

//         return (
//           <React.Fragment key={key}>
//             {part1}
//             <WebviewLink url={url} title={title}>
//               {title}
//             </WebviewLink>
//             {part2}
//           </React.Fragment>
//         );
//       })}
//     </Text>
//   );

//   var help = locals.help ? <Text style={helpBlockStyle}>{locals.help}</Text> : null;
//   var error =
//     locals.hasError && locals.error ? (
//       <Text accessibilityLiveRegion="polite" style={errorBlockStyle}>
//         {locals.error}
//       </Text>
//     ) : null;

//   return (
//     <View style={{ ...formGroupStyle, width: '95%' }}>
//       <CustomCheckbox
//         accessibilityLabel={locals.label}
//         ref={checkBoxRef}
//         isDisabled={locals.disabled}
//         value={locals.value}
//         onChange={locals.onChange}
//         size="sm">
//         {label}
//       </CustomCheckbox>
//       {help}
//       {error}
//     </View>
//   );
// }

// export default checkbox;
