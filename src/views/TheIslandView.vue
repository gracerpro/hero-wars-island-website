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
      <div class="text-center text-warning fw-bold">Карта не доступна</div>
    </div>
    <div v-else>
      <h1>{{ island.name }}</h1>
      <island-map :island="island" :parent-page-id="pageId" />
    </div>
  </div>
</template>
<script>
import HeroClient from "@/api/HeroClient";
import IslandMap from "./island/IslandMap.vue";
import IslandMapLoading from "./island/IslandMapLoading.vue";
import HttpError from "@/exceptions/HttpError";
import { setMetaInfo } from "@/services/page-meta";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

const PAGE_ID = "islandPage";

export default {
  components: { IslandMap, IslandMapLoading },
  setup() {
    const client = new HeroClient();
    const route = useRoute();

    const islandLoading = ref(false);
    const island = ref(null);
    const errorMessage = ref("");

    setMetaInfo({
      title: "Карта острова",
      description: "",
      keywords: "Хроники хаоса, Эра доминиона, карта острова, карта",
    });

    /**
     * @param {String} sourseId
     * @returns {Number|null}
     */
    const queryId = (sourseId) => {
      let intId = parseInt(sourseId);

      if (intId != sourseId) {
        errorMessage.value = "Некорректный ID острова.";
        intId = null;
      }

      return intId;
    };

    /**
     * @param {Number} id
     */
    const loadIsland = (id) => {
      island.value = null;
      islandLoading.value = true;
      client
        .getIsland(id)
        .then((responseIsland) => {
          island.value = responseIsland;
          if (responseIsland) {
            setMetaInfo({
              title: responseIsland.name + " - Карта острова",
            });
          }
        })
        .catch((error) => {
          if (error instanceof HttpError && error.statusCode === 404) {
            errorMessage.value = "Карта не найдена.";
          } else {
            errorMessage.value =
              "Не удалось загрузить карту. Разработчики видят проблему и в скором времени починят.";
          }
        })
        .finally(() => (islandLoading.value = false));
    };

    const id = queryId(route.params.id);
    if (id) {
      loadIsland(id);
    }

    watch(
      () => route.params.id,
      (newId) => {
        const id = queryId(newId);
        if (id) {
          loadIsland(id);
        }
      },
    );

    return {
      pageId: PAGE_ID,
      errorMessage,
      island,
      islandLoading,
    };
  },
};
</script>
