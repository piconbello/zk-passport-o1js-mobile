import React from 'react';
import PropTypes from 'prop-types';
import { Text, View, TouchableOpacity } from 'react-native';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';

import { t } from '../../../helpers/i18n';

import moment from 'moment';

class CollapsibleDatePicker extends React.Component {
  constructor(props) {
    super(props);
    this._onDateChange = this.onDateChange.bind(this);
    this._onPress = this.onPress.bind(this);
    this._hideDatePicker = this.hideDatePicker.bind(this);
    this.state = {
      isCollapsed: true,
    };
    this._validRange = {};
  }

  onDateChange(params) {
    let value;
    switch(this.props.locals.mode) {
      case 'single':
        value = params.date;
        break;
      case 'multiple':
        value = params.dates;
        break;
      case 'range':
        value = [params.startDate, params.endDate];
        break;
      case 'time':
        value = params.time;
        break;
    }
    this.props.locals.onChange(value);
    this.hideDatePicker();
  }

  hideDatePicker() {
    this.setState({ isCollapsed: !this.state.isCollapsed });
  }

  onPress() {
    const locals = this.props.locals;
    this.setState({ isCollapsed: !this.state.isCollapsed });
    if (typeof locals.onPress === 'function') {

      locals.onPress();
    }
  }

  get formattedValue() {
    const { mode, value } = this.props.locals;
    if (value) {
      switch(mode) {
        case 'single':
          return moment(value).locale(t('lang')).format('YYYY/MM/DD');
        case 'multiple':
          return value.map(date => moment(date).locale(t('lang')).format('YY/MM/DD')).join(', ');
        case 'range':
          return value.map(date => !date ? '?' : moment(date).locale(t('lang')).format('YY/MM/DD')).join(' - ');
        case 'time':
          return moment(value).locale(t('lang')).format('HH:mm');
      }
      return `Unknown mode "${mode}"`;
    }
    return t(`dateTimePicker.placeholder.${mode}`);
  }

  get validRange() {
    const { minimumDate, maximumDate } = this.props.locals;
  
    if (
      (minimumDate ? 
        minimumDate !== this._validRange?.startDate : 
        !!this._validRange?.startDate) ||
      (maximumDate ? 
        maximumDate !== this._validRange?.endDate : 
        !!this._validRange?.endDate)
    ) {
      this._validRange = {
        startDate: minimumDate,
        endDate: maximumDate,
      };
    }
    return this._validRange;
  }

  render() {
    const locals = this.props.locals;
    const stylesheet = locals.stylesheet;
    let touchableStyle = stylesheet.dateTouchable.normal;
    let datepickerStyle = stylesheet.datepicker.normal;
    let dateValueStyle = stylesheet.dateValue.normal;

    if (locals.hasError) {
      touchableStyle = stylesheet.dateTouchable.error;
      datepickerStyle = stylesheet.datepicker.error;
      dateValueStyle = stylesheet.dateValue.error;
    }

    if (locals.disabled) {
      touchableStyle = stylesheet.dateTouchable.notEditable;
    }

    const DateTimePickerModel = locals.mode === 'time' ? TimePickerModal : DatePickerModal;

    return (
      <View>
        <TouchableOpacity style={touchableStyle} disabled={locals.disabled} onPress={this._onPress}>
          <Text style={dateValueStyle}>{this.formattedValue}</Text>
        </TouchableOpacity>
        <DateTimePickerModel
          locale={t('lang') == 'tr' ? 'tr' : 'en-GB'} // en_GB for 24 hour format
          mode={locals.mode}
          visible={!this.state.isCollapsed}
          onDismiss={this._hideDatePicker}
          onConfirm={this._onDateChange}
          date={locals.value}
          startDate={locals.value?.[0]}
          endDate={locals.value?.[1]}
          dates={locals.value}
          validRange={this.validRange}
        />
      </View>
    );
  }
}

CollapsibleDatePicker.propTypes = {
  locals: PropTypes.object.isRequired,
};

function datepicker(locals) {
  if (locals.hidden) {
    return null;
  }

  const stylesheet = locals.stylesheet;
  let formGroupStyle = stylesheet.formGroup.normal;
  var formGroupInnerStyle = stylesheet.formGroupInner.normal;
  let controlLabelStyle = stylesheet.controlLabel.normal;
  let helpBlockStyle = stylesheet.helpBlock.normal;
  const errorBlockStyle = stylesheet.errorBlock;

  if (locals.hasError) {
    formGroupStyle = stylesheet.formGroup.error;
    formGroupInnerStyle = stylesheet.formGroupInner.error;
    controlLabelStyle = stylesheet.controlLabel.error;
    helpBlockStyle = stylesheet.helpBlock.error;
  }

  const label = locals.label ? <Text style={controlLabelStyle}>{locals.label}</Text> : null;
  const help = locals.help ? <Text style={helpBlockStyle}>{locals.help}</Text> : null;
  const error =
    locals.hasError && locals.error ? (
      <Text accessibilityLiveRegion="polite" style={errorBlockStyle}>
        {locals.error}
      </Text>
    ) : null;

  return (
    <View style={formGroupStyle}>
      {label}
      <View style={formGroupInnerStyle}>
        <CollapsibleDatePicker locals={locals} />
      </View>
      {help}
      {error}
    </View>
  );
}

export default datepicker;
