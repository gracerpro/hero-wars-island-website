<template>
  <div class="container app-container">
    <h1>{{ t("common.news") }}</h1>

    <form
      class="row"
      @submit.prevent="resetNews"
    >
      <div class="col-lg-3 mb-3">
        <div class="input-group">
          <input
            id="filter__name"
            v-model.trim="filter.name"
            class="form-control"
            :placeholder="t('common.name')"
          />
          <button
            type="button"
            :disabled="filter.name.length === 0"
            class="btn btn-outline-secondary"
            @click="onClearName"
          >
            X
          </button>
        </div>
        <div class="form-text">
          {{ t("common.needEnterAtLeastCharacters", { n: filterNameMinCharsCount }) }}
        </div>
      </div>
      <div class="col-auto mb-3">
        <button
          type="submit"
          :disabled="loading"
          class="btn btn-primary"
        >
          {{ t("common.find") }}
        </button>
      </div>
    </form>

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

    <row-loading v-if="loading" />
    <div
      v-else-if="!totalCount"
      class="alert alert-info"
    >
      {{ t("common.noData") }}
    </div>
    <div
      v-else-if="visibleCount < totalCount"
      class="text-center"
    >
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
import { ref, watch } from "vue";
import RowLoading from "@/components/RowLoading.vue";
import HeroClient from "@/api/HeroClient";
import { createI18nRouteTo } from "@/i18n/translation";
import { useSSRContext } from "vue";
import { setMetaInfo } from "@/services/page-meta";
import { fromCurrentDate } from "@/helpers/formatter";
import { useRoute } from "vue-router";

const { t, locale } = useI18n();
const ssrContext = import.meta.env.SSR ? useSSRContext() : null;
const route = useRoute();

const PAGE_SIZE = 6;
const filterNameMinCharsCount = 3;

const client = new HeroClient();

const news = ref([]);
const visibleCount = ref(0);
const totalCount = ref(0);
const loading = ref(true);
const pageNumber = ref(1);
const filter = ref({
  name: "",
});

watch(
  () => route.params.locale,
  () => {
    resetNews();
  }
);

setMetaInfo(
  {
    title: t("common.news") + " - " + t("common.projectName"),
    description: t("seo.news.description"),
    keywords: t("seo.news.keywords"),
  },
  ssrContext
);

loadNews();

function onClearName() {
  filter.value.name = "";

  resetNews();
}

function resetNews() {
  pageNumber.value = 1;
  news.value = [];
  visibleCount.value = 0;

  loadNews();
}

function showMore() {
  pageNumber.value++;
  loadNews();
}

function loadNews() {
  loading.value = true;

  let requestFilter = {};

  if (filter.value.name.length >= filterNameMinCharsCount) {
    requestFilter.name = filter.value.name;
  }

  client.news
    .getList(PAGE_SIZE, pageNumber.value, requestFilter)
    .then((list) => {
      list.items.forEach((oneNews) => {
        news.value.push(oneNews);
      });
      totalCount.value = list.totalCount;

      visibleCount.value += list.items.length;
    })
    .finally(() => (loading.value = false));
}
</script>
