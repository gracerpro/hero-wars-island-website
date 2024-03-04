import { createSSRApp } from "vue";
import App from "./App.vue";
import { createRouter } from "./router";
import { createStore } from "./store/index.js";
import "bootstrap/dist/css/bootstrap.min.css";
import { createI18n } from "@/i18n";

export default function createApp() {
  const app = createSSRApp(App);
  const router = createRouter();
  const i18n = createI18n();
  const store = createStore();

  if (!import.meta.env.SSR && import.meta.env.VITE_USE_SENTRY > 0) {
    initSentry(app, router);
  }

  app.use(store).use(router).use(i18n);

  return {
    app,
    router,
    store,
  };
}

async function initSentry(app, router) {
  const Sentry = await import("@sentry/vue");

  Sentry.init({
    app,
    dsn: "https://e6453d231e745bf943c79277ccdc8890@o514031.ingest.sentry.io/4506580248297472",
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ["localhost", import.meta.env.VITE_BACKEND_API_URL],

    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });
}
