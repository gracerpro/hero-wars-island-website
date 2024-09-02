<template>
  <div class="map">
    <svg
      height="600"
      class="canvas"
      width="100%"
      :viewBox="viewBox"
      xmlns="http://www.w3.org/2000/svg"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
      @mousemove="onMouseMove"
      @wheel="onMouseWheel"
      ref="svgMap"
    >
      <g :transform="'translate(' + translateX + ' ' + translateY + ')'">
        <polygon
          v-for="node in totalNodes"
          :key="node.xyId"
          :points="node.points"
          :class="['node', node.nodeClass, getUserNodeClass(node)]"
          @click="onNodeClick(node, $event)"
        />
        <template
          v-for="item in iconsItems"
          :key="item.uniqueId"
        >
          <image
            v-if="item.item.iconUrl"
            :x="item.iconX"
            :y="item.iconY"
            :width="item.iconWidth"
            :height="item.iconHeight"
            :href="item.item.iconUrl"
            class="item-image"
            @click="onItemClick(item, $event)"
          >
            <title>{{ getItemName(item) + getQuantity(item) }}</title>
          </image>
          <rect
            v-else
            :x="item.iconX"
            :y="item.iconY"
            :width="item.iconWidth"
            :height="item.iconHeight"
            class="item-empty-image"
            @click="onItemClick(item, $event)"
          >
            <title>
              {{ getItemName(item) + getQuantity(item) }},
              {{ t("page.island.notLinkedImage") }}
            </title>
          </rect>
          <text
            v-if="item.textX && item.textY"
            :x="item.textX"
            :y="item.textY"
            :class="['text', item.isSmallText ? 'text-small' : '']"
            @click="onItemClick(item, $event)"
          >
            {{ item.humanQuantity }}
          </text>
        </template>
      </g>
    </svg>

    <component
      :is="infoDialogComponent"
      ref="infoDialog"
      :drawed-node="infoDialogDrawedNode"
      @vue:mounted="onMountedInfoDialog"
    />

    <toast-message
      ref="toast"
      element-id="mapContainerToast"
    />
  </div>
</template>
<script>
const EVENT_SELECT_NODE = "select-node";
</script>
<script setup>
import { TYPE_DANGER } from "@/components/ToastMessage.vue";
import {
  TYPE_START,
  TYPE_TOWER,
  TYPE_CHEST,
  TYPE_BLOCKER,
  TYPE_NODE,
  STATUS_NOT_SURE,
  TYPE_WOOD,
  TYPE_BUBBLE,
} from "@/api/Node";
import { ref, shallowRef, computed, defineAsyncComponent } from "vue";
import {
  TRANSLATE_X,
  TRANSLATE_Y,
  EVENT_CHANGE_TRANSLATE,
  EVENT_CHANGE_SCALE,
  DELTA_SCALE,
  canSelectNode,
  canSelectNextNode,
} from "@/services/island-map";
import { getIconsItems, getDrawedNodes, SIDE } from "./map";
import { useI18n } from "vue-i18n";
import IslandMapInfoDialog from "./IslandMapInfoDialog.vue";

const { t } = useI18n();

const ToastMessage = import.meta.env.SSR
  ? null
  : defineAsyncComponent(() => import("@/components/ToastMessage.vue"));

const MIDDLE_BUTTON = 1;

const mouse = {
  isDown: false,
  preventX: null,
  preventY: null,
};

const emit = defineEmits([EVENT_CHANGE_TRANSLATE, EVENT_CHANGE_SCALE, EVENT_SELECT_NODE]);
const props = defineProps({
  scale: { type: Number, required: true },
  translateX: { type: Number, required: true },
  translateY: { type: Number, required: true },
  isShowQuantity: { type: Boolean, required: true },
  items: { type: Array, required: true },
  nodes: { type: Object, required: true },
  userNodesMap: { type: Object, required: true },
  isSelectAnyNode: { type: Boolean, default: true },
});

const svgMap = ref(null);
const infoDialog = ref(null);
const infoDialogComponent = shallowRef(null);
const infoDialogDrawedNode = ref(null);

defineExpose({
  svgMap,
});

const toast = ref(null);

const viewBox = computed(() => {
  const side = SIDE * 5 * props.scale;
  return `-${side} -${side} ${side * 2} ${side * 2}`;
});
const totalNodes = computed(() => {
  let drawedNodes = getDrawedNodes(props.nodes);

  for (const id in drawedNodes) {
    const drawedNode = drawedNodes[id];
    drawedNode.nodeClass = getNodeClass(drawedNode.node);
    drawedNode.points = getPoints(drawedNode.coordinates);
  }

  return drawedNodes;
});

const iconsItems = computed(() =>
  getIconsItems(props.items, totalNodes.value, props.isShowQuantity)
);

function getNodeClass(node) {
  const classes = {
    [TYPE_NODE]: "node-step",
    [TYPE_START]: "node-start",
    [TYPE_TOWER]: "node-tower",
    [TYPE_WOOD]: "node-wood",
    [TYPE_BUBBLE]: "node-bubble",
    [TYPE_CHEST]: "node-chest",
    [TYPE_BLOCKER]: "node-blocker",
  };
  let nodeClass = classes[node.typeId] ? classes[node.typeId] : "";

  if (node.statusId == STATUS_NOT_SURE) {
    nodeClass += " -warning";
  }

  return nodeClass;
}

