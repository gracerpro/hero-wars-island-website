<script setup lang="ts">
import { setMetaInfo } from '@/services/page-meta'
import { useI18n } from 'vue-i18n'
import { createI18nRouteTo } from '@/i18n/translation'
import { useSSRContext } from 'vue'
import IslandList from './IslandList.vue'
import NewsList from './NewsList.vue'

const { t } = useI18n()
const ssrContext = import.meta.env.SSR ? useSSRContext() : undefined

setMetaInfo(
  {
    title: t('common.projectName'),
    description: t('seo.home.description'),
    keywords: t('seo.home.keywords'),
  },
  ssrContext
)
</script>

<template>
  <div class="container app-container">
    <h1>
      {{ t('page.home.adventureIsland', 2) }} -
      {{ t('common.heroWarsDominionEra') }}
    </h1>
    <p v-html="t('page.home.firstParagraph')"></p>

    <div class="row">
      <div class="col-lg-9 mb-3">
        <island-list />
      </div>
      <div class="col-lg-3 mb-3 text-end">
        <router-link :to="createI18nRouteTo({ name: 'islands' })">{{
          t('common.islandsHistory')
        }}</router-link>
      </div>
    </div>

    <div class="row">
      <div class="col-lg-6 mb-3">
        <h2 class="mb-0">{{ t('common.news') }}</h2>
      </div>
      <div class="col-lg-6 mb-3 text-end">
        <router-link :to="createI18nRouteTo({ name: 'news' })">{{
          t('page.home.readAllNews')
        }}</router-link>
      </div>
    </div>

    <news-list />
  </div>
</template>
