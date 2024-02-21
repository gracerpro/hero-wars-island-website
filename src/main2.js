// app.js (shared between server and client)
import { createSSRApp } from 'vue';
import AppTwo from "./AppTwo.vue";

export default function createApp() {
  const app = createSSRApp(AppTwo);

  return {
    app,
    router: null,
  }
}
