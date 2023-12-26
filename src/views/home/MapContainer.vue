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
        <template v-for="node in nodes" :key="node.xyId">
          <polygon
            :points="node.points"
            :class="['node', node.class, isUserNode(node) ? 'user-node' : '']"
            @mouseenter="nodeMouseEnter(node)"
            @click="onNodeClick(node)"
          />
          <text :x="node.x" :y="node.y" class="node-text">
            {{ node.id }}
          </text>
        </template>

        <text
          v-for="item in unknownItems"
          :key="item.node.xyId"
          :x="item.x"
          :y="item.y"
          :class="['unknown-text', item.isOnModeration ? '-on-moderation' : '']"
          @click="onEditNodeClick(item.node)"
        >
          ?
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
  </div>
</template>
<script>
import UpdateNodeDialog from "./UpdateNodeDialog.vue";
import {
  TYPE_START,
  TYPE_TOWN,
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

const SIDE = 86;
const HALF_SIDE = SIDE / 2;
const HEIGHT = 36;
//const HALF_HEIGHT = HEIGHT / 2;
const IMAGE_SIDE = 40;
const FONT_SIZE = 22;

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
    items: { type: Array, required: true },
    inputNodes: { type: Array, required: true },
    userNodesIds: { type: Array, required: true },
  },
  data: function () {
    return {
      nodes: {},
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
    imageSide() {
      return IMAGE_SIDE;
    },
    unknownItems() {
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
    visibleIconsItems() {
      return this.items.filter((item) => item.visibleIcon);
    },
    userNodes() {
      let nodes = {};

      this.userNodesIds.forEach((id) => {
        const node = this.nodes[id];
        if (node) {
          nodes[id] = node;
        }
      });

      return nodes;
    },
  },
  mounted() {
    this.prepareNodes();
    this.prepareItems();
  },
  methods: {
    /**
     * @param {Array} nodes
     */
    prepareNodes() {
      this.nodes = {};

      this.inputNodes.forEach((node) => {
        this.nodes[node.id] = this.drawNode(node);
      });
    },
    /**
     * @param {Array} items
     */
    prepareItems() {
      this.loadingItems = true;

      const maxIconCount = 2;
      const textCX = 0.65 * SIDE;

      this.items.forEach((item) => {
        if (item.nodeIndex < maxIconCount) {
          const node = this.nodes[item.node.id];
          const itemCount = item.node?.items.length;
          let iconX =
            itemCount === 1
              ? node.x - 0.5 * HALF_SIDE
              : node.x - HALF_SIDE * item.nodeIndex;
          let iconY = node.y - 0.9 * HEIGHT;
          let textX =
            itemCount === 1
              ? node.x - 0.25 * SIDE
              : node.x - textCX * item.nodeIndex;
          let textY = iconY + IMAGE_SIDE + FONT_SIZE - 2;

          item.visibleIcon = true;
          item.iconX = iconX;
          item.iconY = iconY;
          item.textX = textX;
          item.textY = textY;
        } else {
          item.visibleIcon = false;
        }
      });

      this.loadingItems = false;
    },
    getActivePoints(node) {
      let data = this.getCoordinates(node);
      data.coordinates.push(data.coordinates[0]);

      return this.getPoints(data.coordinates);
    },
    /**
     * @param {Object} node
     */
    drawNode(node) {
      let nodeClass = "";

      if (node.typeId === TYPE_START) {
        nodeClass = "node-start";
      } else if (node.typeId === TYPE_TOWN) {
        nodeClass = "node-town";
      }

      //if (this.isUserNode(node)) {
      //  nodeClass += " ";
      //}

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
      if (!canSelectNode(node)) {
        return;
      }
      const isRemove = this.userNodesIds.includes(node.id);

      if (!isRemove) {
        const message = canSelectNextNode(this.nodes, this.userNodes, node);
        console.log(message, !!message);
        if (message) {
          alert(message);
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
      }
      if (isRight) {
        x = TRANSLATE_X;
      }
      if (isTop) {
        y = -TRANSLATE_Y;
      }
      if (isBottom) {
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
            this.nodes[node.id] = this.drawNode(node);
          }
        })
        .finally(() => {
          this.nodeDialog.component = null;
          this.nodeDialog.node = null;
          this.updating = false;
        });
    },
    isUserNode(node) {
      return this.userNodesIds.includes(node.id);
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
.node.user-node {
  fill: #6668f8;
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
.node-text {
  font-size: 22px;
  fill: rgb(97, 97, 5);
  font-weight: bold;
}
.node-start {
  fill: brown;
}
.node-town {
  fill: orange;
}
</style>
<style scoped>
.active-frame {
  fill: none;
  stroke: red;
  stroke-width: 3;
}
</style>
