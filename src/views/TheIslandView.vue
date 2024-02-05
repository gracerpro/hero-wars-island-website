<template>
  <div class="container">
    <island-map-loading v-if="islandLoading" />
    <div v-else-if="errorMessage" class="alert alert-danger mt-3">
      {{ errorMessage }}
    </div>
    <div v-else-if="!island" class="position-relative">
      <img
        src="/images/map-not-found.svg"
        width="440"
        height="220"
        class="d-block mx-auto"
      />
      <div class="text-center text-warning fw-bold">
        {{ t("page.island.islandNotAvailable") }}
      </div>
    </div>
    <div v-else>
      <h1>{{ island.name }}</h1>
      <island-map :island="island" :parent-page-id="pageId" />
    </div>
  </div>
</template>
<script setup>
import HeroClient from "@/api/HeroClient";
import IslandMap from "./island/IslandMap.vue";
import IslandMapLoading from "./island/IslandMapLoading.vue";
import HttpError from "@/exceptions/HttpError";
import { setMetaInfo } from "@/services/page-meta";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const pageId = "islandPage";
const client = new HeroClient();
const route = useRoute();

const island = ref(null);
const islandLoading = ref(false);
const errorMessage = ref("");

watch(
  () => route.params.id,
  (newId) => {
    const id = queryId(newId);
    if (id) {
      loadIsland(id);
    }
  },
);
watch(
  () => route.params.locale,
  () => {
    loadIsland(island.value.id);
    // todo: loading_start >change< loading_end
  }
);

setMetaInfo({
  title: t("common.islandMap"),
  description: t("seo.island.description"),
  keywords: t("seo.island.keywords"),
});

const id = queryId(route.params.id);
if (id) {
  loadIsland(id);
}

/**
 * @param {String} sourceId
 * @returns {Number|null}
 */
function queryId(sourceId) {
  let intId = parseInt(sourceId);

  if (intId != sourceId) {
    errorMessage.value = t("page.island.islandNotFound");
    intId = null;
  }

  return intId;
}

/**
 * @param {Number} id
 */
function loadIsland(id) {
  island.value = null;
  islandLoading.value = true;
  client
    .getIsland(id)
    .then((responseIsland) => {
      island.value = responseIsland;
      if (responseIsland) {
        setMetaInfo({
          title: responseIsland.name + " - " + t("common.projectName"),
          description: t("seo.island.description") + " " + responseIsland.name,
          keywords: t("seo.island.keywords") + ", " + responseIsland.name,
        });
      }
    })
    .catch((error) => {
      if (error instanceof HttpError && error.statusCode === 404) {
        errorMessage.value = t("page.island.islandNotFound");
      } else {
        errorMessage.value = t("common.loadingFailDeveloperShow");
      }
    })
    .finally(() => (islandLoading.value = false));
}
</script>
