import React from 'react';
import { View, Text } from 'react-native';
import { stylesheet } from '../stylesheet';
var { Picker } = require('@react-native-picker/picker');

function select(locals) {
  if (locals.hidden) {
    return null;
  }

  var formGroupStyle = stylesheet.formGroup.normal;
  var formGroupInnerStyle = stylesheet.formGroupInner.normal;
  var controlLabelStyle = stylesheet.controlLabel.normal;
  var selectStyle = [stylesheet.select.normal, stylesheet.pickerContainer.normal];
  var helpBlockStyle = stylesheet.helpBlock.normal;
  var errorBlockStyle = stylesheet.errorBlock;

  if (locals.hasError) {
    formGroupStyle = stylesheet.formGroup.error;
    formGroupInnerStyle = stylesheet.formGroupInner.error;
    controlLabelStyle = stylesheet.controlLabel.error;
    selectStyle = [stylesheet.select.error, stylesheet.pickerContainer.error];
    helpBlockStyle = stylesheet.helpBlock.error;
  }

  var label = locals.label ? <Text style={controlLabelStyle}>{locals.label}</Text> : null;
  var help = locals.help ? <Text style={helpBlockStyle}>{locals.help}</Text> : null;
  var error =
    locals.hasError && locals.error ? (
      <Text accessibilityLiveRegion="polite" style={errorBlockStyle}>
        {locals.error}
      </Text>
    ) : null;

  var options = locals.options.map(({ value, text }) => (
    <Picker.Item key={value} value={value} label={text} />
  ));

  return (
    <View style={formGroupStyle}>
      {label}
      <View style={formGroupInnerStyle}>
        <Picker
          accessibilityLabel={locals.label}
          /*ref="input"*/
          style={selectStyle}
          selectedValue={locals.value}
          onValueChange={locals.onChange}
          help={locals.help}
          enabled={!locals.disabled}
          mode={locals.mode}
          prompt={locals.prompt}
          itemStyle={locals.itemStyle}>
          {options}
        </Picker>
      </View>
      {help}
      {error}
    </View>
  );
}

export default select;
