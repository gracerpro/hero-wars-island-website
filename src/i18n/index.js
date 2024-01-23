import { setupI18n } from "./translation";
import ru from "./locales/ru.json";
import en from "./locales/en.json";

const i18n = setupI18n({
  locale: process.env.VUE_APP_DEFAULT_LOCALE,
  fallbackLocale: process.env.VUE_APP_DEFAULT_LOCALE,
  legacy: false,
  globalInjection: true,
  messages: { ru, en },
  warnHtmlMessage: false,
});

export default i18n;
