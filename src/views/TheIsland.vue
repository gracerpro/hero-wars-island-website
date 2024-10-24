<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center">
      <h1>{{ islandName }}</h1>
      <span
        v-if="currentIsland"
        class="fst-italic"
      >
        <span
          v-if="currentIsland.syncGameVersion"
          :title="t('page.island.gameVersionWhenSyncCells')"
          >{{ currentIsland.syncGameVersion }}</span
        >
        <span
          v-if="currentIsland.syncAt"
          :title="t('page.island.whenWasCellSynchronization')"
          class="ms-2"
          >{{ currentIsland.syncAt }}</span
        >
      </span>
    </div>

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
    <island-map
      v-else
      :island="currentIsland"
      parent-page-id="islandPage"
    />

    <div
      v-if="islandDescription"
      class="description mt-4"
      v-html="islandDescription"
    ></div>
  </div>
</template>
<script setup>
import HeroClient from "@/api/HeroClient";
import IslandMap from "./island/IslandMap.vue";
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
  return loadIsland(islandId);
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

  loadIsland(islandId);
});

function setPageInfo(island) {
  const defaultTitle = t("common.islandMap");

  if (island) {
    setMetaInfo(
      {
        title: island.pageTitle ? island.pageTitle : defaultTitle,
        description: island.pageDescription,
        keywords: island.pageKeywords,
      },
      ssrContext
    );
  } else {
    setMetaInfo(
      {
        title: defaultTitle,
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

  setPageInfo(currentIsland.value);

  return currentIsland.value;
}
</script>
<style scoped>
.description {
  border-top: 1px solid #ccc;
  padding-top: 10px;
}
</style>
