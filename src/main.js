import { createSSRApp } from "vue";
import App from "./App.vue";
import { createRouter } from "./router";
import { createStore } from "./store/index.js";
import { createI18n } from "@/i18n";

import "@/assets/style.scss";
import "@/assets/icons.css";
import "@/assets/main.css";

export default function createApp() {
  const app = createSSRApp(App);
  const router = createRouter();
  const i18n = createI18n();
  const store = createStore();

  app.use(store).use(router).use(i18n);

  return {
    app,
    router,
    store,
  };
}
