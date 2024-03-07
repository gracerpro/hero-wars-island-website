import { config } from '@vue/test-utils'
import { createI18n } from "vue-i18n";
import en from "@/i18n/locales/en.json";
import { createRouter, createWebHistory } from 'vue-router';
import routes from '@/router/routes';

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
  linkActiveClass: "active",
  linkExactActiveClass: "",
})

const i18n = createI18n({
  locale: "en",
  fallbackLocale: "en",
  legacy: false,
  allowComposition: true,
  globalInjection: false,
  messages: { en },
  warnHtmlMessage: false,
});

config.global.plugins = [i18n, router];
