import { nextTick } from "vue";
import i18n from "@/i18n";

const { t, te } = i18n.global;

export const SUPPORT_LOCALES = ["ru", "en"];

export function getDefaultLocale() {
  return process.env.VUE_APP_DEFAULT_LOCALE;
}

export function getLocalesLabels() {
  return SUPPORT_LOCALES.map((locale) => {
    return {
      locale,
      label: te("locale." + locale) ? t("locale." + locale) : locale,
    };
  });
}

export function getCurrentLocale() {
  return i18n.global.locale.value;
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
export function isLocaleLoaded(locale) {
  console.log("availableLocales", i18n.global.availableLocales);
  return i18n.global.availableLocales.includes(locale);
}

export async function setLanguage(locale) {
  console.log("setLanguage", locale);

  if (!isLocaleLoaded(locale)) {
    await loadLocaleMessages(locale);
  }

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

/**
 * @param {Object} to
 * @returns {Object}
 */
export function createI18nRouteTo(to) {
  return {
    ...to,
    params: {
      locale: getCurrentLocale(),
      ...to.params,
    },
  };
}

export async function loadLocaleMessages(locale) {
  if (!isLocaleLoaded(locale)) {
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
