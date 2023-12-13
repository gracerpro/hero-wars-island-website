<template>
  <div class="container">
    <h1>Соберем все призы вместе!</h1>

    <p v-if="loading">Loading...</p>
    <div class="map">
      <svg
        height="600"
        width="100%"
        :viewBox="viewBox"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="0"
          y1="-9999"
          x2="0"
          y2="9999"
          style="stroke: black; stroke-width: 1"
        />
        <line
          x1="-9999"
          y1="0"
          x2="9999"
          y2="0"
          style="stroke: black; stroke-width: 1"
        />

        <polygon
          v-for="node in nodes"
          :key="node.xyId"
          :points="node.points"
          class="node"
          v-on:mouseenter="nodeMouseEnter(node)"
        />
      </svg>
    </div>

    <p>Кликни на ячейку и впиши что в ней находится</p>
    <ol>
      <li>Название</li>
      <li>Кличество</li>
    </ol>
  </div>
</template>
<script>
import HeroClient from "@/api/HeroClient";

const SIDE = 100;
const HALF_SIDE = 50;
const HEIGHT = 40;

const PAGE_ID = "homePage";

export default {
  client: new HeroClient(),

  name: "HomePage",
  components: {},
  data() {
    return {
      coordinates: [],
      paths: [],
      loaded: false,
      loadingIsland: false,
      loadingNodes: false,
      updating: false,
      island: null,
      nodes: [],
      activeNode: null,
      nodeDialogComponent: null,
    };
  },
  computed: {
    loading() {
      return this.loaded === false || this.loadingIsland || this.loadingNodes;
    },
    viewBox() {
      const side = SIDE * 5;
      return `-${side} -${side} ${side * 2} ${side * 2}`;
    },
  },
  created() {
    this.loadState();
  },
  mounted() {
    this.loadIsland()
      .then(() => {
        this.loadNodes().then(() => (this.loaded = true));
      })
      .catch((error) => {
        throw error;
      });
  },
  unmounted() {
    this.saveState();
  },
  methods: {
    onEditNodeClick() {
      if (!this.updating) {
        this.updating = true;
        //this.nodeDialogComponent = shallowRef(NodeDialog);
      }
    },
    onMountedNodeDialog() {
      this.$refs.nodeDialog
        .show()
        .then((result) => {
          if (result !== null && result !== undefined) {
            // todo: reload node
          }
        })
        .finally(() => {
          this.nodeDialogComponent = null;
          this.updating = false;
        });
    },
    async loadIsland() {
      this.loadingIsland = true;

      try {
        this.island = await this.$options.client.getIsland();
      } finally {
        this.loadingIsland = false;
      }
    },
    async loadNodes() {
      this.nodes = [];
      this.activeNode = null;

      this.loadingNodes = true;
      try {
        const list = await this.$options.client.getNodes(this.island.id);
        this.nodes = list.items.map((node) => this.drawNode(node));
      } finally {
        this.loadingNodes = false;
      }
    },
    nodeMouseEnter(node) {
      this.activeNode = node;
    },
    /**
     * @param {Object} node
     */
    drawNode(node) {
      const side = SIDE;
      const h = HEIGHT;
      const x = node.mx * (1.5 * side);
      const y = node.my * 2 * h + (node.mx % 2 === 0 ? 0 : h);

      let coordinates = new Array(6);
      coordinates[0] = { x: x + side, y };
      coordinates[1] = { x: x + HALF_SIDE, y: y + h };
      coordinates[2] = { x: x - HALF_SIDE, y: y + h };
      coordinates[3] = { x: x - side, y };
      coordinates[4] = { x: x - HALF_SIDE, y: y - h };
      coordinates[5] = { x: x + HALF_SIDE, y: y - h };

      return {
        ...node,
        xyId: node.mx + "_" + node.my,
        x,
        y,
        points: this.getPoints(coordinates),
      };
    },
    /**
     * @param {Array} coordinates
     */
    getPoints(coordinates) {
      return coordinates.map((item) => item.x + "," + item.y).join(" ");
    },
    getPaths(coordinates) {
      return coordinates.map((item) => item.x + "," + item.y).join(" ");
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
<style>
.container {
  width: 1200px;
  margin: 0 auto;
}
.node {
  fill: lime;
  stroke: purple;
  stroke-width: 0.1;
}
</style>
<style scoped>
.map {
  width: 100%;
  height: 600px;
  padding: 10px;
  outline: 1px solid #dddddd;
}
</style>
