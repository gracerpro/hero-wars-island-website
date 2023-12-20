<template>
  <div>
    <div v-if="loadingNodes">Loading...</div>
    <div v-else>
      <div class="actions">
        <div>
          <b>scale</b>
          <button type="button" @click="onChangeScale(true)">+ up</button>
          <button type="button" @click="onChangeScale(false)">- down</button>
          <button type="button" @click="onResetScale()">reset</button>
        </div>
        <div>
          <b>translate</b>
          <button type="button" @click="onChangeTranslate(-1, 0)">left</button>
          <button type="button" @click="onChangeTranslate(1, 0)">right</button>
          <button type="button" @click="onChangeTranslate(0, -1)">top</button>
          <button type="button" @click="onChangeTranslate(0, 1)">down</button>
          <button type="button" @click="onResetTranslate()">reset</button>
        </div>
      </div>
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

          <g :transform="'translate(' + translateX + ' ' + translateY + ')'">
            <polygon
              v-for="node in nodes"
              :key="node.xyId"
              :points="node.points"
              class="node"
              :class="node.class"
              v-on:mouseenter="nodeMouseEnter(node)"
            />
            <template v-for="item in visibleIconsItems" :key="item.uniqueId">
              <image
                :x="item.iconX"
                :y="item.iconY"
                :width="imageSide"
                :height="imageSide"
                :href="item.item.iconUrl"
              />
              <text :x="item.textX" :y="item.textY" class="node-text">
                {{ item.humanQuantity }}
              </text>
            </template>
            <polyline
              v-if="activeNode"
              :points="getActivePoints(activeNode)"
              class="active-frame"
            />
          </g>
        </svg>
      </div>
      <div style="max-width: 30em">
        <p>Кликни на ячейку и впиши что в ней находится</p>
        <ol>
          <li>Название</li>
          <li>Кличество, если больше 1</li>
        </ol>
      </div>

      <table class="">
        <thead>
          <tr>
            <th>
              Предмет<br />
              <input v-model.trim="filter.itemName" @input="onInput" /><br />
              <span style="font-size: 0.9em; color: #aaaaaa"
                >Нужно ввести от {{ minCharsCount }} символов</span
              >
            </th>
            <th>Количество</th>
            <th>Стоимость в изумрудах</th>
            <th>
              Показать на карте<br />
              <button type="button">Сбросить</button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!visibleItems.length">
            <td colspan="4">Нет данных.</td>
          </tr>
          <tr v-else v-for="item in visibleItems" :key="item.uniqueId">
            <td>{{ item.item.name }}</td>
            <td>{{ item.humanQuantity }}</td>
            <td>{{ item.emeraldCost }}</td>
            <td><input type="checkbox" value="0" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
import HeroClient, { TYPE_TOWN, TYPE_START } from "@/api/HeroClient";

const SIDE = 86;
const HALF_SIDE = SIDE / 2;
const HEIGHT = 36;
const IMAGE_SIDE = 40;
const FONT_SIZE = 22;

const MAX_SCALE = 3;
const MIN_SCALE = 0.3;

