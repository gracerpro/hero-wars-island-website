<template>
  <div class="container">
    <h1>{{ t("common.news") }}</h1>

    <div v-for="oneNews in news" :key="oneNews.id">
      <h4>
        <router-link
        :to="createI18nRouteTo({ name: 'newsView', params: { slug: oneNews.slug } })"
        >{{ oneNews.name }}</router-link>
      </h4>
      <div v-html="oneNews.snippet"></div>
    </div>

    <row-loading v-if="loading" />
    <div v-else-if="visibleCount < totalCount" class="text-center">
      <button
        type="button"
        class="btn btn-link"
        :disabled="loading"
        @click="showMore()"
      >
        {{ t("common.showMore") }}
      </button>
    </div>
  </div>
</template>
<script setup>
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import RowLoading from "@/components/RowLoading.vue";
import HeroClient from "@/api/HeroClient";
import { createI18nRouteTo } from "@/i18n/translation";

const { t } = useI18n();

const PAGE_SIZE = 2

const client = new HeroClient();

const news = ref([])
const visibleCount = ref(0)
const totalCount = ref(0)
const loading = ref(true)
const pageNumber = ref(1)

loadNews()

function showMore() {
  pageNumber.value++
  loadNews()
}

function loadNews() {
  loading.value = true;
  client.news
    .getList(PAGE_SIZE, pageNumber.value)
    .then((list) => {
      list.items.forEach((oneNews) => {
        news.value.push(oneNews);
      });
      totalCount.value = list.totalCount

      visibleCount.value += list.items.length
    })
    .finally(() => (loading.value = false));
}
</script>