// @ts-nocheck
import t from 'tcomb-form-native-cr'
import i18nEn from './i18n/en'
import stylesheet from './stylesheet'
import templates from './templates'
import { getUserLocale } from '../../helpers/i18n'

let i18n = i18nEn
const userLocale = getUserLocale()

t.form.Form.stylesheet = stylesheet
t.form.Form.templates = templates
t.form.Form.defaultProps.stylesheet = stylesheet
t.form.Form.defaultProps.templates = templates
t.form.Form.defaultProps.i18n = i18n
