<template>
  <div class="map">
    <svg
      height="600"
      width="100%"
      :viewBox="viewBox"
      xmlns="http://www.w3.org/2000/svg"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
      @mousemove="onMouseMove"
      @wheel="onMouseWheel"
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
          :class="['node', node.class, isUserNode(node) ? 'user-node' : '']"
          @mouseenter="nodeMouseEnter(node)"
          @click="onNodeClick(node)"
        />
        <template v-for="item in iconsItems" :key="item.uniqueId">
          <image
            v-if="item.item.iconUrl"
            :x="item.iconX"
            :y="item.iconY"
            :width="item.iconWidth"
            :height="item.iconHeight"
            :href="item.item.iconUrl"
            @click="onNodeClick(item.node)"
          >
            <title>{{ item.item.name + ", " + item.humanQuantity }}</title>
          </image>
          <rect
            v-else
            :x="item.iconX"
            :y="item.iconY"
            :width="item.iconWidth"
            :height="item.iconHeight"
            class="item-image"
          >
            <title>
              {{ item.item.name + ", " + item.item.quantity }}, изображение не
              привязано
            </title>
          </rect>
          <text
            v-if="item.textX && item.textY"
            :x="item.textX"
            :y="item.textY"
            :class="['text', item.fontClass ? item.fontClass : '']"
            @click="onNodeClick(item.node)"
          >
            {{ item.humanQuantity }}
          </text>
        </template>

        <text
          v-for="item in noItemsNodes"
          :key="item.node.xyId"
          :x="item.x"
          :y="item.y"
          :class="['unknown-text', item.isOnModeration ? '-on-moderation' : '']"
          @click="onEditNodeClick(item.node)"
        >
          ?
          <title>
            {{ item.isOnModeration ? "На модерации" : "Предметы не привязаны" }}
          </title>
        </text>
        <polyline
          v-if="activeNode"
          :points="getActivePoints(activeNode)"
          class="active-frame"
        />
      </g>
    </svg>

    <component
      :is="nodeDialog.component"
      :node="nodeDialog.node"
      ref="nodeDialog"
      @mounted="onMountedNodeDialog"
    />
    <toast-message ref="toast" element-id="mapContainerToast" />
  </div>
</template>
<script>
import UpdateNodeDialog from "./UpdateNodeDialog.vue";
import ToastMessage, { TYPE_DANGER } from "@/components/ToastMessage.vue";
import {
  TYPE_START,
  TYPE_TOWN,
  TYPE_CHEST,
  STATUS_ON_MODERATION,
  STATUS_ACCEPTED_SUCCESS,
} from "@/api/HeroClient";
import { shallowRef } from "vue";
import {
  TRANSLATE_X,
  TRANSLATE_Y,
  EVENT_CHANGE_TRANSLATE,
  EVENT_CHANGE_SCALE,
  DELTA_SCALE,
  canSelectNode,
  canSelectNextNode,
} from "./map";

const SIDE = 50;
const HALF_SIDE = SIDE / 2;
const HEIGHT = 34;
const IMAGE_SIDE = 24;

const MIDDLE_BUTTON = 1;

const EVENT_CHANGE_NODE = "change-node";
const EVENT_SELECT_NODE = "select-node";

