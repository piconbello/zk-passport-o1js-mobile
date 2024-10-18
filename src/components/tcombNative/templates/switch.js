import React from 'react';
import { View, Text, Switch } from "react-native";
import { stylesheet } from '../stylesheet';

function switchComponent(locals) {
  if (locals.hidden) {
    return null;
  }


  var formGroupStyle = stylesheet.formGroup.normal;
  var formGroupInnerStyle = stylesheet.formGroupInner.normal;
  var controlLabelStyle = stylesheet.controlLabel.normal;
  var switchStyle = stylesheet.switch.normal;
  var helpBlockStyle = stylesheet.helpBlock.normal;
  var errorBlockStyle = stylesheet.errorBlock;

  if (locals.hasError) {
    formGroupStyle = stylesheet.formGroup.error;
    formGroupInnerStyle = stylesheet.formGroupInner.error;
    controlLabelStyle = stylesheet.controlLabel.error;
    switchStyle = stylesheet.switch.error;
    helpBlockStyle = stylesheet.helpBlock.error;
  }

  var label = locals.label ? (
    <Text style={controlLabelStyle}>{locals.label}</Text>
  ) : null;
  var help = locals.help ? (
    <Text style={helpBlockStyle}>{locals.help}</Text>
  ) : null;
  var error =
    locals.hasError && locals.error ? (
      <Text accessibilityLiveRegion="polite" style={errorBlockStyle}>
        {locals.error}
      </Text>
    ) : null;

  return (
    <View style={formGroupStyle}>
      <View style={formGroupInnerStyle}>
        {label}
        <Switch
          accessibilityLabel={locals.label}
          ref="input"
          disabled={locals.disabled}
          onTintColor={locals.onTintColor}
          thumbTintColor={locals.thumbTintColor}
          tintColor={locals.tintColor}
          style={switchStyle}
          onValueChange={value => locals.onChange(value)}
          value={locals.value}
          testID={locals.testID}
        />
      </View>
      {help}
      {error}
    </View>
  );
}

export default switchComponent;
