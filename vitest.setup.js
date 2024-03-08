import { config } from '@vue/test-utils'
import en from "@/i18n/locales/en.json";
import { createRouter, createWebHistory } from 'vue-router';
import routes from '@/router/routes';
import { createI18n } from '@/i18n';

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
  linkActiveClass: "active",
  linkExactActiveClass: "",
})
const i18n = createI18n("en", { en });

config.global.plugins = [i18n, router];
