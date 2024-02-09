import createApp from './main';

console.log("server");

export default (context) => {
  return new Promise((resolve, reject) => {
    console.log("server. router on ready");
    console.log(context);

    // на каждый запрос создается экземпляр Vue
    const { app, router } = createApp();
    
    router.push(context.url);

    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents();

      if (!matchedComponents.length) {
        return reject(new Error(404));
      }

      return resolve(app);
    }, reject);
  })
};
