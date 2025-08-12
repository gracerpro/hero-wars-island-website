<script setup lang="ts">
/* global HTMLElement */

import { useI18n } from 'vue-i18n'
import { ref, onMounted } from 'vue'
import HeroClient from '@/api/HeroClient'
import SwitchLanguage from './SwitchLanguage.vue'
import { createI18nRouteTo } from '@/i18n/translation'
import SwitchTheme from './SwitchTheme.vue'
import { type Island } from '@/api/IslandApi'
import { useMainStore } from '@/store/main'

const { t } = useI18n()
const store = useMainStore()

const actualIsland = ref<Island | null>(null)
const navbarNavRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const client = new HeroClient()

  client.island.getActual().then((island) => {
    actualIsland.value = island
  })

  if (!import.meta.env.SSR) {
    InitCollapse(navbarNavRef.value as HTMLElement)
  }
})

async function InitCollapse(navElement: HTMLElement) {
  const module = await import('bootstrap')

  navElement.addEventListener('hide.bs.collapse', () => {
    store.updateIsShowMenu(false)
  })
  navElement.addEventListener('show.bs.collapse', () => {
    store.updateIsShowMenu(true)
  })

  new module.Collapse(navElement, { toggle: store.isShowMenu })
}
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
        ref="navbarNavRef"
        class="collapse navbar-collapse"
      >
        <div class="navbar-nav app-navbar-nav">
          <router-link
            :to="createI18nRouteTo({ name: 'home' })"
            class="nav-link"
            >{{ t('common.homePage') }}</router-link
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
            >{{ t('common.actualIsland') }}</router-link
          >
          <router-link
            :to="createI18nRouteTo({ name: 'contact' })"
            class="nav-link"
            >{{ t('common.contacts') }}</router-link
          >
          <router-link
            :to="createI18nRouteTo({ name: 'news' })"
            class="nav-link"
            >{{ t('common.news') }}</router-link
          >
          <router-link
            :to="createI18nRouteTo({ name: 'about' })"
            class="nav-link"
            >{{ t('common.about') }}</router-link
          >
          <router-link
            :to="createI18nRouteTo({ name: 'help' })"
            class="nav-link"
            >{{ t('common.help') }}</router-link
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
