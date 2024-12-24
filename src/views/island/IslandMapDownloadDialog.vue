<template>
  <suspense>
    <modal-dialog
      ref="dialogRef"
      element-id="island-map-download-dialog"
      :form-id="formId"
      :header="t('common.download')"
      :saving="loading"
      :submit-button-text="t('common.download')"
      @vue:mounted="onMountedDialog"
    >
      <p>{{ t("page.island.downloadMapInFormat", { format: "PNG" }) }}</p>

      <div>
        {{
          t("page.island.downloadVerticalAndHorizontalCount", {
            verticalCount: verticalCellsCount,
            horizontalCount: horizontalCellsCount,
          })
        }}
      </div>
      <div>{{ t("page.island.downloadMapSize", { mapSize: mapSize }) }}</div>

      <form
        :id="formId"
        @submit.prevent="downloadAsPng"
      ></form>
    </modal-dialog>
  </suspense>
</template>
<script setup>
import ModalDialog from "@/components/ModalDialog.vue";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useShow } from "@/components/modal-dialog";
import { download } from "@/helpers/download";
import { computed } from "vue";
import { getDrawedNodes, getIconsItems, getVerticalStep, getHorizontalStep } from "./map";
import {
  STATUS_NOT_SURE,
  TYPE_BLOCKER,
  TYPE_BUBBLE,
  TYPE_CHEST,
  TYPE_NODE,
  TYPE_START,
  TYPE_TOWER,
  TYPE_WOOD,
} from "@/api/Node";

const { t } = useI18n();

const formId = "download-map-form";

const dialogRef = ref(null);

const { show, onMountedDialog } = useShow(dialogRef);

const props = defineProps({
  island: { type: Object, required: true },
  nodes: { type: Object, required: true },
  rewards: { type: Array, required: true },
  isShowQuantity: { type: Boolean, required: true },
});

const loading = ref(false);

const drawedNodes = computed(() => getDrawedNodes(props.nodes));
const iconItems = computed(() => getIconsItems(props.rewards, drawedNodes.value, props.isShowQuantity))
const iconModifyRewards = computed(() => iconItems.value.icons)
const rewardQuantities = computed(() => {
  return props.isShowQuantity ? iconItems.value.quantities : [];
})

const minMaxNodeCoordinates = computed(() => {
  let minX = null;
  let minY = null;
  let maxX = null;
  let maxY = null;

  for (const id in props.nodes) {
    const node = props.nodes[id];
    minX = node.mx;
    maxX = node.mx;
    minY = node.my;
    maxY = node.my;
    break;
  }

  for (const id in props.nodes) {
    const node = props.nodes[id];

    if (node.mx > maxX) {
      maxX = node.mx;
    }
    if (node.mx < minX) {
      minX = node.mx;
    }
    if (node.my < minY) {
      minY = node.my;
    }
    if (node.my > maxY) {
      maxY = node.my;
    }
  }

  return {
    minX,
    maxX,
    minY,
    maxY,
  };
});
const horizontalCellsCount = computed(() => {
  // +1 for center cell
  return minMaxNodeCoordinates.value.maxX - minMaxNodeCoordinates.value.minX + 1;
});
const verticalCellsCount = computed(() => {
  // +1 for center cell
  return minMaxNodeCoordinates.value.maxY - minMaxNodeCoordinates.value.minY + 1;
});
const canvasWidth = computed(() => {
  return horizontalCellsCount.value * getHorizontalStep() + 1 * getHorizontalStep();
});
const canvasHeight = computed(() => {
  return verticalCellsCount.value * getVerticalStep() + (1 + 0.5) * getVerticalStep();
});
const mapSize = computed(() => {
  return canvasWidth.value + "x" + canvasHeight.value;
});

async function downloadAsPng() {
  loading.value = true;

  const imagesByUrls = await loadImages();

  const canvasElem = document.createElement("canvas");

  try {
    canvasElem.width = canvasWidth.value;
    canvasElem.height = canvasHeight.value;

    const context = canvasElem.getContext("2d");

    drawMap(context, imagesByUrls);

    const url = canvasElem
      .toDataURL("image/png")
      .replace(/^data:image\/png/, "data:application/octet-stream");

    download(url, t("common.map") + " " + props.island.name + ".png");
  } finally {
    canvasElem.remove();
    loading.value = false;
  }

  dialogRef.value.hide();
}

