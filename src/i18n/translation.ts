import { nextTick } from "vue";
import { useI18n } from "@/i18n";

function getDefaultLocale(): string {
  return import.meta.env.VITE_DEFAULT_LOCALE;
}

export type LocaleLabel = {
  locale: string,
  label: string
}

export function getLocalesLabels(): Array<LocaleLabel> {
  const { t, te } = useI18n();

  return getSupportLocales().map((locale: string) => {
    return {
      locale,
      label: te("locale." + locale) ? t("locale." + locale) : locale,
    };
  });
}

export function isSupportLocale(locale: string): boolean {
  return getSupportLocales().includes(locale);
}

function getSupportLocales(): string[] {
  return import.meta.env.VITE_SUPPORT_LOCALES.split(",");
}

export function getCurrentLocale(): string {
  const i18n = useI18n();

  return i18n.locale.value;
}

export function createI18nRouteTo(to: any, locale: string | null = null): object {
  locale = locale !== null ? locale : getCurrentLocale();

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

export function isShowLocaleInRoute(locale: string): boolean {
  return locale !== getDefaultLocale();
}

async function loadLocaleMessages(locale: string): Promise<void> {
  if (!isLocaleLoaded(locale)) {
    const messages = await import(`./locales/${locale}.json`);
    const i18n = useI18n();

    i18n.setLocaleMessage(locale, messages.default);
  }

  return nextTick();
}

function isLocaleLoaded(locale: string): boolean {
  const i18n = useI18n();

  return i18n.availableLocales.includes(locale);
}

function saveLocale(locale: string) {
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

  const locale = localStorage.getItem("locale");
  if (locale !== null) {
    return isSupportLocale(locale.toLowerCase());
  }

  return null;
}

export async function setLanguage(locale: string) {
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
    (document.querySelector<HTMLInputElement>("html") as HTMLInputElement).setAttribute("lang", locale);
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
    locale = window.navigator.language /* TODO: || window.navigator.userLanguage; */

  }
  if (locale) {
    locale = locale.toLowerCase();
  } else {
    locale = import.meta.env.VITE_DEFAULT_LOCALE;
  }

  return locale.split("-")[0];
}