/**
 * @param {Array} coordinates
 */
function getPoints(coordinates) {
  return coordinates.map((item) => item.x + "," + item.y).join(" ");
}

/**
 * @param {Object} drawedNode
 * @param {Object} event
 */
function onNodeClick(drawedNode, event) {
  if (event.ctrlKey) {
    infoDialogDrawedNode.value = drawedNode;
    infoDialogComponent.value = IslandMapInfoDialog;
  } else {
    selectNode(drawedNode);
  }
}

/**
 * @param {Object} item
 * @param {Object} event
 */
function onItemClick(item, event) {
  const drawedNode = totalNodes.value[item.node.id];

  if (event.ctrlKey) {
    infoDialogDrawedNode.value = drawedNode;
    infoDialogComponent.value = IslandMapInfoDialog;
  } else {
    selectNode(drawedNode);
  }
}

/**
 * @param {Object} drawedNode
 */
function selectNode(drawedNode) {
  if (!canSelectNode(drawedNode.node)) {
    return;
  }
  if (!isUserNode(drawedNode.node)) {
    if (!props.isSelectAnyNode) {
      const message = canSelectNextNode(totalNodes.value, props.userNodesMap, drawedNode);
      if (message) {
        toast.value.show(message, TYPE_DANGER);
        return;
      }
    }
  }

  emit(EVENT_SELECT_NODE, drawedNode.node.id);
}

/**
 * @param {Object} button
 */
function onMouseDown(event) {
  if (event.button === MIDDLE_BUTTON) {
    mouse.preventX = event.pageX;
    mouse.preventY = event.pageY;
    mouse.isDown = true;
  }
}

/**
 * @param {Object} button
 */
function onMouseMove(button) {
  if (!mouse.isDown) {
    return;
  }

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
  const halfScale = props.scale / 2;

  if (isLeft) {
    x = -TRANSLATE_X * halfScale;
  } else if (isRight) {
    x = TRANSLATE_X * halfScale;
  }
  if (isTop) {
    y = -TRANSLATE_Y * halfScale;
  } else if (isBottom) {
    y = TRANSLATE_Y * halfScale;
  }

  emit(EVENT_CHANGE_TRANSLATE, x, y);

  mouse.preventX = button.pageX;
  mouse.preventY = button.pageY;
}

function onMouseUp(event) {
  if (event.button === MIDDLE_BUTTON) {
    mouse.isDown = false;
  }
}

function onMouseWheel(event) {
  let value = event.deltaY > 0 ? DELTA_SCALE : -DELTA_SCALE;

  if (event.ctrlKey) {
    value /= 10;
  } else if (event.shiftKey) {
    value /= 2;
  }

  emit(EVENT_CHANGE_SCALE, value);
  event.preventDefault();
}

function onMountedInfoDialog() {
  infoDialog.value.show().finally(() => {
    infoDialogDrawedNode.value = null;
    infoDialogComponent.value = null;
  });
}

/**
 * @param {Object} node
 * @returns {Boolean}
 */
function isUserNode(node) {
  return props.userNodesMap[node.id] !== undefined;
}

/**
 * @param {Object} drawedNode
 * @returns {String}
 */
function getUserNodeClass(drawedNode) {
  if (props.userNodesMap[drawedNode.node.id] !== undefined) {
    return props.userNodesMap[drawedNode.node.id].isGoingChecked ? "user-node-going" : "user-node";
  }
  return "";
}

function getQuantity(item) {
  return item.item.quantity > 1 ? ", " + item.item.quantity : "";
}

function getItemName(item) {
  return item.item.name ? item.item.name : t("common.noName");
}
</script>
<style>
.node {
  stroke-width: 1;
  stroke: #ddd;
}
.node-step {
  fill: #9da7c9;
  cursor: pointer;
}
.node-step:hover {
  fill: #bcc5e6;
}
.node-start {
  fill: #94fdfe;
}
.node-start:hover {
  fill: #b5f9fa;
}
.node-tower {
  fill: #ba662c;
}
.node-tower:hover {
  fill: #da8237;
}
.node-wood {
  fill: #773e23;
}
.node-wood:hover {
  fill: #9a5832;
}
.node-bubble {
  fill: #deb28d;
}
.node-bubble:hover {
  fill: #f7cba6;
}
.node-chest {
  fill: #1a660b;
  cursor: pointer;
}
.node-chest:hover {
  fill: #566d51;
}
.node-blocker {
  fill: #867878;
}
.node-blocker:hover {
  fill: #9c8e8e;
}
.-warning {
  fill: #ffff00;
}
.text {
  font-size: 20px;
  fill: #000;
  font-weight: bold;
  cursor: pointer;
}
.text-small {
  font-size: 16px;
}
.item-image {
  cursor: pointer;
}
.item-empty-image {
  stroke: #999;
  fill: #fff;
  cursor: pointer;
}
.node.user-node {
  fill: #6668f8;
}
.node.user-node-going {
  fill: #f86696;
}
</style>
<style scoped>
.map {
  margin-left: 45px;
}
.canvas {
  outline: 1px solid #dddddd;
}
.canvas:fullscreen {
  background-color: #fff;
}
</style>
