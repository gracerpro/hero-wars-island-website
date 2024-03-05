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
      ref="canvas"
    >
      <line
        x1="0"
        :y1="-SIDE"
        x2="0"
        :y2="SIDE"
        style="stroke: black; stroke-width: 1"
      />
      <line
        :x1="-SIDE"
        y1="0"
        :x2="SIDE"
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
            @click="onNodeClick(item.node)"
          >
            <title>{{ getItemName(item) + getQuantity(item) }}</title>
          </image>
          <rect
            v-else
            :x="item.iconX"
            :y="item.iconY"
            :width="item.iconWidth"
            :height="item.iconHeight"
            class="item-image"
            @click="onNodeClick(item.node)"
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
            :class="['text', item.fontClass ? item.fontClass : '']"
            @click="onNodeClick(item.node)"
          >
            {{ item.humanQuantity }}
          </text>
        </template>

        <text
          v-for="item in warningNodes"
          :key="item.node.xyId"
          :x="item.x"
          :y="item.y"
          :class="['unknown-text', item.isOnModeration ? '-on-moderation' : '']"
          @click="onEditNodeClick(item.node)"
        >
          ?
          <title>
            {{ getWarningTitle(item) }}
          </title>
        </text>
        <polyline
          v-if="activeNode"
          :points="getActivePoints()"
          class="active-frame"
        />
      </g>
    </svg>

    <component
      :is="nodeDialog.component"
      :node="nodeDialog.node"
      ref="editNodeDialog"
      @vue:mounted="onMountedNodeDialog"
    />
    <toast-message
      ref="toast"
      element-id="mapContainerToast"
    />
  </div>
</template>
<script>
const EVENT_CHANGE_NODE = "change-node";
const EVENT_SELECT_NODE = "select-node";
</script>
<script setup>
import UpdateNodeDialog from "./UpdateNodeDialog.vue";
import { TYPE_DANGER } from "@/components/ToastMessage.vue";
import {
  TYPE_START,
  TYPE_TOWN,
  TYPE_CHEST,
  STATUS_ON_MODERATION,
  STATUS_NOT_SURE,
  getStatusName,
} from "@/api/Node";
import { ref, shallowReactive, computed, defineAsyncComponent } from "vue";
import {
  TRANSLATE_X,
  TRANSLATE_Y,
  EVENT_CHANGE_TRANSLATE,
  EVENT_CHANGE_SCALE,
  DELTA_SCALE,
  canSelectNode,
  canSelectNextNode,
  canEditNode,
} from "@/services/island-map";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const ToastMessage = import.meta.env.SSR
  ? null
  : defineAsyncComponent(() => import("@/components/ToastMessage.vue"));

const SIDE = 50;
const HALF_SIDE = SIDE / 2;
const HEIGHT = 34;
const IMAGE_SIDE = 24;

const MIDDLE_BUTTON = 1;

const mouse = {
  isDown: false,
  preventX: null,
  preventY: null,
};

const canvas = ref(null);

const emit = defineEmits([
  EVENT_CHANGE_TRANSLATE,
  EVENT_CHANGE_SCALE,
  EVENT_CHANGE_NODE,
  EVENT_SELECT_NODE,
]);
const props = defineProps({
  scale: { type: Number, required: true },
  translateX: { type: Number, required: true },
  translateY: { type: Number, required: true },
  isOnlyImage: { type: Boolean, required: true },
  isShowNoModerate: { type: Boolean, required: true },
  items: { type: Array, required: true },
  inputNodes: { type: Object, required: true },
  userNodesMap: { type: Object, required: true },
});
defineExpose({
  canvas,
});

const toast = ref(null);
const updating = ref(false);
const editNodeDialog = ref(null);
const nodeDialog = shallowReactive({
  node: null,
  component: null,
});
let activeNode = null;

