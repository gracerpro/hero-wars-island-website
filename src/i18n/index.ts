import { createI18n as _createI18n, type Composer, type I18n } from "vue-i18n";

let i18n: I18n

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Messages = {ru: any, en?: any}

export function createI18n(locale: string, messages: Messages) {
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

export function useI18n(): Composer {
  return i18n.global as Composer;
}
