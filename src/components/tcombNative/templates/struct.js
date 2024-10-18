import React from 'react';
import { View, Text } from 'react-native';
import { stylesheet } from '../stylesheet';
function struct(locals) {
  if (locals.hidden) {
    return null;
  }

  var fieldsetStyle = stylesheet.fieldset;
  var controlLabelStyle = stylesheet.groupLabel.normal;

  if (locals.hasError) {
    controlLabelStyle = stylesheet.groupLabel.error;
  }

  var label = locals.label ? <Text style={controlLabelStyle}>{locals.label}</Text> : null;
  var error =
    locals.hasError && locals.error ? (
      <Text accessibilityLiveRegion="polite" style={stylesheet.errorBlock}>
        {locals.error}
      </Text>
    ) : null;

  var rows = locals.order.map(function (name) {
    return locals.inputs[name];
  });

  return (
    <View style={fieldsetStyle}>
      {label}
      {error}
      {rows}
    </View>
  );
}

export default struct;
