import { config } from '@vue/test-utils'
import en from './src/i18n/locales/en.json'
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './src/router/routes.ts';
import { createI18n } from './src/i18n';

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
  linkActiveClass: "active",
  linkExactActiveClass: "",
})
const i18n = createI18n("en", { en });

config.global.plugins = [i18n, router];
