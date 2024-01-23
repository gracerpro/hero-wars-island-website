import ru from "./locales/ru.json";
import en from "./locales/en.json";
import { createI18n } from "vue-i18n";

const locale = process.env.VUE_APP_DEFAULT_LOCALE;
console.log(locale);
const i18n = createI18n({
  locale,
  fallbackLocale: locale,
  legacy: false,
  globalInjection: true,
  messages: { ru, en },
  warnHtmlMessage: false,
});

console.log("after setup i18n", i18n);

export default i18n;
