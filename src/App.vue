<script setup>
import TheNav from "./components/TheNav.vue";
import TheGlobalNotify from "./components/TheGlobalNotify.vue";
import { loadGlobalData } from "./services/api/global-data";
import { ref } from "vue";
import { clearGlobalNotifications } from "./store";
import { useStore } from "vuex";

const notifications = ref([]);
const store = useStore();

if (!import.meta.env.SSR) {
  loadGlobalData()
    .then((globalData) => {
      notifications.value = globalData.notifications;
      clearGlobalNotifications(store.state, globalData.notifications);
    })
    .catch((error) => {
      console.error(error);
      // log it...
    });
}
</script>

<template>
  <the-nav />
  <the-global-notify :notifications="notifications" />
  <router-view />
</template>
