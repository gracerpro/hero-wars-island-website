import { createRouter, createWebHistory } from "vue-router";
import TheHomeView from "../views/TheHomeView.vue";
import { getCurrentLocale, guessDefaultLocale, isSupportLocale, setLanguage } from "@/i18n/translation";

const routes = [
  {
    path: "/:locale?",
    children: [
      {
        path: "",
        name: "home",
        component: TheHomeView,
      },
      {
        path: "about",
        name: "about",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "about" */ "../views/TheAboutView.vue"),
      },
      {
        path: "contact",
        name: "contact",
        component: () =>
          import(
            /* webpackChunkName: "contact" */ "../views/TheContactView.vue"
          ),
      },
      {
        path: "islands/:id",
        name: "island",
        component: () =>
          import(/* webpackChunkName: "island" */ "../views/TheIslandView.vue"),
      },
      {
        path: "help",
        name: "help",
        component: () =>
          import(/* webpackChunkName: "help" */ "../views/TheHelpView.vue"),
      },
    ],
  },
  {
    path: "/page-not-found",
    name: "page-not-found",
    component: () =>
      import(
        /* webpackChunkName: "page-not-found" */ "../views/status-pages/NotFoundPage.vue"
      ),
  },
  {
    path: "/:catchAll(.*)",
    redirect: (to) => {
      return { path: "/page-not-found", query: { returnUrl: to.path } };
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkActiveClass: "active",
  linkExactActiveClass: "",
});

router.beforeEach(async (to, from, next) => {
  console.log("from", from.path, "to", to.path);

  if (to.path.length > 1 && to.path.endsWith("/")) {
    const newTo = { ...to };
    newTo.path = to.path.slice(0, -1);

    return next(newTo);
  }

  const paramsLocale = to.params.locale;
  if (paramsLocale) {
    console.log("paramsLocale", paramsLocale, "isSupport", isSupportLocale(paramsLocale));
    if (!isSupportLocale(paramsLocale)) {
      if (paramsLocale !== "page-not-found") {
        return next({ path: "/page-not-found", query: { returnUrl: to.path } });
      }
      // return next("/" + guessDefaultLocale()); // may be throw 404 error?
    } else if (paramsLocale !== getCurrentLocale()) {
      await setLanguage(paramsLocale);
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
