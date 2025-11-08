<script setup lang="ts">
import { createI18nRouteTo } from '@/i18n/translation'
import { useNews } from '@/use/use-news'
import { onMounted, watch } from 'vue'
import { fromCurrentDate } from '@/helpers/formatter'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t, locale } = useI18n()
const route = useRoute()

const { news, pagination: newsPagination, isLoading: isLoadingNews, load } = useNews()
isLoadingNews.value = true
newsPagination.pageSize = 5

watch(
  () => route.params.locale,
  () => load()
)

onMounted(() => load())

defineExpose({
  news,
})
</script>

<template>
  <div>
    <div v-if="isLoadingNews">
      <div
        v-for="i in newsPagination.pageSize"
        :key="i"
        class="mb-3"
      >
        <div class="placeholder-glow">
          <div class="placeholder col-6"></div>
        </div>
        <div class="placeholder-glow">
          <div class="placeholder placeholder-sm col-3"></div>
        </div>
      </div>
    </div>
    <p v-else-if="!news.length">
      {{ t('common.noData') }}
    </p>
    <div>
      <div
        v-for="oneNews in news"
        :key="oneNews.id"
        class="mb-2"
      >
        <h4>
          <router-link
            :to="createI18nRouteTo({ name: 'newsView', params: { slug: oneNews.slug } })"
            >{{ oneNews.name }}</router-link
          >
        </h4>
        <div class="fst-italic">{{ fromCurrentDate(oneNews.createdAt, locale) }}</div>
        <div
          class="news-item"
          v-html="oneNews.snippet"
        ></div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.news-item p {
  margin-bottom: 0;
}
</style>
