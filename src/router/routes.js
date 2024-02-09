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
        component: () =>
          import(/* webpackChunkName: "home" */ "../views/TheHomeView.vue"),
      },
      {
        path: "about",
        name: "about",
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
