<script setup>
import { useI18n } from "vue-i18n";
import { ref, onMounted } from "vue";
import HeroClient from "@/api/HeroClient";
import SwitchLanguage from "./SwitchLanguage.vue";
import { createI18nRouteTo } from "@/i18n/translation";
import { useStore } from "vuex";
import { IS_SHOW_MENU_MUTATION } from "@/store/mutation-types";

const { t } = useI18n();
const store = useStore();

/** @type {Collapse} */
let collapseMenu = null;

const actualIsland = ref(null);

if (!import.meta.env.SSR) {
  import("bootstrap").then(({ Collapse }) => {
    const menu = document.getElementById("mainMenu");
    menu.addEventListener("hide.bs.collapse", () => {
      store.commit(IS_SHOW_MENU_MUTATION, false);
    });
    menu.addEventListener("show.bs.collapse", () => {
      store.commit(IS_SHOW_MENU_MUTATION, true);
    });

    collapseMenu = new Collapse(menu, { toggle: store.state.isShowMenu });
  });
}

onMounted(() => {
  const client = new HeroClient();

  client.island.getActual().then((island) => {
    actualIsland.value = island;
  });
});

function toggleMenu() {
  if (collapseMenu) {
    collapseMenu.toggle();
  }
}
</script>

<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container">
      <button
        class="navbar-toggler"
        type="button"
        aria-expanded="false"
        aria-label="Toggle navigation"
        @click="toggleMenu"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div
        id="mainMenu"
        class="navbar-collapse collapse"
      >
        <div class="navbar-nav mt-2 mb-3">
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
      <switch-language />
    </div>
  </nav>
</template>
