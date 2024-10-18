import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

import en from './en';

const i18n = new I18n({
  en
});
i18n.defaultLocale = 'en';
i18n.locale = Localization.locale;
i18n.enableFallback = true;
i18n.locales.register('no', ['en']);
const t = i18n.translate.bind(i18n);

const getUserLocale = () => {
  return 'en';
//   if (Localization.locale == 'tr-TR' || Localization.locale == 'tr') {
//     return 'tr'
//   } else {
//     return 'en'
//   }
}


export { i18n, t, getUserLocale };
export default I18n;
