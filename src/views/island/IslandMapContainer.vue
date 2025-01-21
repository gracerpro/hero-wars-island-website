<template>
  <div>
    <svg
      ref="svgMap"
      height="600"
      class="canvas prevent-select"
      width="100%"
      tabindex="0"
      :viewBox="viewBox"
      :style="{ 'background-image': backgroundImageUrl ? 'url(' + backgroundImageUrl + ')' : '' }"
      xmlns="http://www.w3.org/2000/svg"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
      @mousemove="onMouseMove"
      @mouseenter="onMouseEnter"
      @wheel="onMouseWheel"
      @mousewheel="onMouseWheel"
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
          v-for="item in rewardIcons"
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
            :class="item.uniqueId"
            @click="onItemClick(item, $event)"
          >
            <title>
              {{ getItemName(item) + getQuantity(item) }},
              {{ t("page.island.notLinkedImage") }}
            </title>
          </rect>
        </template>
        <text
          v-for="item in rewardQuantities"
          :key="item.uid"
          :x="item.x"
          :y="item.y"
          :class="['text', item.isSmallText ? 'text-small' : '']"
          @click="onItemClick(item, $event)"
        >
          {{ item.humanQuantity }}
        </text>
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
const EVENT_SELECT_NODE = "selectNode";
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
import { ref, shallowRef, computed, defineAsyncComponent, onMounted, onUnmounted } from "vue";
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
import { GAME_ID_WOOD } from "@/api/Item";

const { t } = useI18n();

const ToastMessage = import.meta.env.SSR
  ? null
  : defineAsyncComponent(() => import("@/components/ToastMessage.vue"));

const BUTTON_MAIN = 0;

const mouse = {
  isDown: false,
  x0: null,
  y0: null,
  tx0: null,
  ty0: null,
};

const emit = defineEmits([EVENT_CHANGE_TRANSLATE, EVENT_CHANGE_SCALE, EVENT_SELECT_NODE]);
const props = defineProps({
  scale: { type: Number, required: true },
  translateX: { type: Number, required: true },
  translateY: { type: Number, required: true },
  isShowQuantity: { type: Boolean, required: true },
  rewards: { type: Array, required: true },
  nodes: { type: Object, required: true },
  userNodesIdsMap: { type: Object, required: true },
  userNodesGoingIdsMap: { type: Object, required: true },
  disableNodesIdsMap: { type: Object, required: true },
  isSelectAnyNode: { type: Boolean, default: true },
  backgroundImage: { type: [Object, null], required: false, default: null },
});

const svgMap = ref(null);
const infoDialog = ref(null);
const infoDialogComponent = shallowRef(null);
const infoDialogDrawedNode = ref(null);

const toast = ref(null);

defineExpose({
  svgMap,
});

