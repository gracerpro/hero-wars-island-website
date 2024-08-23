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
          v-for="node in nodes"
          :key="node.xyId"
          :points="node.points"
          :class="['node', node.class, getUserNodeClass(node)]"
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
            class="item-image"
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
            class="item-empty-image"
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
      </g>
    </svg>

    <toast-message
      ref="toast"
      element-id="mapContainerToast"
    />

    <div>
      <button type="button" @click="downloadAsPng">PNG</button>
    </div>

    <div>
      <canvas ref="canvas" style="outline: 1px solid #ccc;"></canvas>
    </div>
  </div>
</template>
<script>
const EVENT_CHANGE_NODE = "change-node";
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
} from "@/api/Node";
import { ref, computed, defineAsyncComponent } from "vue";
import {
  TRANSLATE_X,
  TRANSLATE_Y,
  EVENT_CHANGE_TRANSLATE,
  EVENT_CHANGE_SCALE,
  DELTA_SCALE,
  canSelectNode,
  canSelectNextNode,
} from "@/services/island-map";
import { useI18n } from "vue-i18n";
//import { Canvg } from "canvg";

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

const svgMap = ref(null);
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
  isShowQuantity: { type: Boolean, required: true },
  items: { type: Array, required: true },
  inputNodes: { type: Object, required: true },
  userNodesMap: { type: Object, required: true },
  isSelectAnyNode: { type: Boolean, default: true },
});
defineExpose({
  svgMap,
});

const toast = ref(null);

