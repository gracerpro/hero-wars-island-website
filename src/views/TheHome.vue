<template>
  <div class="container">
    <h1>
      {{ t("page.home.adventureIsland", 2) }} -
      {{ t("common.heroWarsDominionEra") }}
    </h1>
    <p v-html="t('page.home.firstParagraph')"></p>

    <h3>{{ t("common.island", 2) }}</h3>
    <div v-if="islandsLoading">
      <span class="placeholder col-4"></span><br />
      <span class="placeholder col-4"></span><br />
      <span class="placeholder col-4"></span>
    </div>
    <div v-else-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>
    <div v-else-if="!islands.length" class="alert alert-warning">
      {{ t("page.home.notFound") }}
    </div>
    <ol v-else>
      <li v-for="island in islands" :key="island.id">
        <router-link
          :to="createI18nRouteTo({ name: 'island', params: { id: island.id } })"
          :class="[isActual(island) ? '' : 'text-secondary']"
          >{{ island.name + " " + getIslandHint(island) }}</router-link
        >
        <span v-if="isActual(island)" class="badge text-bg-primary ms-2">{{
          t("page.home.actual")
        }}</span>
      </li>
    </ol>
  </div>
</template>
<script setup>
import HeroClient from "@/api/HeroClient";
import { fromCurrentDate } from "@/helpers/formatter";
import { setMetaInfo } from "@/services/page-meta";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { createI18nRouteTo } from "@/i18n/translation";
import { useRoute } from "vue-router";

const { t, locale } = useI18n();
const route = useRoute();

const client = new HeroClient();
const now = new Date();

const islands = ref([]);
const islandsLoading = ref(true);
const errorMessage = ref("");

setMetaInfo({
  title: t("common.projectName"),
  description: t("seo.home.description"),
  keywords: t("seo.home.keywords"),
});

if (!import.meta.env.SSR) {
  watch(
    () => route.params.locale,
    () => loadIslands(),
  );

  loadIslands();
}

function loadIslands() {
  islandsLoading.value = true;
  client
    .getIslandList(5)
    .then((list) => {
      islands.value = list.items;
    })
    .catch(() => {
      errorMessage.value = t("common.loadingFailDeveloperShow");
    })
    .finally(() => (islandsLoading.value = false));
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
    const days = Math.ceil((island.eventEndAt - now) / 1000 / 60 / 60 / 24);
    result = t("page.home.toDateDaysCount", {
      toDate: fromCurrentDate(island.eventEndAt, locale.value),
      daysCount: days,
    });
  }

  return result;
}
</script>
