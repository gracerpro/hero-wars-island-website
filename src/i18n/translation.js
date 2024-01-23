import { createI18n } from "vue-i18n";
import { nextTick } from "vue";

const SUPPORT_LOCALES = ["ru", "en"];

export function getDefaultLocale() {
  return process.env.VUE_APP_DEFAULT_LOCALE;
}

export function setupI18n(
  options = { locale: process.env.VUE_APP_DEFAULT_LOCALE },
) {
  console.log(options);
  const i18n = createI18n(options);

  setLanguage(i18n, options.locale);

  return i18n;
}

export function getCurrentLocale(i18n) {
  return i18n.locale.value;
}

/**
 * @param {String} locale
 * @returns {Boolean}
 */
export function isSupportLocale(locale) {
  return SUPPORT_LOCALES.includes(locale);
}

/**
 * @param {String} locale
 * @returns {Boolean}
 */
export function isAvailableLocale(i18n, locale) {
  console.log("availableLocales", i18n.global.availableLocales);
  return i18n.global.availableLocales.includes(locale);
}

export function setLanguage(i18n, locale) {
  console.log("setLanguage", locale);
  i18n.global.locale.value = locale;

  /**
   * NOTE:
   * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
   * The following is an example for axios.
   *
   * axios.defaults.headers.common['Accept-Language'] = locale
   */
  document.querySelector("html").setAttribute("lang", locale);
}

export async function loadLocaleMessages(i18n, locale) {
  if (!isAvailableLocale(locale)) {
    const messages = await import(
      /* webpackChunkName: "locale-[request]" */ `./locales/${locale}.json`
    );

    i18n.global.setLocaleMessage(locale, messages.default);
  }

  return nextTick();
}

export function getUserLocale() {
  const locale =
    window.navigator.language ||
    window.navigator.userLanguage ||
    process.env.VUE_APP_DEFAULT_LOCALE;

  return {
    locale: locale,
    localeNoRegion: locale.split("-")[0],
  };
}

export { SUPPORT_LOCALES };
