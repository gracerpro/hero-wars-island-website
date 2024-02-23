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
    ],
  },
  {
    path: "/page-not-found",
    name: "page-not-found",
    component: () => import("../views/status-pages/ThePageNotFound.vue"),
  },
  {
    path: "/:catchAll(.*)",
    redirect: (to) => {
      return { path: "/page-not-found", query: { returnUrl: to.path } };
    },
  },
];