const viewBox = computed(() => {
  const side = SIDE * 5 * props.scale;
  return `-${side} -${side} ${side * 2} ${side * 2}`;
});
const nodes = computed(() => {
  let nodes = {};

  for (const id in props.inputNodes) {
    const node = props.inputNodes[id];
    nodes[id] = drawNode(node);
  }

  return nodes;
});
const warningNodes = computed(() => {
  if (!props.isShowNoModerate) {
    return [];
  }

  let items = [];

  for (let id in nodes.value) {
    const node = nodes.value[id];

    if (canEditNode(node)) {
      items.push({
        node,
        x: node.x - 0.2 * SIDE,
        y: node.y + 0.64 * HEIGHT,
        isOnModeration: node.statusId === STATUS_ON_MODERATION,
      });
    }
  }

  return items;
});
const iconsItems = computed(() => {
  let countsByNode = getCountsByNode(props.items);
  let resultItems = [];
  let indexesByNode = {};

  props.items.forEach((item) => {
    const node = nodes.value[item.node.id];
    const count = countsByNode[node.id];
    const isShowText = item.item.quantity > 1 && !props.isOnlyImage;

    item.textX = null;
    item.textY = null;
    item.fontClass = null;

    if (count === 1) {
      const fontSize = 20;
      item.iconWidth = IMAGE_SIDE * (isShowText ? 1.9 : 2.2);
      item.iconHeight = IMAGE_SIDE * (isShowText ? 1.9 : 2.2);
      item.iconX = node.x - item.iconWidth / 2;
      item.iconY = node.y - item.iconHeight / 2 - (isShowText ? fontSize / 2 : 0);
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
        item.iconY = node.y - item.iconHeight / 2 - (isShowText ? fontSize / 2 : 0);

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
});

const getActivePoints = () => {
  let data = getCoordinates(activeNode);
  data.coordinates.push(data.coordinates[0]);

  return getPoints(data.coordinates);
};
/**
 * @param {Object} node
 */
function drawNode(node) {
  const classes = {
    [TYPE_START]: "node-start",
    [TYPE_TOWN]: "node-town",
    [TYPE_CHEST]: "node-chest",
  };
  const data = getCoordinates(node);

  return {
    ...node,
    xyId: node.mx + "_" + node.my,
    x: data.x,
    y: data.y,
    points: getPoints(data.coordinates),
    class: classes[node.typeId] ? classes[node.typeId] : "",
  };
}
/**
 * @param {Array} coordinates
 */
function getPoints(coordinates) {
  return coordinates.map((item) => item.x + "," + item.y).join(" ");
}
/**
 * @param {Object} node
 */
function getCoordinates(node) {
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
}
const nodeMouseEnter = (node) => {
  activeNode = node;
};
const onNodeClick = (node) => {
  const isRemove = isUserNode(node);

  if (isRemove) {
    if (!canSelectNode(node)) {
      return;
    }
  } else {
    const message = canSelectNextNode(nodes.value, props.userNodesMap, node);
    if (message) {
      toast.value.show(message, TYPE_DANGER);
      return;
    }
  }

  emit(EVENT_SELECT_NODE, node.id, isRemove);
};
/**
 * @param {Object} button
 */
const onMouseDown = (event) => {
  if (event.button === MIDDLE_BUTTON) {
    mouse.preventX = event.button.pageX;
    mouse.preventY = event.button.pageY;
    mouse.isDown = true;
  }
};
/**
 * @param {Object} button
 */
const onMouseMove = (button) => {
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

  emit(EVENT_CHANGE_TRANSLATE, x, y);

  mouse.preventX = button.pageX;
  mouse.preventY = button.pageY;
};
const onMouseUp = (event) => {
  if (event.button === MIDDLE_BUTTON) {
    mouse.isDown = false;
  }
};
const onMouseWheel = (event) => {
  emit(EVENT_CHANGE_SCALE, event.deltaY > 0 ? DELTA_SCALE : -DELTA_SCALE);
  event.preventDefault();
};
const onEditNodeClick = (node) => {
  if (!updating.value) {
    updating.value = true;
    nodeDialog.node = node;
    nodeDialog.component = UpdateNodeDialog;
  }
};
const onMountedNodeDialog = () => {
  editNodeDialog.value
    .show()
    .then((node) => {
      if (node !== null && node !== undefined) {
        emit(EVENT_CHANGE_NODE, node);
      }
    })
    .finally(() => {
      nodeDialog.component = null;
      nodeDialog.node = null;
      updating.value = false;
    });
};
const isUserNode = (node) => {
  return props.userNodesMap[node.id] !== undefined;
};
const getWarningTitle = (item) => {
  if (item.node.statusId === STATUS_ON_MODERATION || item.node.statusId === STATUS_NOT_SURE) {
    return getStatusName(t, item.node.statusId);
  }
  if (!item.node.items || !item.node.items.length) {
    return t("page.island.notLinkedResource");
  }

  return "";
};
const getQuantity = (item) => {
  return item.item.quantity > 1 ? ", " + item.item.quantity : "";
};
const getItemName = (item) => {
  return item.item.name ? item.item.name : t("common.noName");
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
  fill: #a6f3fd;
}
.node-start:hover {
  fill: #d6f7fc;
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
  font-size: 58px;
  fill: #ebdd60;
  font-weight: bold;
  cursor: pointer;
}
.unknown-text:hover {
  fill: #ffe500;
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
.canvas:fullscreen {
  background-color: #fff;
}
.active-frame {
  fill: none;
  stroke: red;
  stroke-width: 3;
}
</style>