const viewSide = computed(() => SIDE * 5 * props.scale);
const viewWidth = computed(() => viewSide.value * 2);
const viewHeight = computed(() => viewSide.value * 2);
const viewBox = computed(() => {
  return `-${viewSide.value} -${viewSide.value} ${viewSide.value * 2} ${viewSide.value * 2}`;
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
const backgroundImageUrl = computed(() => {
  return props.backgroundImage ? props.backgroundImage.url : "";
});

const iconItems = computed(() => {
  return getIconsItems(props.rewards, totalNodes.value);
});
const rewardIcons = computed(() => {
  return iconItems.value.icons;
});
const rewardQuantities = computed(() => {
  return props.isShowQuantity ? iconItems.value.quantities : [];
});

onMounted(() => {
  window.addEventListener("keydown", onKeyDownMap);
});
onUnmounted(() => {
  window.removeEventListener("keydown", onKeyDownMap);
});

function onKeyDownMap(event) {
  if (event.defaultPrevented) {
    return;
  }
  if (event.target != svgMap.value) {
    return;
  }

  if (event.key === "PageDown") {
    emitNewScale(event, -DELTA_SCALE);
    event.preventDefault();
    return;
  }
  if (event.key === "PageUp") {
    emitNewScale(event, DELTA_SCALE);
    event.preventDefault();
    return;
  }

  let dx = 0;
  let dy = 0;

  switch (event.key) {
    case "ArrowLeft":
      dx = -TRANSLATE_X * 5;
      break;
    case "ArrowRight":
      dx = TRANSLATE_X * 5;
      break;
    case "ArrowUp":
      dy = -TRANSLATE_Y * 5;
      break;
    case "ArrowDown":
      dy = TRANSLATE_Y * 5;
      break;
    default:
      return;
  }

  if (dx != 0 || dy != 0) {
    if (event.ctrlKey) {
      dx /= 10;
      dy /= 10;
    } else if (event.shiftKey) {
      dx /= 2;
      dy /= 2;
    }
    emit(EVENT_CHANGE_TRANSLATE, props.translateX + dx, props.translateY + dy);
    event.preventDefault();
  }
}

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
  if (node.cost?.gameItemId === GAME_ID_WOOD) {
    nodeClass += " node-cost-wood";
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
  const nodeId = item.nodeId ? item.nodeId : item.node.id;
  const drawedNode = totalNodes.value[nodeId];

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
      const message = canSelectNextNode(totalNodes.value, props.userNodesIdsMap, drawedNode);
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
  if (event.button === BUTTON_MAIN) {
    mouse.isDown = true;
    mouse.x0 = event.pageX;
    mouse.y0 = event.pageY;
    mouse.tx0 = props.translateX;
    mouse.ty0 = props.translateY;
  }
}

function onMouseEnter() {
  mouse.isDown = false;
}

/**
 * @param {Object} button
 */
function onMouseMove(button) {
  if (!mouse.isDown) {
    return;
  }

  let resultX = null;
  let resultY = null;

  if (mouse.x0 !== null && mouse.tx0 !== null) {
    const pxWidth = viewWidth.value / svgMap.value.clientWidth;
    const dx = button.pageX - mouse.x0;
    resultX = mouse.tx0 + dx * pxWidth;
  }
  if (mouse.y0 !== null && mouse.ty0 !== null) {
    const pxHeight = viewHeight.value / svgMap.value.clientHeight;
    const dy = button.pageY - mouse.y0;
    resultY = mouse.ty0 + dy * pxHeight;
  }

  if (resultX !== null || resultY !== null) {
    emit(EVENT_CHANGE_TRANSLATE, resultX, resultY);
  }
}

function onMouseUp(event) {
  if (event.button === BUTTON_MAIN) {
    mouse.isDown = false;
  }
}

function onMouseWheel(event) {
  const value = event.deltaY > 0 ? DELTA_SCALE : -DELTA_SCALE;
  emitNewScale(event, value);
  event.preventDefault();
}

/**
 * @param {Object} event
 * @param {Number} value
 */
function emitNewScale(event, value) {
  if (event.ctrlKey) {
    value /= 10;
  } else if (event.shiftKey) {
    value /= 2;
  }

  emit(EVENT_CHANGE_SCALE, value);
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
  return props.userNodesIdsMap[node.id] !== undefined;
}

/**
 * @param {Object} drawedNode
 * @returns {String}
 */
function getUserNodeClass(drawedNode) {
  const nodeId = drawedNode.node.id;
  if (props.userNodesIdsMap[nodeId]) {
    return props.userNodesGoingIdsMap[nodeId] ? "user-node-going" : "user-node";
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
.node-cost-wood {
  fill: #fff;
  stroke-width: 5;
  stroke: #773e23;
}
.node-cost-wood:hover {
  fill: #f1f1f1;
}
.-warning {
  fill: #ffff00;
}
.text {
  font-size: 26px;
  fill: #ffff00;
  font-weight: bold;
  cursor: pointer;
  stroke: black;
  stroke-width: 3;
  stroke-linejoin: round;
  paint-order: stroke fill;
}
.text-small {
  font-size: 18px;
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
.canvas {
  outline: 1px solid #dddddd;
  background-repeat: no-repeat;
  background-size: cover;
}
.canvas:fullscreen {
  background-color: #fff;
}
</style>
