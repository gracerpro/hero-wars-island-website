import { createI18nRouteTo, guessDefaultLocale } from "@/i18n/translation";

export default [
  {
    path: "/:locale?",
    children: [
      {
        path: "",
        name: "home",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import("../views/TheHome.vue"),
      },
      {
        path: "about",
        name: "about",
        component: () => import("../views/TheAbout.vue"),
      },
      {
        path: "contact",
        name: "contact",
        component: () => import("../views/TheContact.vue"),
      },
      {
        path: "islands/:id(\\d+)",
        name: "island",
        component: () => import("../views/TheIsland.vue"),
      },
      {
        path: "help",
        name: "help",
        component: () => import("../views/TheHelp.vue"),
      },
      {
        path: "news",
        name: "news",
        component: () => import("../views/TheNews.vue"),
      },
      {
        path: "news/:slug([a-zA-Z0-9\\-]+)",
        name: "newsView",
        component: () => import("../views/TheNewsView.vue"),
      },
      {
        path: "page-not-found",
        name: "page-not-found",
        component: () => import("../views/status-pages/ThePageNotFound.vue"),
      },
    ],
  },
  {
    path: "/internal-server-error",
    name: "internal-server-error",
    component: () => import("../views/status-pages/TheInternalServerError.vue"),
  },
  {
    // [Vue Router warn]: Discarded invalid param(s) "catchAll" when navigating. See https://github.com/vuejs/router/blob/main/packages/router/CHANGELOG.md#414-2022-08-22 for more details
    path: "/:catchAll(.*)",
    redirect: (to) => {
      return createI18nRouteTo(
        { name: "page-not-found", query: { returnUrl: to.path } },
        guessDefaultLocale()
      );
    },
  },
];