const viewBox = computed(() => {
  const side = SIDE * 5 * props.scale;
  return `-${side} -${side} ${side * 2} ${side * 2}`;
});
const nodes = computed(() => {
  let nodes = {};

  for (const id in props.inputNodes) {
    const node = props.inputNodes[id];
    nodes[id] = getDrawNode(node);
  }

  return nodes;
});
const minMaxNodeCoordinates = computed(() => {
  let minX = null;
  let minY = null;
  let maxX = null;
  let maxY = null;

  for (const id in props.inputNodes) {
    const node = props.inputNodes[id]
    minX = node.mx
    maxX = node.mx
    minY = node.my
    maxY = node.my
    break;
  }

  for (const id in props.inputNodes) {
    const node = props.inputNodes[id];
    
    if (node.mx > maxX) {
      maxX = node.mx
    }
    if (node.mx < minX) {
      minX = node.mx
    }
    if (node.my < minY) {
      minY = node.my
    }
    if (node.my > maxY) {
      maxY = node.my
    }
  }

  return {
    minX,
    maxX,
    minY,
    maxY
  }
})
const iconsItems = computed(() => {
  let countsByNode = getCountsByNode(props.items);
  let resultItems = [];
  let indexesByNode = {};

  props.items.forEach((item) => {
    const node = nodes.value[item.node.id];
    const count = countsByNode[node.id];
    const isShowText = item.item.quantity > 1 && props.isShowQuantity;

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

/**
 * @param {Object} node
 */
function getDrawNode(node) {
  const classes = {
    [TYPE_NODE]: "node-step",
    [TYPE_START]: "node-start",
    [TYPE_TOWER]: "node-tower",
    [TYPE_CHEST]: "node-chest",
    [TYPE_BLOCKER]: "node-blocker",
  };
  const data = getCoordinates(node);

  let nodeClass = classes[node.typeId] ? classes[node.typeId] : "";

  if (node.statusId == STATUS_NOT_SURE) {
    nodeClass += " -warning";
  }

  return {
    ...node,
    xyId: node.mx + "_" + node.my,
    x: data.x,
    y: data.y,
    coordinates: data.coordinates,
    points: getPoints(data.coordinates),
    class: nodeClass,
  };
}
/**
 * @param {Array} coordinates
 */
function getPoints(coordinates) {
  return coordinates.map((item) => item.x + "," + item.y).join(" ");
}

function getOneWidth() {
  return 1.5 * SIDE
}

function getOneHeight() {
  return 2 * HEIGHT
}

/**
 * @param {Object} node
 */
function getCoordinates(node) {
  const x = node.mx * getOneWidth();
  const y = node.my * getOneHeight() + (node.mx % 2 === 0 ? 0 : getOneHeight() / 2);

  let coordinates = new Array(6);
  coordinates[0] = { x: x + SIDE, y };
  coordinates[1] = { x: x + HALF_SIDE, y: y + HEIGHT };
  coordinates[2] = { x: x - HALF_SIDE, y: y + HEIGHT };
  coordinates[3] = { x: x - SIDE, y };
  coordinates[4] = { x: x - HALF_SIDE, y: y - HEIGHT };
  coordinates[5] = { x: x + HALF_SIDE, y: y - HEIGHT };

  return {
    x,
    y,
    coordinates,
  };
}

function onNodeClick(node) {
  if (!canSelectNode(node)) {
    return;
  }

  if (!isUserNode(node)) {
    if (!props.isSelectAnyNode) {
      const message = canSelectNextNode(nodes.value, props.userNodesMap, node);
      if (message) {
        toast.value.show(message, TYPE_DANGER);
        return;
      }
    }
  }

  emit(EVENT_SELECT_NODE, node.id);
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
const onMouseUp = (event) => {
  if (event.button === MIDDLE_BUTTON) {
    mouse.isDown = false;
  }
};
const onMouseWheel = (event) => {
  emit(EVENT_CHANGE_SCALE, event.deltaY > 0 ? DELTA_SCALE : -DELTA_SCALE);
  event.preventDefault();
};
const isUserNode = (node) => {
  return props.userNodesMap[node.id] !== undefined;
};
const getUserNodeClass = (node) => {
  if (props.userNodesMap[node.id] !== undefined) {
    return props.userNodesMap[node.id].isGoingChecked ? "user-node-going" : "user-node";
  }
};
const getQuantity = (item) => {
  return item.item.quantity > 1 ? ", " + item.item.quantity : "";
};
const getItemName = (item) => {
  return item.item.name ? item.item.name : t("common.noName");
};

// TODO: make a downlaod as PNG

function downloadAsPng() {
  const canvasElem = canvas.value //document.createElement('canvas');
  const xCount = Math.abs(minMaxNodeCoordinates.value.maxX - minMaxNodeCoordinates.value.minX) + 1 + 1
  const yCount = Math.abs(minMaxNodeCoordinates.value.maxY - minMaxNodeCoordinates.value.minY) + 1 + 1
  console.log(xCount, yCount)

  const width = xCount * getOneWidth()
  const height = (yCount + 0.5) * getOneHeight()
  canvasElem.width = width
  canvasElem.height = height

  console.log(width, height)

  loadImages().then((imagesByUrls) => {
    const context = canvasElem.getContext('2d');

    drawMap(context, imagesByUrls)

    const url = canvasElem.toDataURL('image/png')
      .replace(/^data:image\/png/,'data:application/octet-stream')

    download(url, "map.png")
  })

  console.log(minMaxNodeCoordinates.value)
}

async function loadImages() {
  let itemsByUrl = {};
  let imagesByUrls = {}

  iconsItems.value.forEach((item) => {
    if (item.item.iconUrl) {
      if (!itemsByUrl[item.item.iconUrl]) {
        itemsByUrl[item.item.iconUrl] = []
      }
      itemsByUrl[item.item.iconUrl].push(item)
    }
  })
  const promises = Object.keys(itemsByUrl)
    .map((url) => {
      return new Promise((resolve, reject) => {
        const image = new Image()
        image.crossOrigin = "anonymous"
        image.onload = () => {
          imagesByUrls[url] = image
          resolve()
        }
        image.onerror = reject
        image.src = url
      })
    })

  await Promise.all(promises)

  return imagesByUrls
}

function drawMap(context, imagesByUrls) {
  context.save()

  context.translate(
    -(minMaxNodeCoordinates.value.minX - 1) * getOneWidth(),
    -(minMaxNodeCoordinates.value.minY - 1) * getOneHeight()
  )

  const colors = {
    [TYPE_NODE]: "#9da7c9",
    [TYPE_START]: "#a6f3fd",
    [TYPE_TOWER]: "#94440e",
    [TYPE_CHEST]: "#1a660b",
    [TYPE_BLOCKER]: "#867878",
  };

  context.strokeStyle = "#ddd"
  for (const id in nodes.value) {
    const node = nodes.value[id]
    const coordinates = node.coordinates

    if (colors[node.typeId]) {
      context.fillStyle = colors[node.typeId]
    } else {
      context.fillStyle = "#ffff00"
    }
    if (node.statusId == STATUS_NOT_SURE) {
      context.fillStyle = "#ffff00"
    }

    context.beginPath()
    context.moveTo(coordinates[0].x, coordinates[0].y)
    context.lineTo(coordinates[1].x, coordinates[1].y)
    context.lineTo(coordinates[2].x, coordinates[2].y)
    context.lineTo(coordinates[3].x, coordinates[3].y)
    context.lineTo(coordinates[4].x, coordinates[4].y)
    context.lineTo(coordinates[5].x, coordinates[5].y)
    context.closePath()
    context.fill()
    context.stroke()
  }

  context.font = "bold 15px sans-serif"
  context.lineWidth = 2
  for (const i in iconsItems.value) {
    const item = iconsItems.value[i]

    if (item.item.iconUrl) {
      if (imagesByUrls[item.item.iconUrl]) {
        const image = imagesByUrls[item.item.iconUrl]
        context.drawImage(image, item.iconX, item.iconY, item.iconWidth, item.iconHeight)
      } else {
        // todo: not found image
      }
    } else {
      context.fillStyle = "#fff"
      context.fillRect(item.iconX, item.iconY, item.iconWidth, item.iconHeight)
    }

    context.fillStyle = "#000"
    context.fillText(item.humanQuantity, item.textX, item.textY)
  }

  context.restore()
}

function download(url, fileName) {
  const e = new MouseEvent('click', {
    view: window,
    bubbles: false,
    cancelable: true
  });
  const a = document.createElement('a');

  a.download = fileName;
  a.href = url
  a.dispatchEvent(e);
  a.remove()
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
  fill: #a6f3fd;
}
.node-start:hover {
  fill: #d6f7fc;
}
.node-tower {
  fill: #94440e;
  cursor: pointer;
}
.node-tower:hover {
  fill: #b95b1b;
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
.text-2 {
  font-size: 16px;
}
.item-image {
  cursor: pointer;
}
.item-empty-image {
  stroke: #999;
  stroke-width: 2;
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
