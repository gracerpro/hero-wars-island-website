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

const PAGE_ID = "islandPage";

export default {
  client: new HeroClient(),

  name: "TheIslandView",
  components: { IslandMap, LoadingMap },
  inject: ["setMetaInfo"],
  data() {
    return {
      loaded: false,
      loadingIsland: false,
      island: null,
      nodes: [],
      errorMessage: "",
    };
  },
  computed: {
    loading() {
      return this.loaded === false || this.loadingIsland;
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
    this.loadState();

    // get ID from query
  },
  mounted() {
    this.loadIsland()
      .then((island) => {
        this.island = island;
      })
      .catch(() => {
        this.errorMessage =
          "Не удалось загрузить карту. Разработчики видят проблему и в скором времени починят.";
      })
      .finally(() => {
        this.loaded = true;
      });
  },
  unmounted() {
    this.saveState();
  },
  methods: {
    async loadIsland() {
      let island = null;

      this.loadingIsland = true;
      try {
        island = await this.$options.client.getActualIsland();
      } finally {
        this.loadingIsland = false;
      }

      return island;
    },
    loadState() {
      let state;

      try {
        state = JSON.parse(localStorage.getItem(PAGE_ID));
      } catch (error) {
        console.error(error);
      }

      if (!state) {
        state = {};
      }
    },
    saveState() {
      const state = {};
      localStorage.setItem(PAGE_ID, JSON.stringify(state));
    },
  },
};
</script>
