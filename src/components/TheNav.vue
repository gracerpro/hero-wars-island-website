<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, onMounted } from "vue";
import HeroClient from "@/api/HeroClient";
import SwitchLanguage from "./SwitchLanguage.vue";
import { createI18nRouteTo } from "@/i18n/translation";
import { useStore } from "vuex";
import SwitchTheme from "./SwitchTheme.vue";
import { IS_SHOW_MENU_MUTATION } from "@/store/mutation-types";

const { t } = useI18n();
const store = useStore();

const actualIsland = ref(null);
const navbarNav = ref(null);

onMounted(() => {
  const client = new HeroClient();

  client.island.getActual().then((island) => {
    actualIsland.value = island;
  });

  if (!import.meta.env.SSR) {
    import("bootstrap").then(({ Collapse }) => {
      navbarNav.value.addEventListener("hide.bs.collapse", () => {
        store.commit(IS_SHOW_MENU_MUTATION, false);
      });
      navbarNav.value.addEventListener("show.bs.collapse", () => {
        store.commit(IS_SHOW_MENU_MUTATION, true);
      });

      new Collapse(navbarNav.value, { toggle: store.state.isShowMenu });
    });
  }
});
</script>

<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container">
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div
        id="navbarNav"
        ref="navbarNav"
        class="collapse navbar-collapse"
      >
        <div class="navbar-nav app-navbar-nav">
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
            :to="createI18nRouteTo({ name: 'news' })"
            class="nav-link"
            >{{ t("common.news") }}</router-link
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
      </div>
      <switch-theme class="swith-theme" />
      <switch-language />
    </div>
  </nav>
</template>

<style scoped>
.swith-theme {
  margin-left: 16px;
  margin-right: 16px;
}

@media (max-width: 991px) {
  .swith-theme {
    margin-left: 0;
    margin-top: 8px;
  }

  .app-navbar-nav {
    margin-top: 8px;
    margin-bottom: 8px;
  }
}
</style>
