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
            cross-origin="anonymous"
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
import { Canvg } from "canvg";

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
    nodes[id] = drawNode(node);
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
function drawNode(node) {
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

/**
 * @param {Object} node
 */
function getCoordinates(node) {
  const x = node.mx * (1.5 * SIDE);
  const y = node.my * 2 * HEIGHT + (node.mx % 2 === 0 ? 0 : HEIGHT);

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
  const svgElem = svgMap.value
  const svgContent = getSvgHtml(svgElem)
  const canvasElem = canvas.value //document.createElement('canvas');
  const context = canvasElem.getContext('2d');
  //const canvg = Canvg.fromString(context, svgContent);

  const xCount = Math.abs(minMaxNodeCoordinates.value.maxX - minMaxNodeCoordinates.value.minX)
  const yCount = Math.abs(minMaxNodeCoordinates.value.maxY - minMaxNodeCoordinates.value.minY)
  console.log(xCount, yCount)

  //const domRect = svgElem.getBBox();
  const width = xCount * 1.5 * SIDE
  const height = yCount * 2 * HEIGHT
  canvasElem.width = xCount * 1.5 * SIDE + 10 + 10
  canvasElem.height = yCount * 2 * HEIGHT + 10 + 10 + 10 + 10

  //console.log(canvasElem.width, canvasElem.height)

  context.beginPath()
  context.rect(10, 20, width, height)
  context.stroke()

  context.translate(-minMaxNodeCoordinates.value.minX, -minMaxNodeCoordinates.value.minY)

  for (const id in nodes.value) {
    const node = nodes.value[id]

    context.beginPath()
    context.moveTo(node.coordinates[0].x, node.coordinates[0].y)
    context.lineTo(node.coordinates[1].x, node.coordinates[1].y)
    context.lineTo(node.coordinates[2].x, node.coordinates[2].y)
    context.lineTo(node.coordinates[3].x, node.coordinates[3].y)
    context.lineTo(node.coordinates[4].x, node.coordinates[4].y)
    context.lineTo(node.coordinates[5].x, node.coordinates[5].y)
    context.fill()
  }

  console.log(minMaxNodeCoordinates.value)

/*  canvg.render().then(() => {
    console.log("canvg rendered!")

    let itemsByUrl = {};
    iconsItems.value.forEach((item) => {
      if (item.item.iconUrl) {
        if (!itemsByUrl[item.item.iconUrl]) {
          itemsByUrl[item.item.iconUrl] = []
        }
        itemsByUrl[item.item.iconUrl].push(item)
      }
    })
    const imageUrls = Object.keys(itemsByUrl)
    console.log(imageUrls, itemsByUrl)

    for (const url in itemsByUrl) {
      console.log(url, itemsByUrl[url].length)
    }

    /* :x="item.iconX"
            :y="item.iconY"
            :width="item.iconWidth"
            :height="item.iconHeight"
    */
    /*
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => {
      console.log(image.width, image.height)
      context.drawImage(image, 0, 0, image.width, image.height)

      const url = canvasElem.toDataURL('image/png')
      .replace(/^data:image\/png/,'data:application/octet-stream')

      download(url, "map.png");
    }
    image.onerror = (e) => {
      console.log("error", e)
    }
    image.src = "http://backend-hero-wars.vyacheslaff.local:8080/common-uploads/hero/item-icons/bc439b_kamen-oblika-lovkost-78x77.png"

    // TODO: Uncaught (in promise) DOMException: The operation is insecure.
    // 1. render without images
    // 2. add images
  })
  .finally(() => {
   // canvasElem.remove()
  })
  */
}

function getSvgHtml(svgElem) {
  const svgData = svgElem.innerHTML
  const svgAttributes = `width="${svgElem.clientWidth}" height="${svgElem.clientHeight}" viewBox="${viewBox.value}" version="1.1" xmlns="http://www.w3.org/2000/svg"`
  const svgStyle = "<style>" + getStyleContent() + "</style>"

  console.log(svgAttributes)

  return `<svg ${svgAttributes}>${svgStyle} ${svgData}</svg>`
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

// TODO: use v-bind, see "begin SVG styles" in css
function getStyleContent() {
  return `
  .node-start {
    fill: #a6f3fd;
  }
  .node-step {
    fill: #9da7c9;
    stroke: #dddddd;
  }
  .node-tower {
    fill: #94440e;
  }
  .node-chest {
    fill: #1a660b;
  }
  .node-blocker {
    fill: #867878;
  }
  .-warning {
    fill: yellow;
  }
  .node.user-node {
    fill: #6668f8;
  }
  .node.user-node-going {
    fill: #f86696;
  }
  .text {
    font-size: 20px;
    fill: #000;
    font-weight: bold;
  }
  .text-2 {
    font-size: 16px;
  }
  .item-empty-image {
    stroke: #999;
    stroke-width: 2;
    fill: #fff;
  }`
}

</script>
<style>
.node {
  stroke-width: 1;
}
.node-step {
  cursor: pointer;
}
.node-step:hover {
  fill: #bcc5e6;
}
.node-start:hover {
  fill: #d6f7fc;
}
.node-tower {
  cursor: pointer;
}
.node-tower:hover {
  fill: #b95b1b;
}
.node-chest {
  cursor: pointer;
}
.node-chest:hover {
  fill: #566d51;
}
.node-blocker:hover {
  fill: #9c8e8e;
}
.text {
  cursor: pointer;
}
.item-image {
  cursor: pointer;
}
.item-empty-image {
  cursor: pointer;
}
</style>
<!-- begin SVG styles -->
<style>
.node-start {
  fill: #a6f3fd;
}
.node-step {
  fill: #9da7c9;
  stroke: #dddddd;
}
.node-tower {
  fill: #94440e;
}
.node-chest {
  fill: #1a660b;
}
.node-blocker {
  fill: #867878;
}
.-warning {
  fill: yellow;
}
.node.user-node {
  fill: #6668f8;
}
.node.user-node-going {
  fill: #f86696;
}
.text {
  font-size: 20px;
  fill: #000;
  font-weight: bold;
}
.text-2 {
  font-size: 16px;
}
.item-empty-image {
  stroke: #999;
  stroke-width: 2;
  fill: #fff;
}
</style>
<!-- end SVG styles -->
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
