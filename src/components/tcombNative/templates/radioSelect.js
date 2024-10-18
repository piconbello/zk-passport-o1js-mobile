// import React, { createRef } from 'react';
// import { Text, View } from 'react-native';
// import { Radio } from 'native-base';
// import { PRIMARY } from '../../../../config';

// function radioSelect(locals) {
//   if (locals.hidden) {
//     return null;
//   }
//   const radioSelectRef = createRef();

//   const stylesheet = locals.stylesheet;
//   const path = locals.path.join('.');
//   let formGroupStyle = stylesheet.formGroup.normal;
//   var formGroupInnerStyle = stylesheet.formGroupInner.normal;
//   let controlLabelStyle = stylesheet.controlLabel.normal;
//   let radioSelectStyle = stylesheet.radioSelect.normal;
//   let radioSelectItemStyle = stylesheet.radioSelectItem.normal;
//   let helpBlockStyle = stylesheet.helpBlock.normal;
//   let errorBlockStyle = stylesheet.errorBlock;

//   if (locals.hasError) {
//     formGroupStyle = stylesheet.formGroup.error;
//     formGroupInnerStyle = stylesheet.formGroupInner.error;
//     controlLabelStyle = stylesheet.controlLabel.error;
//     radioSelectStyle = stylesheet.radioSelect.error;
//     radioSelectItemStyle = stylesheet.radioSelectItem.error;
//     helpBlockStyle = stylesheet.helpBlock.error;
//   }

//   const label = locals.label ? <Text style={controlLabelStyle}>{locals.label}</Text> : null;
//   const help = locals.help ? <Text style={helpBlockStyle}>{locals.help}</Text> : null;
//   const error =
//     locals.hasError && locals.error ? (
//       <Text accessibilityLiveRegion="polite" style={errorBlockStyle}>
//         {locals.error}
//       </Text>
//     ) : null;

//   var options = locals.options.map(({ value, text }, index) => (
//     <Radio
//       value={value}
//       key={value}
//       ref={index === 0 ? radioSelectRef : undefined}
//       colorScheme={'primary'}
//       style={radioSelectItemStyle}>
//       {text}
//     </Radio>
//   ));

//   return (
//     <View style={formGroupStyle}>
//       {label}
//       <Radio.Group
//         name={path}
//         value={locals.value}
//         accessibilityLabel={locals.label}
//         onChange={(value) => locals.onChange(value)}
//         size="md">
//         <View style={radioSelectStyle}>{options}</View>
//       </Radio.Group>
//       {help}
//       {error}
//     </View>
//   );
// }

// export default radioSelect;
