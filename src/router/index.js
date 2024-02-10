import { createMemoryHistory, createRouter, createWebHistory } from "vue-router";
import {
  getCurrentLocale,
  guessDefaultLocale,
  isSupportLocale,
  setLanguage,
  isShowLocaleInRoute,
} from "@/i18n/translation";
import routes from "./routes";

const router = createRouter({
  history: process.env.SSR
    ? createMemoryHistory(process.env.BASE_URL)
    : createWebHistory(process.env.BASE_URL),
  routes,
  linkActiveClass: "active",
  linkExactActiveClass: "",
});

router.beforeEach(async (to, from, next) => {
  if (to.path.length > 1 && to.path.endsWith("/")) {
    const newTo = { ...to };
    newTo.path = to.path.slice(0, -1);

    return next(newTo);
  }

  const paramsLocale = to.params.locale;
  if (paramsLocale) {
    if (!isSupportLocale(paramsLocale)) {
      if (paramsLocale !== "page-not-found") {
        return next({ path: "/page-not-found", query: { returnUrl: to.path } });
      }
    } else if (paramsLocale !== getCurrentLocale()) {
      await setLanguage(paramsLocale);
    }
  } else {
    const guessLocale = guessDefaultLocale();
    if (isShowLocaleInRoute(guessLocale)) {
      if (to.name !== "page-not-found") {
        return next("/" + guessLocale);
      }
    }
  }

  callNext(next, to, from);
});

/**
 * @param {Function} next
 * @param {Function} from
 * @param {Object} to
 */
function callNext(next, to, from) {
  if (process.env.VUE_APP_YANDEX_METRIC_ID > 0) {
    window.ym(parseInt(process.env.VUE_APP_YANDEX_METRIC_ID), "hit", to.path, {
      params: {
        referer: from.path,
      },
    });
  }

  next();
}

export default router;
