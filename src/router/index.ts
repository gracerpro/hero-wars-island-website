import { createMemoryHistory, createRouter as _createRouter, createWebHistory, type Router, type NavigationGuardNext, type RouteLocationNormalizedGeneric, type RouteLocationNormalizedLoadedGeneric } from "vue-router";
import {
  getCurrentLocale,
  guessDefaultLocale,
  isSupportLocale,
  setLanguage,
  isShowLocaleInRoute,
  createI18nRouteTo,
} from "@/i18n/translation";
import routes from "./routes";

export function createRouter() {
  const router = _createRouter({
    history: import.meta.env.SSR
      ? createMemoryHistory(import.meta.env.VITE_BASE_URL)
      : createWebHistory(import.meta.env.VITE_BASE_URL),
    routes,
    linkActiveClass: "active",
    linkExactActiveClass: "",
  });

  addBeforeEach(router);

  return router;
}

function addBeforeEach(router: Router) {
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
          return next(
            createI18nRouteTo(
              { name: "page-not-found", query: { returnUrl: to.path } },
              guessDefaultLocale()
            )
          );
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

function callNext(
  next: NavigationGuardNext,
  to: RouteLocationNormalizedGeneric,
  from: RouteLocationNormalizedLoadedGeneric
) {
  if (!import.meta.env.SSR && import.meta.env.VITE_YANDEX_METRIC_ID > 0) {
    window.ym(parseInt(import.meta.env.VITE_YANDEX_METRIC_ID), "hit", to.path, {
      params: {
        referer: from.path,
      },
    });
  }

  next();
}
