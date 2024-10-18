import { Platform } from 'react-native';

var STRUCT_LABEL_COLOR = '#25282B';
var LABEL_COLOR = '#486183';
var LINK_COLOR = '#0000EE';
var INPUT_COLOR = '#121212';
var INPUT_BACKGROUND = '#F4F6F9';
var ERROR_COLOR = '#a94442';
var HELP_COLOR = '#25282B';
var BORDER_COLOR = '#25282b';
var BORDER_RADIUS = 10;
var DISABLED_COLOR = '#777777';
var BOX_BACKGROUND_COLOR = '#ffffff';
var DISABLED_BACKGROUND_COLOR = '#eeeeee';
var FONT_SIZE = 15;
var STRUCT_LABEL_FONT_SIZE = 15;
var LABEL_FONT_SIZE = 14;
var ERROR_FONT_SIZE = 11;
var HELP_FONT_SIZE = 11;
// var BOLD_FONT_WEIGHT = "600";
var FONT_WEIGHT = '500';

export const stylesheet = Object.freeze({
  fieldset: {
    marginTop: 12,
    marginBottom: 0,
  },
  // the style applied to the container of all inputs
  formGroup: {
    //label+input+help+error
    normal: {
      marginBottom: 12,
    },
    error: {
      marginBottom: 12,
    },
  },
  formGroupInner: {
    // label+input
    normal: {
      paddingHorizontal: 10,
      paddingTop: 8,
      paddingBottom: 8,
      borderRadius: BORDER_RADIUS,
      backgroundColor: INPUT_BACKGROUND,
    },
    error: {
      paddingHorizontal: 10,
      paddingTop: 13,
      paddingBottom: 8,
      borderRadius: BORDER_RADIUS,
      borderColor: ERROR_COLOR,
      borderWidth: 1,
      backgroundColor: BOX_BACKGROUND_COLOR,
    },
    notEditable: {
      paddingHorizontal: 10,
      paddingTop: 12,
      paddingBottom: 8,
      borderRadius: BORDER_RADIUS,
      backgroundColor: DISABLED_BACKGROUND_COLOR,
    },
  },
  controlLabel: {
    normal: {
      color: LABEL_COLOR,
      fontSize: LABEL_FONT_SIZE,
      marginBottom: 10,
      fontWeight: '700',
    },
    // the style applied when a validation error occours
    error: {
      color: ERROR_COLOR,
      fontSize: LABEL_FONT_SIZE,
      fontWeight: '700',
      marginBottom: 10,
    },
  },
  groupLabel: {
    // struct and list
    normal: {
      color: STRUCT_LABEL_COLOR,
      fontSize: STRUCT_LABEL_FONT_SIZE,

      // fontWeight: BOLD_FONT_WEIGHT
    },
    // the style applied when a validation error occours
    error: {
      color: ERROR_COLOR,
      fontSize: STRUCT_LABEL_FONT_SIZE,
      marginBottom: 7,

      // fontWeight: BOLD_FONT_WEIGHT
    },
  },
  checkboxLabelStyle: {
    normal: {
      color: INPUT_COLOR,
      fontSize: LABEL_FONT_SIZE,
      alignSelf: 'center',

      // fontWeight: FONT_WEIGHT,
      maxWidth: '90%',
    },
    // the style applied when a validation error occurs
    error: {
      color: ERROR_COLOR,
      fontSize: LABEL_FONT_SIZE,
      marginBottom: 7,

      // fontWeight: FONT_WEIGHT,
      maxWidth: '90%',
    },
  },
  helpBlock: {
    normal: {
      color: HELP_COLOR,
      fontSize: HELP_FONT_SIZE,

      marginTop: 12,
      marginBottom: 2,
    },
    // the style applied when a validation error occours
    error: {
      color: HELP_COLOR,
      fontSize: HELP_FONT_SIZE,

      marginTop: 12,
      marginBottom: 2,
    },
  },
  errorBlock: {
    fontSize: ERROR_FONT_SIZE,

    marginBottom: 2,
    color: ERROR_COLOR,
  },
  textboxView: {
    normal: {},
    error: {},
    notEditable: {},
  },
  textbox: {
    normal: {
      color: INPUT_COLOR,
      fontSize: FONT_SIZE,

      paddingVertical: 0,
      marginBottom: 5,
      marginTop: 5,
      borderColor: 'red',
    },
    // the style applied when a validation error occours
    error: {
      color: INPUT_COLOR,
      fontSize: FONT_SIZE,

      paddingVertical: 0,
      marginBottom: 5,
    },
    // the style applied when the textbox is not editable
    notEditable: {
      color: DISABLED_COLOR,
      fontSize: FONT_SIZE,

      paddingVertical: 0,
      marginBottom: 5,
      backgroundColor: DISABLED_BACKGROUND_COLOR,
    },
  },
  switch: {
    normal: {
      marginBottom: 4,
    },
    // the style applied when a validation error occours
    error: {
      marginBottom: 4,
    },
  },
  checkbox: {
    normal: {
      backgroundColor: 'red',
      // marginBottom: 4
    },
    // the style applied when a validation error occours
    error: {
      // marginBottom: 4
    },
  },
  pickerContainer: {
    normal: {
      paddingTop: 6,
      marginBottom: 4,
    },
    error: {
      paddingTop: 6,
      marginBottom: 4,
    },
    open: {
      // Alter styles when select container is open
    },
  },
  radioSelect: {
    normal: {
      flexDirection: 'row',
      marginHorizontal: -12,
      marginTop: 6,
      marginBottom: 8,
    },
    error: {
      flexDirection: 'row',
      marginHorizontal: -12,
      marginTop: 6,
      marginBottom: 8,
    },
  },
  radioSelectItem: {
    normal: {
      color: 'red',
      paddingHorizontal: 12,
    },
    error: {
      paddingHorizontal: 12,
    },
  },
  select: {
    normal: Platform.select({
      android: {
        color: INPUT_COLOR,
        marginLeft: -15,
        marginTop: -8,
        height: 40,
        fontSize: FONT_SIZE,
      },
      ios: {},
    }),
    // the style applied when a validation error occours
    error: Platform.select({
      android: {
        color: ERROR_COLOR,
        marginLeft: -7,
        marginTop: -14,
        height: 44,
        fontSize: FONT_SIZE,
      },
      ios: {},
    }),
  },
  pickerTouchable: {
    normal: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    error: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    active: {
      borderBottomWidth: 1,
      paddingBottom: 12,
      borderColor: BORDER_COLOR,
    },
    notEditable: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: DISABLED_BACKGROUND_COLOR,
    },
  },
  pickerValue: {
    normal: {
      fontSize: FONT_SIZE,

      color: INPUT_COLOR,
    },
    error: {
      fontSize: FONT_SIZE,

      color: ERROR_COLOR,
    },
  },
  datepicker: {
    normal: {
      marginBottom: 4,
    },
    // the style applied when a validation error occours
    error: {
      marginBottom: 4,
    },
  },
  dateTouchable: {
    normal: {},
    error: {},
    notEditable: {
      backgroundColor: DISABLED_BACKGROUND_COLOR,
    },
  },
  dateValue: {
    normal: {
      color: INPUT_COLOR,
      fontSize: FONT_SIZE,

      paddingVertical: 7,
      marginBottom: 5,
    },
    error: {
      color: ERROR_COLOR,
      fontSize: FONT_SIZE,

      padding: 7,
      marginBottom: 5,
    },
  },
  buttonText: {
    fontSize: 18,

    color: 'white',
    alignSelf: 'center',
  },
  button: {
    height: 36,
    backgroundColor: '#48BBEC',
    borderColor: '#48BBEC',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
});

export default stylesheet;
