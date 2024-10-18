// refer to https://github.com/gcanti/tcomb-form-native/tree/master/lib/templates/bootstrap

import textbox from './textbox'
// import checkbox from './checkbox'
// import policyCheckbox from './policyCheckbox'
// import newPolicyCheckBox from './newPolicyCheckBox'
import switchComponent from './switch'
import select from './select'
// import radioSelect from './radioSelect'
import datepicker from './datepicker'
import struct from './struct'
import list from './list'

const templates = {
  textbox,
  // checkbox,
  // policyCheckbox,
  // newPolicyCheckBox,
  switch: switchComponent,
  select,
  // radioSelect,
  datepicker,
  struct,
  list,
}

export default templates
