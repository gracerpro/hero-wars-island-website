<script setup lang="ts">
/* global console */

import TheNav from './components/TheNav.vue'
import TheGlobalNotify from './components/TheGlobalNotify.vue'
import { loadGlobalData, type GlobalData } from './services/api/global-data'
import { ref } from 'vue'
import { setTheme } from './core/theme'
import type { Notification } from './api/NotificationApi'
import { useNotificationStore } from './store/notification'
import { useMainStore } from './store/main'

const notifications = ref<Array<Notification>>([])
const store = useNotificationStore()
const mainStore = useMainStore()

if (!import.meta.env.SSR) {
  loadGlobalData()
    .then((globalData: GlobalData) => {
      notifications.value = globalData.notifications
      store.clear(globalData.notifications)
    })
    .catch((error) => {
      console.error(error)
      // TODO: log it
    })

  setTheme(mainStore.theme)
}
</script>

<template>
  <the-nav />
  <the-global-notify :notifications="notifications" />
  <router-view />
</template>
