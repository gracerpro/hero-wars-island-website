<script setup lang="ts">
/* global console */

import TheNav from './components/TheNav.vue'
import TheGlobalNotify from './components/TheGlobalNotify.vue'
import { loadGlobalData, type GlobalData } from './services/api/global-data'
import { ref } from 'vue'
import { clearGlobalNotifications } from './store'
import { useStore } from 'vuex'
import { setTheme } from './core/theme'
import type { Notification } from './api/NotificationApi'

const notifications = ref<Array<Notification>>([])
const store = useStore()

if (!import.meta.env.SSR) {
  loadGlobalData()
    .then((globalData: GlobalData) => {
      notifications.value = globalData.notifications
      clearGlobalNotifications(store.state, globalData.notifications)
    })
    .catch((error) => {
      console.error(error)
      // TODO: log it...
    })

  setTheme(store.state.theme)
}
</script>

<template>
  <the-nav />
  <the-global-notify :notifications="notifications" />
  <router-view />
</template>
