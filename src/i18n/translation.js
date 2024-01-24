import { nextTick } from "vue";
import i18n from "@/i18n";

const { t, te } = i18n.global;

function getDefaultLocale() {
  return process.env.VUE_APP_DEFAULT_LOCALE;
}

function getSupportLocales() {
  return process.env.VUE_APP_SUPPORT_LOCALES.split(",");
}

export function getLocalesLabels() {
  return getSupportLocales().map((locale) => {
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
  return getSupportLocales().includes(locale);
}

/**
 * @param {String} locale
 * @returns {Boolean}
 */
function isLocaleLoaded(locale) {
  return i18n.global.availableLocales.includes(locale);
}

export function getLoadedLocales() {
  return i18n.global.availableLocales;
}

export async function setLanguage(locale) {
  if (!isLocaleLoaded(locale)) {
    await loadLocaleMessages(locale);
  }

  i18n.global.locale.value = locale;
  saveLocale(locale);

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
  if (!isShowLocaleInRoute(getCurrentLocale())) {
    return to;
  }

  return {
    ...to,
    params: {
      locale: getCurrentLocale(),
      ...to.params,
    },
  };
}

export function isShowLocaleInRoute(locale) {
  return locale !== getDefaultLocale();
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

export function guessDefaultLocale() {
  const savedLocale = getSavedLocale();
  if (savedLocale) {
    return savedLocale;
  }

  const userLocale = getUserLocale();
  if (isSupportLocale(userLocale)) {
    return userLocale;
  }

  return getDefaultLocale();
}

export function saveCurrentLocale() {
  saveLocale(getCurrentLocale());
}

function saveLocale(locale) {
  localStorage.setItem("locale", locale);
}

function getSavedLocale() {
  let locale = localStorage.getItem("locale");
  if (locale) {
    locale = locale.toLowerCase();
  }

  return isSupportLocale(locale) ? locale : null;
}

export function getUserLocale() {
  let locale =
    window.navigator.language ||
    window.navigator.userLanguage ||
    process.env.VUE_APP_DEFAULT_LOCALE;

  if (locale) {
    locale = locale.toLowerCase();
  }

  return locale.split("-")[0];
}
