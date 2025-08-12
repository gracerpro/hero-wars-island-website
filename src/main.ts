import { createSSRApp } from 'vue'
import App from './App.vue'
import { createRouter } from './router/index.js'
import { createI18n } from '@/i18n'
import ru from '@/i18n/locales/ru.json'

import '@/assets/style.scss'
import '@/assets/icons.css'
import '@/assets/main.css'
import { createPinia } from 'pinia'

export default function createApp() {
  const app = createSSRApp(App)
  const router = createRouter()
  const i18n = createI18n(import.meta.env.VITE_DEFAULT_LOCALE, { ru })
  const pinia = createPinia()

  app.use(pinia).use(router).use(i18n)

  return {
    app,
    router,
    pinia,
  }
}
