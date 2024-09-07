<template>
  <div class="container">
    <div v-if="loading">
      <div class="placeholder-glow">
        <span class="placeholder col-3"></span>
      </div>
      <div class="placeholder-glow">
        <span class="placeholder col-1"></span>
      </div>
      <row-loading  />
    </div>
    <div v-else-if="errorMessage" class="alert alert-danger mt-3">
      {{ errorMessage }}
    </div>
    <div v-else>
      <h1>{{ oneNews.name }}</h1>
      <div class="fst-italic">{{ fromCurrentDate(oneNews.createdAt) }}</div>

      <div v-html="oneNews.content" class="mt-4"></div>
    </div>
  </div>
</template>
<script setup>
import HeroClient from "@/api/HeroClient";
import RowLoading from "@/components/RowLoading.vue";
import { onServerPrefetch, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { fromCurrentDate } from "@/helpers/formatter";
import HttpError from "@/exceptions/HttpError";
import { useI18n } from "vue-i18n";
import { setMetaInfo } from "@/services/page-meta";
import { useSSRContext } from "vue";

const { t } = useI18n();
const route = useRoute();
const ssrContext = import.meta.env.SSR ? useSSRContext() : null;

const slug = route.params.slug;

const client = new HeroClient();

const errorMessage = ref("");
const loading = ref(true);
const oneNews = ref({
  id: null,
  createdAt: null,
  updatedAt: null,
  slug: "",
  name: "",
  content: "",
})

watch(
  () => route.params.locale,
  () => {
    loadOneNews()
  }
);

onServerPrefetch(async () => {
  const oneNews = await loadOneNews(slug);
  setPageInfo(oneNews);
});

loadOneNews()

async function loadOneNews() {
  loading.value = true
  try {
    oneNews.value = await client.news.get(slug)
  } catch (error) {
    if (error instanceof HttpError && error.statusCode === 404) {
      errorMessage.value = t("common.pageNotFound");
    } else {
      throw error
    }
  }
  finally {
    if (!import.meta.env.SSR) {
      loading.value = false;
    }
  }

  return oneNews.value
}

/**
 * @param {Object|null} oneNews
 */
function setPageInfo(oneNews) {
  if (oneNews) {
    setMetaInfo(
      {
        title: oneNews.pageTitle,
        description: oneNews.pageDescription,
        keywords: oneNews.pageKeywords,
      },
      ssrContext
    );
  } else {
    setMetaInfo(
      {
        title: t("common.news"),
        description: t("common.news"),
        keywords: t("common.news"),
      },
      ssrContext
    );
  }
}
</script>