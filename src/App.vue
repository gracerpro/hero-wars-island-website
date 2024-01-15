<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container">
      <div class="navbar-nav">
        <router-link to="/" class="nav-link">Главная</router-link>
        <router-link
          v-if="actualIsland"
          :to="{ name: 'island', params: { id: actualIsland.id } }"
          class="nav-link"
          >Актуальный остров</router-link
        >
        <router-link to="/contact" class="nav-link">Контакты</router-link>
        <router-link to="/about" class="nav-link">О проекте</router-link>
        <router-link to="/help" class="nav-link">Помощь</router-link>
      </div>
    </div>
  </nav>
  <router-view />
</template>
<script setup>
import HeroClient from "./api/HeroClient";
import { ref } from "vue";

const client = new HeroClient();

const actualIsland = ref(null);

client.getActualIsland().then((island) => {
  actualIsland.value = island;
});
</script>
