import createApp from "./main2.js";

const { app, router } = createApp();

console.log("client. before router");
router.onReady(() => {
  console.log("client. router on Ready");

  app.mount("#app");
});
