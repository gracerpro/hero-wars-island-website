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
        component: () => import("../views/TheHome.vue")},
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
    path: "/:catchAll(.*)",
    redirect: (to) => {
      return createI18nRouteTo(
        { name: "page-not-found", query: { returnUrl: to.path } },
        guessDefaultLocale()
      )
    },
  },
];