export default {
  client: new HeroClient(),

  name: "IslandMap",
  props: {
    island: { type: Object, required: true },
    parentPageId: { type: String, required: true },
  },
  data: function () {
    return {
      loadingNodes: true,
      activeNode: null,
      nodeDialogComponent: null,
      updating: false,
      nodes: [],
      items: [],
      scale: 1,
      translateX: 0,
      translateY: 0,
      filter: {
        itemName: "",
      },
    };
  },
  computed: {
    viewBox() {
      const side = SIDE * 5 * this.scale;
      return `-${side} -${side} ${side * 2} ${side * 2}`;
    },
    minCharsCount() {
      return 3;
    },
    imageSide() {
      return IMAGE_SIDE;
    },
    height() {
      return HEIGHT;
    },
    componentId() {
      return this.parentPageId + "__map";
    },
    visibleItems() {
      if (this.filter.itemName.length >= this.minCharsCount) {
        return this.items.filter((item) =>
          item.item.name.includes(this.filter.itemName)
        );
      }

      return this.items;
    },
    visibleIconsItems() {
      return this.visibleItems.filter((item) => item.visibleIcon);
    },
  },
  created() {
    this.loadState();
  },
  mounted() {
    this.loadNodes().then((nodes) => {
      this.nodes = nodes;
      this.items = this.getItems(nodes);
    });
  },
  unmounted() {
    this.saveState();
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
    getItems(nodes) {
      let items = [];
      const maxIconCount = 2;
      const textCX = 0.65 * SIDE;

      nodes.forEach((node) => {
        const itemCount = node?.items.length;
        if (!itemCount) {
          return;
        }
        let iconX =
          itemCount === 1 ? node.x - 0.5 * HALF_SIDE : node.x - HALF_SIDE;
        let iconY = node.y - 0.9 * HEIGHT;
        let textX = itemCount === 1 ? node.x - 0.25 * SIDE : node.x - textCX;
        let textY = iconY + IMAGE_SIDE + FONT_SIZE - 2;

        node.items.forEach((item, index) => {
          let data = {
            uniqueId: node.xyId + "_" + item.id,
            iconUrl: item.iconUrl,
            humanQuantity: this.getHumanQunatity(item.quantity),
            emeraldCost:
              item.emeraldCost !== null
                ? item.emeraldCost * item.quantity
                : null,

            node,
            item,
          };

          if (index < maxIconCount) {
            data.visibleIcon = true;
            data.iconX = iconX;
            data.iconY = iconY;
            data.textX = textX;
            data.textY = textY;

            iconX += HALF_SIDE;
            textX += textCX;
          } else {
            data.visibleIcon = false;
          }

          items.push(data);
        });
      });

      return items;
    },
    /**
     * @param {Object} node
     */
    drawNode(node) {
      let nodeClass = null;
      if (node.typeId === TYPE_START) {
        nodeClass = "node-start";
      } else if (node.typeId === TYPE_TOWN) {
        nodeClass = "node-town";
      }

      const data = this.getCoordinates(node);

      return {
        ...node,
        xyId: node.mx + "_" + node.my,
        x: data.x,
        y: data.y,
        points: this.getPoints(data.coordinates),
        class: nodeClass,
      };
    },
    getCoordinates(node) {
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
        x,
        y,
        coordinates,
      };
    },
    getActivePoints(node) {
      let data = this.getCoordinates(node);
      data.coordinates.push(data.coordinates[0]);

      return this.getPoints(data.coordinates);
    },
    /**
     * @param {Boolean} inc
     */
    onChangeScale(inc) {
      this.scale += inc ? 0.1 : -0.1;

      if (this.scale > MAX_SCALE) {
        this.scale = MAX_SCALE;
      } else if (this.scale < MIN_SCALE) {
        this.scale = MIN_SCALE;
      }
    },
    onResetScale() {
      this.scale = 1;
    },
    onChangeTranslate(dx, dy) {
      const value = 5;

      if (dx !== 0) {
        this.translateX += dx > 0 ? value : -value;
      }
      if (dy !== 0) {
        this.translateY += dy > 0 ? value : -value;
      }
    },
    onResetTranslate() {
      this.translateX = 0;
      this.translateY = 0;
    },
    nodeMouseEnter(node) {
      this.activeNode = node;
    },
    onInputItemName() {
      if (this.filter.itemName.length < this.minCharsCount) {
        return;
      }
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
    loadState() {
      let state;

      try {
        state = JSON.parse(localStorage.getItem(this.componentId));
      } catch (error) {
        console.error(error);
      }

      if (!state) {
        state = {
          scale: 1,
          translateX: 0,
          translateY: 0,
        };
      }
      if (!state.filter) {
        state.filter = {};
      }
      if (!state.filter.itemName) {
        state.filter.itemName = "";
      }

      this.scale = state.scale;
      this.translateX = state.translateX;
      this.translateY = state.translateY;
      this.filter.itemName = state.filter.itemName;
    },
    saveState() {
      const state = {
        scale: this.scale,
        translateX: this.translateX,
        translateY: this.translateY,
        filter: this.filter,
      };
      localStorage.setItem(this.componentId, JSON.stringify(state));
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
.active-frame {
  fill: none;
  stroke: red;
  stroke-width: 3;
}
.node-start {
  fill: brown;
}
.node-town {
  fill: orange;
}
.node-text {
  font-size: 22px;
  fill: rgb(97, 97, 5);
  font-weight: bold;
}
</style>
<style scoped>
.map {
  width: 100%;
  height: 600px;
  padding: 10px;
  outline: 1px solid #dddddd;
}
.actions {
  margin-bottom: 10px;
}
</style>
