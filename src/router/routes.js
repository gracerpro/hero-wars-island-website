import TheHomeView from "../views/TheHomeView.vue";

export default [
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
        component: () => import("../views/TheAboutView.vue"),
      },
      {
        path: "contact",
        name: "contact",
        component: () => import("../views/TheContactView.vue"),
      },
      {
        path: "islands/:id",
        name: "island",
        component: () => import("../views/TheIslandView.vue"),
      },
      {
        path: "help",
        name: "help",
        component: () => import("../views/TheHelpView.vue"),
      },
    ],
  },
  {
    path: "/page-not-found",
    name: "page-not-found",
    component: () => import("../views/status-pages/NotFoundPage.vue"),
  },
  {
    path: "/:catchAll(.*)",
    redirect: (to) => {
      return { path: "/page-not-found", query: { returnUrl: to.path } };
    },
  },
];
