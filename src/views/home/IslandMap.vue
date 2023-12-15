<template>
  <div class="map">
    <div v-if="loadingNodes">Loading...</div>
    <div v-else>
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
        <template v-for="item in nodeIcons" :key="item.xyId">
          <image
            :x="item.x"
            :y="item.y"
            :width="imageSide"
            :height="imageSide"
            :href="item.iconUrl"
          />
          <text :x="item.textX" :y="item.textY" class="node-text">
            {{ item.name }}
          </text>
        </template>
      </svg>

      <p>Кликни на ячейку и впиши что в ней находится</p>
      <ol>
        <li>Название</li>
        <li>Кличество</li>
      </ol>
    </div>
  </div>
</template>
<script>
import HeroClient from "@/api/HeroClient";

const SIDE = 100;
const HALF_SIDE = 50;
const HEIGHT = 40;
const IMAGE_SIDE = 40;
//const FONT_SIZE = 30;

export default {
  client: new HeroClient(),

  name: "IslandMap",
  props: {
    island: { type: Object, required: true },
  },
  data: function () {
    return {
      loadingNodes: true,
      activeNode: null,
      nodeDialogComponent: null,
      updating: false,
      nodes: [],
    };
  },
  computed: {
    viewBox() {
      const side = SIDE * 5;
      return `-${side} -${side} ${side * 2} ${side * 2}`;
    },
    imageSide() {
      return IMAGE_SIDE;
    },
    height() {
      return HEIGHT;
    },
    nodeIcons() {
      let icons = [];

      this.nodes.forEach((node) => {
        if (node.items && node.items.length) {
          node.items.every((item) => {
            if (item.iconUrl) {
              const x = node.x - 1.3 * HALF_SIDE;

              icons.push({
                xyId: node.xyId,
                x: x,
                y: node.y - 0.5 * HEIGHT,
                textX: x + 1.2 * IMAGE_SIDE,
                textY: node.y + IMAGE_SIDE * 0.25,
                iconUrl: item.iconUrl,
                name: this.getHumanQunatity(item.quantity),
              });

              return false;
            }

            return true;
          });
        }
      });

      return icons;
    },
  },
  mounted() {
    this.loadNodes().then((nodes) => {
      this.nodes = nodes;
    });
  },
  methods: {
    async loadNodes() {
      let nodes = [];

      this.loadingNodes = true;
      try {
        const list = await this.$options.client.getNodes(this.island.id);
        nodes = list.items.map((node) => this.drawNode(node));
      } finally {
        this.loadingNodes = false;
      }

      return nodes;
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
    nodeMouseEnter(node) {
      this.activeNode = node;
    },
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
    /**
     * @param {Array} coordinates
     */
    getPoints(coordinates) {
      return coordinates.map((item) => item.x + "," + item.y).join(" ");
    },
    getHumanQunatity(quantity) {
      if (quantity > 1000000) {
        return Math.floor(quantity / 1000000) + "M";
      }
      if (quantity > 1000) {
        return Math.floor(quantity / 1000) + "K";
      }

      return quantity;
    },
  },
};
</script>
<style>
.node {
  fill: #96d895;
  stroke: #dddddd;
  stroke-width: 1;
}
.node:hover {
  fill: #527951;
}
.node-text {
  font-size: 30px;
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
