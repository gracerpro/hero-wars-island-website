import createApp from "./main";

console.log("client");

const { app, router } = createApp();

router.onReady(() => {
  console.log("client. router on Ready");
  
  app.mount("#app");
});
