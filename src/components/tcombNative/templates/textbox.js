import React, { createRef } from 'react';
import { View } from 'react-native';
import { stylesheet } from '../stylesheet';
import { HelperText, Text, TextInput } from 'react-native-paper';

function textbox(locals) {
  if (locals.hidden) {
    return null;
  }
  const textBoxRef = createRef();

  var formGroupStyle = stylesheet.formGroup.normal;
  var formGroupInnerStyle = stylesheet.formGroupInner.normal;
  var controlLabelStyle = stylesheet.controlLabel.normal;
  var textboxStyle = stylesheet.textbox.normal;
  var textboxViewStyle = stylesheet.textboxView.normal;
  var helpBlockStyle = stylesheet.helpBlock.normal;
  var errorBlockStyle = stylesheet.errorBlock;

  if (locals.hasError) {
    formGroupStyle = stylesheet.formGroup.error;
    formGroupInnerStyle = stylesheet.formGroupInner.error;
    controlLabelStyle = stylesheet.controlLabel.error;
    textboxStyle = stylesheet.textbox.error;
    textboxViewStyle = stylesheet.textboxView.error;
    helpBlockStyle = stylesheet.helpBlock.error;
  }

  if (locals.editable === false) {
    textboxStyle = stylesheet.textbox.notEditable;
    textboxViewStyle = stylesheet.textboxView.notEditable;
    formGroupInnerStyle = stylesheet.formGroupInner.notEditable;
  }

  var error = locals.hasError ? locals.error : '';
  var help = locals.help ? locals.help : '';

  return (
    <View style={formGroupStyle}>
      <TextInput
        mode='outlined'
        error={locals.hasError}
        disabled={locals.editable === false}
        label={locals.label}
        accessibilityLabel={locals.label}
        ref={textBoxRef}
        allowFontScaling={locals.allowFontScaling}
        autoCapitalize={locals.autoCapitalize}
        autoCorrect={locals.autoCorrect}
        autoFocus={locals.autoFocus}
        blurOnSubmit={locals.blurOnSubmit}
        editable={locals.editable}
        keyboardType={locals.keyboardType}
        maxLength={locals.maxLength}
        multiline={locals.multiline}
        onBlur={locals.onBlur}
        onEndEditing={locals.onEndEditing}
        onFocus={locals.onFocus}
        onLayout={locals.onLayout}
        onSelectionChange={locals.onSelectionChange}
        onSubmitEditing={locals.onSubmitEditing}
        onContentSizeChange={locals.onContentSizeChange}
        placeholderTextColor={locals.placeholderTextColor}
        secureTextEntry={locals.secureTextEntry}
        selectTextOnFocus={locals.selectTextOnFocus}
        selectionColor={locals.selectionColor}
        numberOfLines={locals.numberOfLines}
        clearButtonMode={locals.clearButtonMode}
        clearTextOnFocus={locals.clearTextOnFocus}
        enablesReturnKeyAutomatically={locals.enablesReturnKeyAutomatically}
        keyboardAppearance={locals.keyboardAppearance}
        onKeyPress={locals.onKeyPress}
        returnKeyType={locals.returnKeyType}
        selectionState={locals.selectionState}
        onChangeText={(value) => locals.onChange(value)}
        onChange={locals.onChangeNative}
        placeholder={locals.placeholder}
        value={locals.value}
        testID={locals.testID}
        textContentType={locals.textContentType}
      />
      <HelperText 
        disabled={locals.editable === false} 
        visible={!!(error || help)}
        type={error ? 'error' : 'info'}
      >
        {error || help}
      </HelperText>
    </View>
  );
}

export default textbox;