export default {
  mouse: {
    isDown: false,
    preventX: null,
    preventY: null,
  },

  name: "MapContainer",
  components: { ToastMessage },
  emits: [
    EVENT_CHANGE_TRANSLATE,
    EVENT_CHANGE_SCALE,
    EVENT_CHANGE_NODE,
    EVENT_SELECT_NODE,
  ],
  props: {
    scale: { type: Number, required: true },
    translateX: { type: Number, required: true },
    translateY: { type: Number, required: true },
    isOnlyImage: { type: Boolean, required: true },
    isShowNoModerate: { type: Boolean, required: true },
    items: { type: Array, required: true },
    inputNodes: { type: Object, required: true },
    userNodes: { type: Object, required: true },
  },
  data: function () {
    return {
      //  nodes: {},
      updating: false,
      nodeDialog: {
        node: null,
        component: null,
      },
      activeNode: null,
    };
  },
  computed: {
    viewBox() {
      const side = SIDE * 5 * this.scale;
      return `-${side} -${side} ${side * 2} ${side * 2}`;
    },
    noItemsNodes() {
      if (!this.isShowNoModerate) {
        return [];
      }

      let items = [];

      for (let id in this.nodes) {
        const node = this.nodes[id];
        if (
          !node?.items.length &&
          node.typeId !== TYPE_START &&
          node.statusId !== STATUS_ACCEPTED_SUCCESS
        ) {
          items.push({
            node,
            x: node.x - 0.2 * SIDE,
            y: node.y + 0.4 * HEIGHT,
            isOnModeration: node.statusId === STATUS_ON_MODERATION,
          });
        }
      }

      return items;
    },
    nodes() {
      let nodes = {};

      for (const id in this.inputNodes) {
        const node = this.inputNodes[id];
        nodes[id] = this.drawNode(node);
      }

      return nodes;
    },
    iconsItems() {
      let countsByNode = getCountsByNode(this.items);
      let resultItems = [];
      let indexesByNode = {};

      this.items.forEach((item) => {
        const node = this.nodes[item.node.id];
        const count = countsByNode[node.id];
        const isShowText = item.item.quantity > 1 && !this.isOnlyImage;

        item.textX = null;
        item.textY = null;
        item.fontClass = null;

        if (count === 1) {
          const fontSize = 20;
          item.iconWidth = IMAGE_SIDE * (isShowText ? 1.9 : 2.2);
          item.iconHeight = IMAGE_SIDE * (isShowText ? 1.9 : 2.2);
          item.iconX = node.x - item.iconWidth / 2;
          item.iconY =
            node.y - item.iconHeight / 2 - (isShowText ? fontSize / 2 : 0);
          if (isShowText) {
            item.textX = item.iconX + item.iconWidth * 0.05;
            item.textY = node.y + HEIGHT - 3;
          }
        } else {
          if (!indexesByNode[node.id]) {
            indexesByNode[node.id] = 0;
          }
          const index = indexesByNode[node.id];
          const borderWidth = 2;

          if (count === 2) {
            const fontSize = 16;
            item.iconWidth = IMAGE_SIDE * (isShowText ? 1.3 : 1.4);
            item.iconHeight = IMAGE_SIDE * (isShowText ? 1.3 : 1.4);
            const cx = item.iconWidth + borderWidth;
            const srartX = node.x - cx + borderWidth / 2;
            item.iconX = srartX + cx * index;
            item.iconY =
              node.y - item.iconHeight / 2 - (isShowText ? fontSize / 2 : 0);

            if (isShowText) {
              item.textX = srartX + cx * index;
              item.textY = node.y + HEIGHT - fontSize * 0.7;
              item.fontClass = "text-2";
            }
          } else if (index <= 3) {
            // count >= 3
            // 0,0   1,0
            //     *
            // 0,1   1,1
            item.iconWidth = IMAGE_SIDE * 1.1;
            item.iconHeight = IMAGE_SIDE * 1.1;
            const cx = item.iconWidth + borderWidth;
            const srartX = node.x - cx + borderWidth / 2;
            item.iconX = srartX + (index % 2 === 0 ? 0 : cx);
            const cy = item.iconHeight + borderWidth;
            const srartY = node.y - cy + borderWidth / 2;
            item.iconY = srartY + (index < 2 ? 0 : cy);
          } else {
            item = false;
          }

          indexesByNode[node.id]++;
        }

        if (item) {
          resultItems.push(item);
        }
      });

      return resultItems;

      function getCountsByNode(items) {
        let countsByNode = {};

        items.forEach((item) => {
          const nodeId = item.node.id;

          if (!countsByNode[nodeId]) {
            countsByNode[nodeId] = 0;
          }
          countsByNode[nodeId]++;
        });

        return countsByNode;
      }
    },
  },
  methods: {
    /**
     * @param {Object} node
     */
    getActivePoints(node) {
      let data = this.getCoordinates(node);
      data.coordinates.push(data.coordinates[0]);

      return this.getPoints(data.coordinates);
    },
    /**
     * @param {Object} node
     */
    drawNode(node) {
      const classes = {
        [TYPE_START]: "node-start",
        [TYPE_TOWN]: "node-town",
        [TYPE_CHEST]: "node-chest",
      };
      const data = this.getCoordinates(node);

      return {
        ...node,
        xyId: node.mx + "_" + node.my,
        x: data.x,
        y: data.y,
        points: this.getPoints(data.coordinates),
        class: classes[node.typeId] ? classes[node.typeId] : "",
      };
    },
    /**
     * @param {Array} coordinates
     */
    getPoints(coordinates) {
      return coordinates.map((item) => item.x + "," + item.y).join(" ");
    },
    /**
     * @param {Object} node
     */
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
    nodeMouseEnter(node) {
      this.activeNode = node;
    },
    onNodeClick(node) {
      const isRemove = this.isUserNode(node);

      if (isRemove) {
        if (!canSelectNode(node)) {
          return;
        }
      } else {
        const message = canSelectNextNode(this.nodes, this.userNodes, node);
        if (message) {
          this.$refs.toast.show(message, TYPE_DANGER);
          return;
        }
      }

      this.$emit(EVENT_SELECT_NODE, node.id, isRemove);
    },
    /**
     * @param {Object} button
     */
    onMouseDown(event) {
      if (event.button === MIDDLE_BUTTON) {
        this.$options.mouse.preventX = event.button.pageX;
        this.$options.mouse.preventY = event.button.pageY;
        this.$options.mouse.isDown = true;
      }
    },
    /**
     * @param {Object} button
     */
    onMouseMove(button) {
      if (!this.$options.mouse.isDown) {
        return;
      }

      const mouse = this.$options.mouse;

      if (mouse.preventX === null) {
        mouse.preventX = button.pageX;
      }
      if (mouse.preventY === null) {
        mouse.preventY = button.pageY;
      }

      const isLeft = button.pageX < mouse.preventX;
      const isRight = button.pageX > mouse.preventX;
      const isTop = button.pageY < mouse.preventY;
      const isBottom = button.pageY > mouse.preventY;
      let x = 0,
        y = 0;

      if (isLeft) {
        x = -TRANSLATE_X;
      } else if (isRight) {
        x = TRANSLATE_X;
      }
      if (isTop) {
        y = -TRANSLATE_Y;
      } else if (isBottom) {
        y = TRANSLATE_Y;
      }

      this.$emit(EVENT_CHANGE_TRANSLATE, x, y);

      mouse.preventX = button.pageX;
      mouse.preventY = button.pageY;
    },
    onMouseUp(event) {
      if (event.button === MIDDLE_BUTTON) {
        this.$options.mouse.isDown = false;
      }
    },
    onMouseWheel(event) {
      this.$emit(
        EVENT_CHANGE_SCALE,
        event.deltaY > 0 ? DELTA_SCALE : -DELTA_SCALE
      );
      event.preventDefault();
    },
    onEditNodeClick(node) {
      if (!this.updating) {
        this.updating = true;
        this.nodeDialog.node = node;
        this.nodeDialog.component = shallowRef(UpdateNodeDialog);
      }
    },
    onMountedNodeDialog() {
      this.$refs.nodeDialog
        .show()
        .then((node) => {
          if (node !== null && node !== undefined) {
            this.$emit(EVENT_CHANGE_NODE, node);
            // this.nodes[node.id] = this.drawNode(node);
          }
        })
        .finally(() => {
          this.nodeDialog.component = null;
          this.nodeDialog.node = null;
          this.updating = false;
        });
    },
    isUserNode(node) {
      return this.userNodes[node.id] !== undefined;
    },
  },
};
</script>
<style>
.node {
  fill: #9da7c9;
  stroke: #dddddd;
  stroke-width: 1;
}
.node:hover {
  fill: #bcc5e6;
}
.node-start {
  fill: #55211d;
}
.node-start:hover {
  fill: #796b6a;
}
.node-town {
  fill: #94440e;
}
.node-town:hover {
  fill: #88776c;
}
.node-chest {
  fill: #1a660b;
}
.node-chest:hover {
  fill: #566d51;
}
.node.user-node {
  fill: #6668f8;
}
.text {
  font-size: 20px;
  fill: #000;
  font-weight: bold;
}
.text-2 {
  font-size: 16px;
}
.unknown-text {
  font-size: 50px;
  fill: rgb(235, 235, 102);
  font-weight: bold;
  cursor: pointer;
}
.unknown-text:hover {
  fill: rgb(151, 151, 62);
}
.-on-moderation {
  fill: green;
}
.item-image {
  stroke: #999;
  stroke-width: 2;
  fill: #fff;
}
</style>
<style scoped>
.active-frame {
  fill: none;
  stroke: red;
  stroke-width: 3;
}
</style>
