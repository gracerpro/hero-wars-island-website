<template>
  <div class="container">
    <island-map-loading v-if="islandLoading" />
    <div v-else-if="errorMessage" class="alert alert-danger mt-3">
      {{ errorMessage }}
    </div>
    <div v-else-if="!currentIsland" class="position-relative">
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
      <h1>{{ currentIsland.name }}</h1>
      <island-map :island="currentIsland" parent-page-id="islandPage" />
    </div>
  </div>
</template>
<script setup>
import HeroClient from "@/api/HeroClient";
import IslandMap from "./island/IslandMap.vue";
import IslandMapLoading from "./island/IslandMapLoading.vue";
import HttpError from "@/exceptions/HttpError";
import { setMetaInfo } from "@/services/page-meta";
import { ref, watch, onMounted, onServerPrefetch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useSSRContext } from "vue";

const { t } = useI18n();
const ssrContext = import.meta.env.SSR ? useSSRContext() : null;

const route = useRoute();
const currentIsland = ref(null);
const islandLoading = ref(true);
const errorMessage = ref("");

const islandId = parseInt(route.params.id);

// TODO: h1 => island.name
// __INITIAL_STATE__

onServerPrefetch(async () => {
  const island = await loadIsland(islandId);

  if (island) {
    setMetaInfo({
        title: island.name + " - " + t("common.projectName"),
        description: t("seo.island.description") + " " + island.name,
        keywords: t("seo.island.keywords") + ", " + island.name,
      },
      ssrContext
    );
  } else {
    setMetaInfo({
        title: t("common.islandMap"),
        description: t("seo.island.description"),
        keywords: t("seo.island.keywords"),
      },
      ssrContext
    );
  }
});

onMounted(() => {
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
      loadIsland(currentIsland.value.id);
      // TODO: loading_start >change< loading_end
    },
  );

  loadIsland(islandId);
})

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
async function loadIsland(id) {
  const client = new HeroClient();

  currentIsland.value = null;
  islandLoading.value = true;
  try {
    currentIsland.value = await client.getIsland(id);
  } catch (error) {
    console.log(error);
    if (error instanceof HttpError && error.statusCode === 404) {
      errorMessage.value = t("page.island.islandNotFound");
    } else {
      errorMessage.value = t("common.loadingFailDeveloperShow");
    }
  } finally {
    if (!import.meta.env.SSR) {
      islandLoading.value = false;
    }
  }

  return currentIsland.value;
}
</script>
