<template>
  <div class="container">
    <h1>
      {{ t("page.home.adventureIsland", 2) }} -
      {{ t("common.heroWarsDominionEra") }}
    </h1>
    <p v-html="t('page.home.firstParagraph')"></p>

    <div v-if="islandsLoading">
      <ol>
        <li>
          <div><span class="placeholder col-5"></span></div>
          <span class="placeholder col-1 ms-2"></span>
          <span class="placeholder col-1 ms-2"></span>
        </li>
        <li>
          <div><span class="placeholder col-5"></span></div>
          <span class="placeholder col-1 ms-2"></span>
          <span class="placeholder col-1 ms-2"></span>
        </li>
        <li>
          <div><span class="placeholder col-5"></span></div>
          <span class="placeholder col-1 ms-2"></span>
          <span class="placeholder col-1 ms-2"></span>
        </li>
      </ol>
    </div>
    <div
      v-else-if="errorMessage"
      class="alert alert-danger"
    >
      {{ errorMessage }}
    </div>
    <div
      v-else-if="!islands.length"
      class="alert alert-warning"
    >
      {{ t("page.home.notFound") }}
    </div>
    <ol v-else>
      <li
        v-for="island in islands"
        :key="island.id"
      >
        <router-link
          :to="createI18nRouteTo({ name: 'island', params: { id: island.id } })"
          :class="[isActual(island) ? '' : 'text-secondary']"
          >{{ island.name + " " + getIslandHint(island) }}</router-link
        >
        <span
          v-if="isActual(island)"
          class="badge text-bg-primary ms-2"
          >{{ t("page.home.actual") }}</span
        >
        <br />
        <span
          v-for="i in island.regionsCount"
          :key="i"
          class="badge text-bg-secondary me-2"
          :title="t('page.home.thePartNumber', { n: i })"
          >{{ i }}</span
        >
      </li>
    </ol>

    <router-link
      class="float-end mt-4"
      :to="createI18nRouteTo({ name: 'news' })"
      >{{ t("page.home.readAllNews") }}</router-link
    >
    <h2 class="mt-4">{{ t("common.news") }}</h2>

    <div v-if="newsLoading">
      <div
        v-for="i in visibleNewsMax"
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
      {{ t("common.noData") }}
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
          v-html="oneNews.snippet"
          class="news-item"
        ></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import HeroClient from "@/api/HeroClient";
import { fromCurrentDate } from "@/helpers/formatter";
import { setMetaInfo } from "@/services/page-meta";
import { ref, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { createI18nRouteTo } from "@/i18n/translation";
import { useRoute } from "vue-router";
import { useSSRContext } from "vue";

const visibleNewsMax = 5;

const { t, locale } = useI18n();
const route = useRoute();
const ssrContext = import.meta.env.SSR ? useSSRContext() : null;

const client = new HeroClient();
const now = new Date();

const news = ref([]);
const newsLoading = ref(true);
const newsTotalCount = ref(0);

const islands = ref([]);
const islandsLoading = ref(true);
const errorMessage = ref("");

setMetaInfo(
  {
    title: t("common.projectName"),
    description: t("seo.home.description"),
    keywords: t("seo.home.keywords"),
  },
  ssrContext
);

onMounted(() => {
  watch(
    () => route.params.locale,
    () => load()
  );

  load();
});

function load() {
  loadIslands();
  loadNews();
}

function loadIslands() {
  islandsLoading.value = true;
  client.island
    .getList(5)
    .then((list) => {
      islands.value = list.items;
    })
    .catch((error) => {
      console.error(error);
      errorMessage.value = t("common.loadingFailDeveloperShow");
    })
    .finally(() => (islandsLoading.value = false));
}

function loadNews() {
  newsLoading.value = true;
  client.news
    .getList(visibleNewsMax)
    .then((list) => {
      news.value = list.items;
      newsTotalCount.value = list.totalCount;
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => (newsLoading.value = false));
}

function isActual(island) {
  return island.eventEndAt > now;
}

function getIslandHint(island) {
  let result = "";

  if (island.eventEndAt < now) {
    result = t("page.home.fromToDates", {
      dateFrom: fromCurrentDate(island.eventStartAt, locale.value),
      dateTo: fromCurrentDate(island.eventEndAt, locale.value),
    });
  } else {
    const toEndHours = (island.eventEndAt - now) / 1000 / 60 / 60;

    if (toEndHours >= 24) {
      result = t("page.home.toDateDaysCount", {
        toDate: fromCurrentDate(island.eventEndAt, locale.value),
        daysCount: Math.ceil(toEndHours / 24),
      });
    } else if (toEndHours < 1) {
      const toEndMinutes = ((island.eventEndAt - now) / 1000 / 60) % 60;
      result = t("page.home.toDateMinutesCount", {
        toDate: fromCurrentDate(island.eventEndAt, locale.value),
        minutesCount: Math.ceil(toEndMinutes),
      });
    } else {
      result = t("page.home.toDateHoursCount", {
        toDate: fromCurrentDate(island.eventEndAt, locale.value),
        hoursCount: Math.ceil(toEndHours),
      });
    }
  }

  return result;
}
</script>
<style>
.news-item p {
  margin-bottom: 0;
}
</style>
