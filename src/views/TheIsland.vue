<template>
  <div class="container">
    <h1>{{ islandName }}</h1>

    <island-map-loading v-if="islandLoading" />
    <div
      v-else-if="errorMessage"
      class="alert alert-danger mt-3"
    >
      {{ errorMessage }}
    </div>
    <div
      v-else-if="!currentIsland"
      class="position-relative"
    >
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
      <game-island-map v-if="currentIsland.isGrabFromGame" />
      <island-map v-else
        :island="currentIsland"
        parent-page-id="islandPage"
      />
    </div>

    <div v-if="islandDescription">
      <hr />
      <div v-html="islandDescription"></div>
    </div>
  </div>
</template>
<script setup>
import HeroClient from "@/api/HeroClient";
import IslandMap from "./island/IslandMap.vue";
import GameIslandMap from "./island/game-map/GameIslandMap.vue";
import IslandMapLoading from "./island/IslandMapLoading.vue";
import HttpError from "@/exceptions/HttpError";
import { setMetaInfo } from "@/services/page-meta";
import { ref, watch, onMounted, onServerPrefetch, computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useSSRContext } from "vue";

const { t } = useI18n();
const route = useRoute();
const ssrContext = import.meta.env.SSR ? useSSRContext() : null;

const currentIsland = ref(null);
const islandLoading = ref(true);
const errorMessage = ref("");

const islandName = computed(() => currentIsland.value?.name);
const islandDescription = computed(() => currentIsland.value?.description);

const islandId = parseInt(route.params.id);

onServerPrefetch(async () => {
  const island = await loadIsland(islandId);
  setPageInfo(island);
});

onMounted(() => {
  watch(
    () => route.params.id,
    (newId) => {
      const id = queryId(newId);
      if (id) {
        loadIsland(id);
      }
    }
  );
  watch(
    () => route.params.locale,
    () => {
      if (currentIsland.value) {
        loadIsland(currentIsland.value.id);
      }
    }
  );

  loadIsland(islandId).then((island) => setPageInfo(island));
});

function setPageInfo(island) {
  if (island) {
    setMetaInfo(
      {
        title: island.name + " - " + t("common.projectName"),
        description: t("seo.island.description") + " " + island.name,
        keywords: t("seo.island.keywords") + ", " + island.name,
      },
      ssrContext
    );
  } else {
    setMetaInfo(
      {
        title: t("common.islandMap"),
        description: t("seo.island.description"),
        keywords: t("seo.island.keywords"),
      },
      ssrContext
    );
  }
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
async function loadIsland(id) {
  const client = new HeroClient();

  currentIsland.value = null;
  islandLoading.value = true;
  try {
    const isWithDescription = true;
    currentIsland.value = await client.island.get(id, isWithDescription);
  } catch (error) {
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
