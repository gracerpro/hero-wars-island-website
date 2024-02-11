// app.js (shared between server and client)
import { createSSRApp } from 'vue'

export default function createApp() {
  const app = createSSRApp({
    data: () => ({ count: 1 }),
    template: `<button @click="count++">{{ count }}</button>`
  });

  return {
    app,
    router: null,
  }
}
