import { createRouter, createWebHistory } from "vue-router";
import TheHomeView from "../views/TheHomeView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: TheHomeView,
  },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/TheAboutView.vue"),
  },
  {
    path: "/contact",
    name: "contact",
    component: () =>
      import(/* webpackChunkName: "contact" */ "../views/TheContactView.vue"),
  },
  {
    path: "/islands/:id",
    name: "island",
    component: () =>
      import(/* webpackChunkName: "island" */ "../views/TheIslandView.vue"),
  },
  {
    path: "/help",
    name: "help",
    component: () =>
      import(/* webpackChunkName: "help" */ "../views/TheHelpView.vue"),
  },
  {
    path: "/404",
    name: "404",
    component: () =>
      import(
        /* webpackChunkName: "404" */ "../views/status-pages/NotFoundPage.vue"
      ),
  },
  {
    path: "/:catchAll(.*)",
    redirect: (to) => {
      return { path: "/404", query: { returnUrl: to.path } };
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkActiveClass: "active",
  linkExactActiveClass: "",
});

router.beforeEach((to, from, next) => {
  if (to.path.length > 1 && to.path.endsWith("/")) {
    const newTo = { ...to };
    newTo.path = to.path.slice(0, -1);

    next(newTo);
    return;
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
