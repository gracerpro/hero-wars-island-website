import { createSSRApp } from "vue";
import App from "./App.vue";
import { createRouter } from "./router";
import store from "./store/index.js";

// TODO: only client?
import "bootstrap/dist/css/bootstrap.min.css";

import * as Sentry from "@sentry/vue";
import { createI18n } from "@/i18n";

export default function createApp() {
  const app = createSSRApp(App);
  const router = createRouter();
  const i18n = createI18n();

  if (!import.meta.env.SSR && import.meta.env.VITE_USE_SENTRY > 0) {
    initSentry(app);
  }

  app.use(store).use(router).use(i18n);

  return {
    app,
    router
  }
}

function initSentry(app) {
  Sentry.init({
    app,
    dsn: "https://e6453d231e745bf943c79277ccdc8890@o514031.ingest.sentry.io/4506580248297472",
    integrations: [
      new Sentry.BrowserTracing({
        // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
        tracePropagationTargets: [import.meta.env.VITE_BACKEND_API_URL],
      }),
      new Sentry.Replay({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });
}

/* TODO:
For example default locale is "en", route is "/ru", problem:
1. The English menu is displayed for a short time
1. Send request with "en" locale in Nav-component, before setLanguage in router

Make a messages loading before setup component
*/
