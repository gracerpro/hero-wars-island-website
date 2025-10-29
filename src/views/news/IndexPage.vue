<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { watch } from 'vue'
import RowLoading from '@/components/RowLoading.vue'
import { createI18nRouteTo } from '@/i18n/translation'
import { useSSRContext } from 'vue'
import { setMetaInfo } from '@/services/page-meta'
import { fromCurrentDate } from '@/helpers/formatter'
import { useRoute } from 'vue-router'
import FilterForm from './FilterForm.vue'
import { useNews } from '@/use/use-news'

const { t, locale } = useI18n()
const ssrContext = import.meta.env.SSR ? useSSRContext() : undefined
const route = useRoute()

const {
  news,
  isLoading,
  pagination,
  filter,
  totalCount,
  visibleCount,
  load: loadNews,
  reset: resetNews,
  loadAppend,
} = useNews()

isLoading.value = true
pagination.pageSize = 6

watch(
  () => route.params.locale,
  () => {
    resetNews()
  }
)

setMetaInfo(
  {
    title: t('common.news') + ' - ' + t('common.projectName'),
    description: t('seo.news.description'),
    keywords: t('seo.news.keywords'),
  },
  ssrContext
)

if (!import.meta.env.SSR) {
  loadNews()
}

defineExpose({
  news,
})
</script>

<template>
  <div class="container app-container">
    <h1>{{ t('common.news') }}</h1>

    <filter-form
      v-model:name="filter.name"
      :loading="isLoading"
      @find="resetNews()"
    />

    <div
      v-for="oneNews in news"
      :key="oneNews.id"
    >
      <h4>
        <router-link
          :to="createI18nRouteTo({ name: 'newsView', params: { slug: oneNews.slug } })"
          >{{ oneNews.name }}</router-link
        >
      </h4>
      <div class="fst-italic">{{ fromCurrentDate(oneNews.createdAt, locale) }}</div>
      <div v-html="oneNews.snippet"></div>
    </div>

    <row-loading v-if="isLoading" />
    <div
      v-else-if="!totalCount"
      class="alert alert-info"
    >
      {{ t('common.noData') }}
    </div>
    <div
      v-else-if="visibleCount < totalCount"
      class="text-center"
    >
      <button
        type="button"
        class="btn btn-link"
        :disabled="isLoading"
        @click="loadAppend()"
      >
        {{ t('common.showMore') }}
      </button>
    </div>
  </div>
</template>
