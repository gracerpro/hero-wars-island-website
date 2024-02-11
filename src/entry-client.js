import createApp from "./main2.js";

console.log("client");

const { app, router } = createApp();

router.onReady(() => {
  console.log("client. router on Ready");

  app.mount("#app");
});
