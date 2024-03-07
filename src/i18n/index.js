import ru from "./locales/ru.json";
import { createI18n as _createI18n } from "vue-i18n";

// TODO: this is global state, then Application creating this variable must be sets
let i18n = null;

export function createI18n() {
  const locale = import.meta.env.VITE_DEFAULT_LOCALE;

  i18n = _createI18n({
    locale,
    fallbackLocale: locale,
    legacy: false,
    allowComposition: true,
    globalInjection: false,
    messages: { ru },
    warnHtmlMessage: false,
  });

  return i18n;
}

export function useI18n() {
  return i18n.global;
}
