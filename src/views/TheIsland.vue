<script setup lang="ts">
import HeroClient from "@/api/HeroClient";
import IslandMap from "./island/IslandMap.vue";
import RowLoading from "@/components/RowLoading.vue";
import { HttpError } from "@/exceptions/HttpError";
import { setMetaInfo } from "@/services/page-meta";
import { ref, watch, onMounted, onServerPrefetch, computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useSSRContext } from "vue";
import type { Island } from "@/api/IslandApi";

const { t } = useI18n();
const route = useRoute();
const ssrContext = import.meta.env.SSR ? useSSRContext() : undefined;

const currentIsland = ref<Island | null>(null);
const islandLoading = ref(true);
const errorMessage = ref("");

const islandName = computed(() => currentIsland.value?.name);
const islandDescription = computed(() => currentIsland.value?.description);

const islandId = parseInt(route.params.id as string);

onServerPrefetch(async () => {
  return loadIsland(islandId);
});

onMounted(() => {
  watch(
    () => route.params.id,
    (newId) => {
      const id = queryId(newId as string);
      if (id > 0) {
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

function setPageInfo(island: Island | null) {
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

function queryId(sourceId: string): number {
  let intId = parseInt(sourceId);

  if (Number.isNaN(intId)) {
    errorMessage.value = t("page.island.islandNotFound");
    intId = 0;
  }

  return intId;
}

async function loadIsland(id: number) {
  const client = new HeroClient();

  currentIsland.value = null;
  islandLoading.value = true;
  try {
    const fields = {
      isWithDescription: true,
      isWithBackgroundImage: true,
    };
    currentIsland.value = await client.island.get(id, fields);
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

<template>
  <div class="container">
    <div class="row">
      <div class="col-lg-6 mb-3">
        <h1 class="mb-0">{{ islandName }}</h1>
      </div>
      <div class="col-lg-6 mb-3 d-flex align-items-center">
        <span
          v-if="currentIsland"
          class="fst-italic"
        >
          <span
            v-if="currentIsland.syncGameVersion"
            :title="t('page.island.gameVersionWhenSyncCells')"
            class="game-version"
            >{{ currentIsland.syncGameVersion }}</span
          >
          <span
            v-if="currentIsland.syncAt"
            :title="t('page.island.whenWasCellSynchronization')"
            class="sync-at ms-2"
            >{{ currentIsland.syncAt }}</span
          >
        </span>
      </div>
    </div>

    <div v-if="islandLoading">
      <h1>
        <span class="placeholder placeholder-lg col-4"></span>
      </h1>
      <row-loading class="my-5" />
    </div>
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

<style scoped>
.description {
  border-top: 1px solid #ccc;
  padding-top: 10px;
}
.game-version {
  display: inline-block;
  max-width: 5em;
  overflow: hidden;
  vertical-align: middle;
}
.sync-at {
  vertical-align: middle;
}
</style>
