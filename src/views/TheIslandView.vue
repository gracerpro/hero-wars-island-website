<template>
  <div class="container">
    <loading-map v-if="loading" />
    <div v-else-if="errorMessage" class="alert alert-danger">
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
import IslandMap from "./home/IslandMap.vue";
import LoadingMap from "./home/LoadingMap.vue";
import HttpError from "@/exceptions/HttpError";

const PAGE_ID = "islandPage";

export default {
  client: new HeroClient(),
  id: null,

  name: "TheIslandView",
  components: { IslandMap, LoadingMap },
  inject: ["setMetaInfo"],
  data() {
    return {
      // loaded: false,
      loadingIsland: true,
      island: null,
      nodes: [],
      errorMessage: "",
    };
  },
  computed: {
    loading() {
      return /*this.loaded === false || */ this.loadingIsland;
    },
    pageId() {
      return PAGE_ID;
    },
  },
  created() {
    this.setMetaInfo({
      title: "Карта острова",
      description: "",
      keywords: "Хроники хаоса, Эра доминиона, карта острова, карта",
    });

    this.$options.id = this.$route.params.id;
  },
  mounted() {
    if (this.$options.id > 0) {
      this.loadIsland();
    }
  },
  methods: {
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
