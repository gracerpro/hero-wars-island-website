import ru from "./locales/ru.json";
import { createI18n as _createI18n } from "vue-i18n";

let i18n = null;

export function createI18n(locale, messages) {
  if (!locale) {
    locale = import.meta.env.VITE_DEFAULT_LOCALE;
  }
  if (!messages) {
    messages = { ru };
  }

  i18n = _createI18n({
    locale,
    fallbackLocale: locale,
    legacy: false,
    allowComposition: true,
    globalInjection: false,
    messages,
    warnHtmlMessage: false,
  });

  return i18n;
}

export function useI18n() {
  return i18n.global;
}
