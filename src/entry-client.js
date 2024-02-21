import createApp from "./main.js";

const { app, router } = createApp();

if (router) {
  router.isReady().then(() => {
    app.mount("#app");
  });
} else {
  app.mount("#app");
}
