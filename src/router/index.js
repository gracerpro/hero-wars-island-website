import { createMemoryHistory, createRouter as _createRouter, createWebHistory } from "vue-router";
import {
  getCurrentLocale,
  guessDefaultLocale,
  isSupportLocale,
  setLanguage,
  isShowLocaleInRoute,
} from "@/i18n/translation";
import routes from "./routes";

console.log("route SSR", import.meta.env.SSR ? 1 : 0);

export function createRouter() {
  console.log("createRouter CALL");

  const router = _createRouter({
    history: import.meta.env.SSR > 0
      ? createMemoryHistory(import.meta.env.BASE_URL)
      : createWebHistory(import.meta.env.BASE_URL),
    routes,
    linkActiveClass: "active",
    linkExactActiveClass: "",
  })

  addBeforeEach(router);

  return router;
};

function addBeforeEach(router) {
  router.beforeEach(async (to, from, next) => {
    console.log(from?.path, to.path);

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
}

/**
 * @param {Function} next
 * @param {Function} from
 * @param {Object} to
 */
function callNext(next, to, from) {
  if (import.meta.env.VITE_YANDEX_METRIC_ID > 0) {
    window.ym(parseInt(import.meta.env.VITE_YANDEX_METRIC_ID), "hit", to.path, {
      params: {
        referer: from.path,
      },
    });
  }

  next();
}
