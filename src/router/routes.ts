import { createI18nRouteTo, guessDefaultLocale } from '@/i18n/translation'
import type { RouteRecordInfo, RouteRecordRaw } from 'vue-router'

export interface RouteNamedMap {
  locale: {
    path: '/:locale?'
    children: {
      home: RouteRecordInfo<
        // here we have the same name
        'home',
        // this is the path, it will appear in autocompletion
        '/',
        // these are the raw params (what can be passed to router.push() and RouterLink's "to" prop)
        // In this case, there are no params allowed
        Record<never, never>,
        // these are the normalized params (what you get from useRoute())
        Record<never, never>,
        // this is a union of all children route names, in this case, there are none
        never
      >
      about: RouteRecordInfo<'about', '/about', Record<never, never>, Record<never, never>, never>
      contact: RouteRecordInfo<
        'contact',
        '/contact',
        Record<never, never>,
        Record<never, never>,
        never
      >
      'island-view': RouteRecordInfo<
        'island-view',
        '/islands/:id(\\d+)',
        { id: number | string },
        { id: string },
        never
      >
      help: RouteRecordInfo<'help', '/help', Record<never, never>, Record<never, never>, never>
      news: RouteRecordInfo<'news', '/news', Record<never, never>, Record<never, never>, never>
      'news-view': RouteRecordInfo<
        'news-view',
        '/news/:slug([a-zA-Z0-9\\-]+)',
        { slug: string },
        { slug: string },
        never
      >
      'page-not-found': RouteRecordInfo<
        'page-not-found',
        '/page-not-found',
        Record<never, never>,
        Record<never, never>,
        never
      >
      'internal-server-error': RouteRecordInfo<
        'internal-server-error',
        '/internal-server-error',
        Record<never, never>,
        Record<never, never>,
        never
      >
    }
  }
}

// Last, you will need to augment the Vue Router types with this map of routes
declare module 'vue-router' {
  // TODO: typed routes
  /* interface TypesConfig {
    RouteNamedMap: RouteNamedMap
  }*/
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:locale?',
    children: [
      {
        path: '',
        name: 'home',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import('../views/home/IndexPage.vue'),
      },
      {
        path: 'about',
        name: 'about',
        component: () => import('../views/TheAbout.vue'),
      },
      {
        path: 'contact',
        name: 'contact',
        component: () => import('../views/contact/IndexPage.vue'),
      },
      {
        path: 'islands/:id(\\d+)',
        name: 'island',
        component: () => import('../views/island-view/IndexPage.vue'),
      },
      {
        path: 'islands',
        name: 'islands',
        component: () => import('../views/islands/IndexPage.vue'),
      },
      {
        path: 'help',
        name: 'help',
        component: () => import('../views/TheHelp.vue'),
      },
      {
        path: 'news',
        name: 'news',
        component: () => import('../views/news/IndexPage.vue'),
      },
      {
        path: 'news/:slug([a-zA-Z0-9\\-]+)',
        name: 'newsView',
        component: () => import('../views/TheNewsView.vue'),
      },
      {
        path: 'page-not-found',
        name: 'page-not-found',
        component: () => import('../views/status-pages/ThePageNotFound.vue'),
      },
      {
        path: 'internal-server-error',
        name: 'internal-server-error',
        component: () => import('../views/status-pages/TheInternalServerError.vue'),
      },
    ],
  },
  {
    path: '/:path(.*)*',
    redirect: (to) => {
      return createI18nRouteTo(
        { name: 'page-not-found', query: { returnUrl: to.path } },
        guessDefaultLocale()
      )
    },
  },
] as const

export { routes }
