<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container">
      <div class="navbar-nav">
        <router-link
          :to="createI18nRouteTo({ name: 'home' })"
          class="nav-link"
          >{{ t("common.homePage") }}</router-link
        >
        <router-link
          v-if="actualIsland"
          :to="
            createI18nRouteTo({
              name: 'island',
              params: { id: actualIsland.id },
            })
          "
          class="nav-link"
          >{{ t("common.actualIsland") }}</router-link
        >
        <router-link
          :to="createI18nRouteTo({ name: 'contact' })"
          class="nav-link"
          >{{ t("common.contacts") }}</router-link
        >
        <router-link
          :to="createI18nRouteTo({ name: 'about' })"
          class="nav-link"
          >{{ t("common.about") }}</router-link
        >
        <router-link
          :to="createI18nRouteTo({ name: 'help' })"
          class="nav-link"
          >{{ t("common.help") }}</router-link
        >
      </div>
      <switch-language />
    </div>
  </nav>
  <router-view />
</template>
<script setup>
import { useI18n } from "vue-i18n";
import HeroClient from "./api/HeroClient";
import { ref } from "vue";
import SwitchLanguage from "./components/SwitchLanguage.vue";
import { createI18nRouteTo } from "@/i18n/translation";

const { t } = useI18n();

const client = new HeroClient();

const actualIsland = ref(null);

client.getActualIsland().then((island) => {
  actualIsland.value = island;
});
</script>
