import { nextTick } from "vue";
import { useI18n } from "@/i18n";

/**
 * @returns {String}
 */
function getDefaultLocale() {
  return import.meta.env.VITE_DEFAULT_LOCALE;
}

/**
 * @returns {Array<Object>}
 */
export function getLocalesLabels() {
  const { t, te } = useI18n();

  return getSupportLocales().map((locale) => {
    return {
      locale,
      label: te("locale." + locale) ? t("locale." + locale) : locale,
    };
  });
}

/**
 * @param {String} locale
 * @returns {Boolean}
 */
export function isSupportLocale(locale) {
  return getSupportLocales().includes(locale);
}

/**
 * @returns {Array<String>}
 */
function getSupportLocales() {
  return import.meta.env.VITE_SUPPORT_LOCALES.split(",");
}





/**
 * @returns {String}
 */
export function getCurrentLocale() {
  const i18n = useI18n();

  return i18n.locale.value;
}

/**
 * @param {Object} to
 * @returns {Object}
 */
export function createI18nRouteTo(to) {
  const locale = getCurrentLocale();

  if (!isShowLocaleInRoute(locale)) {
    return to;
  }

  return {
    ...to,
    params: {
      locale,
      ...to.params,
    },
  };
}

/**
 * @param {String} locale
 * @returns {Boolean}
 */
export function isShowLocaleInRoute(locale) {
  return locale !== getDefaultLocale();
}

/**
 * @param {String} locale
 * @returns {Promise}
 */
async function loadLocaleMessages(locale) {
  if (!isLocaleLoaded(locale)) {
    const messages = await import(`./locales/${locale}.json`);
    const i18n = useI18n();

    i18n.setLocaleMessage(locale, messages.default);
  }

  return nextTick();
}

/**
 * @param {String} locale
 * @returns {Boolean}
 */
function isLocaleLoaded(locale) {
  const i18n = useI18n();

  return i18n.availableLocales.includes(locale);
}

/**
 * @param {String} locale 
 */
function saveLocale(locale) {
  if (import.meta.env.SSR) {
    return;
  }
  localStorage.setItem("locale", locale);
}

/**
 * @returns {String|null}
 */
function getSavedLocale() {
  if (import.meta.env.SSR) {
    return null;
  }

  let locale = localStorage.getItem("locale");
  if (locale) {
    locale = locale.toLowerCase();
  }

  return isSupportLocale(locale) ? locale : null;
}






export async function setLanguage(locale) {
  if (!isLocaleLoaded(locale)) {
    await loadLocaleMessages(locale);
  }

  const i18n = useI18n();
  i18n.locale.value = locale;
  saveLocale(locale);

  if (!import.meta.env.SSR) {
    /**
     * NOTE:
     * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
     * The following is an example for axios.
     *
     * axios.defaults.headers.common['Accept-Language'] = locale
     */
    document.querySelector("html").setAttribute("lang", locale);
  }
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

function getUserLocale() {
  let locale;

  if (!import.meta.env.SSR) {
    locale = window.navigator.language ||
      window.navigator.userLanguage;
  }
  if (locale) {
    locale = locale.toLowerCase();
  } else {
    locale = import.meta.env.VITE_DEFAULT_LOCALE
  }

  return locale.split("-")[0];
}
