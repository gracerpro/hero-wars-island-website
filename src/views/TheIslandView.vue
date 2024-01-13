<template>
  <div class="container">
    <island-map-loading v-if="loadingIsland" />
    <div v-else-if="errorMessage" class="alert alert-danger mt-3">
      {{ errorMessage }}
    </div>
    <div v-else-if="!island" class="position-relative">
      <img
        src="images/map-not-found.svg"
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

const PAGE_ID = "islandPage";

export default {
  client: new HeroClient(),
  id: null,

  name: "TheIslandView",
  components: { IslandMap, IslandMapLoading },
  inject: ["setMetaInfo"],
  data() {
    return {
      loadingIsland: false,
      island: null,
      errorMessage: "",
    };
  },
  computed: {
    pageId() {
      return PAGE_ID;
    },
  },
  watch: {
    "$route.params.id"(newId) {
      if (this.queryId(newId)) {
        this.loadIsland();
      }
    },
  },
  created() {
    this.setMetaInfo({
      title: "Карта острова",
      description: "",
      keywords: "Хроники хаоса, Эра доминиона, карта острова, карта",
    });

    if (this.queryId(this.$route.params.id)) {
      this.loadIsland();
    }
  },
  methods: {
    /**
     * @param {String} sourseId
     * @returns {Number|null}
     */
    queryId(sourseId) {
      let intId = parseInt(sourseId);

      if (intId != sourseId) {
        this.errorMessage = "Некорректный ID острова.";
        intId = null;
      } else {
        this.$options.id = intId;
      }

      return intId;
    },
    loadIsland() {
      this.island = null;
      this.loadingIsland = true;
      this.$options.client
        .getIsland(this.$options.id)
        .then((island) => {
          this.island = island;
          this.setMetaInfo({
            title: island.name + " - Карта острова",
          });
        })
        .catch((error) => {
          if (error instanceof HttpError && error.statusCode === 404) {
            this.errorMessage = "Карта не найдена.";
          } else {
            this.errorMessage =
              "Не удалось загрузить карту. Разработчики видят проблему и в скором времени починят.";
          }
        })
        .finally(() => (this.loadingIsland = false));
    },
  },
};
</script>
