import createApp from './main'

const { app, router, store } = createApp()

router.isReady().then(() => {
  if (window.__INITIAL_STATE__) {
    store.replaceState(JSON.parse(window.__INITIAL_STATE__))
  }

  app.mount('#app')
})