async function loadImages() {
  let urlMap = {};
  let imagesByUrls = {};

  iconModifyRewards.value.forEach((modifyReward) => {
    const reward = modifyReward.item;

    if (reward.iconUrl) {
      if (!urlMap[reward.iconUrl]) {
        urlMap[reward.iconUrl] = true;
      }
    }
  });

  const promises = Object.keys(urlMap).map((url) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        imagesByUrls[url] = image;
        resolve();
      };
      image.onerror = () => {
        reject(new Error("Could not load an image."));
      };
      image.src = url;
    });
  });

  try {
    await Promise.all(promises);
  } catch (error) {
    console.error(error);
  }

  return imagesByUrls;
}

function drawMap(context, imagesByUrls) {
  context.save();

  context.translate(
    -(minMaxNodeCoordinates.value.minX - 1) * getHorizontalStep(),
    -(minMaxNodeCoordinates.value.minY - 1) * getVerticalStep()
  );

  const FONT_SIZE = 20;
  const FONT_SIZE_SMALL = 15;
  const colors = {
    [TYPE_NODE]: "#9da7c9",
    [TYPE_START]: "#94fdfe",
    [TYPE_TOWER]: "#ba662c",
    [TYPE_WOOD]: "#773e23",
    [TYPE_BUBBLE]: "#deb28d",
    [TYPE_CHEST]: "#1a660b",
    [TYPE_BLOCKER]: "#867878",
  };

  context.strokeStyle = "#ddd";
  for (const id in drawedNodes.value) {
    const drawedNode = drawedNodes.value[id];
    const coordinates = drawedNode.coordinates;
    const node = drawedNode.node;

    if (colors[node.typeId]) {
      context.fillStyle = colors[node.typeId];
    } else {
      context.fillStyle = "#ffff00";
    }
    if (node.statusId == STATUS_NOT_SURE) {
      context.fillStyle = "#ffff00";
    }

    context.beginPath();
    context.moveTo(coordinates[0].x, coordinates[0].y);
    context.lineTo(coordinates[1].x, coordinates[1].y);
    context.lineTo(coordinates[2].x, coordinates[2].y);
    context.lineTo(coordinates[3].x, coordinates[3].y);
    context.lineTo(coordinates[4].x, coordinates[4].y);
    context.lineTo(coordinates[5].x, coordinates[5].y);
    context.closePath();
    context.fill();
    context.stroke();
  }

  context.lineWidth = 1;
  iconModifyRewards.value.forEach((modifyReward) => {
    const item = modifyReward.item;

    if (item.iconUrl) {
      if (imagesByUrls[item.iconUrl]) {
        const image = imagesByUrls[item.iconUrl];
        context.drawImage(
          image,
          modifyReward.iconX,
          modifyReward.iconY,
          modifyReward.iconWidth,
          modifyReward.iconHeight
        );
      } else {
        drawEmptyImage(context, modifyReward);
        context.fillStyle = "#000";
        context.fillText(
          "?",
          modifyReward.iconX + modifyReward.iconWidth / 2,
          modifyReward.iconY + modifyReward.iconHeight / 2
        );
      }
    } else {
      drawEmptyImage(context, modifyReward);
    }
  });

  rewardQuantities.value.forEach((item) => {
    const fontSize = item.isSmallText ? FONT_SIZE_SMALL : FONT_SIZE;
    context.font = `bold ${fontSize}px sans-serif`;
    context.fillStyle = "#000";
    context.fillText(item.humanQuantity, item.x, item.y);
  });

  context.restore();
}

function drawEmptyImage(context, item) {
  context.fillStyle = "#fff";
  context.beginPath();
  context.rect(item.iconX, item.iconY, item.iconWidth, item.iconHeight);
  context.fill();
  context.stroke();
}

defineExpose({
  show,
});
</script>
