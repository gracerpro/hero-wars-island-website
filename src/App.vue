<script setup>
import TheNav from "./components/TheNav.vue";
import TheGlobalNotify from "./components/TheGlobalNotify.vue";
</script>

<template>
  <the-nav />
  <the-global-notify />
  <router-view />
</template>
