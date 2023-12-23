<template>
  <div class="container">
    <h1>Соберем все призы вместе!</h1>

    <loading-map v-if="loading" />
    <div v-else-if="!island">Карта не доступна.</div>
    <island-map v-else :island="island" :parent-page-id="pageId" />
  </div>
</template>
<script>
import HeroClient from "@/api/HeroClient";
import IslandMap from "./home/IslandMap.vue";
import LoadingMap from "./home/LoadingMap.vue";

const PAGE_ID = "homePage";

export default {
  client: new HeroClient(),

  name: "HomePage",
  components: { IslandMap, LoadingMap },
  data() {
    return {
      loaded: false,
      loadingIsland: false,
      island: null,
      nodes: [],
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
    this.loadState();
  },
  mounted() {
    this.loadIsland()
      .then((island) => {
        this.island = island;
      })
      .catch((error) => {
        //...
        throw error;
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
