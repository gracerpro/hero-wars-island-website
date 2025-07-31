<script setup lang="ts">
/* global document */
/* global console */
/* global HTMLImageElement */
/* global Image */
/* global CanvasRenderingContext2D */

import ModalDialog from "@/components/ModalDialog.vue";
import { ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { useShow } from "@/components/modal-dialog";
import { download } from "@/helpers/download";
import { computed } from "vue";
import { getDrawedNodes, getIconsItems, getVerticalStep, getHorizontalStep, type ViewNodeReward, type IconItem } from "./map";
import {
  STATUS_NOT_SURE,
  TYPE_BLOCKER,
  TYPE_BUBBLE,
  TYPE_CHEST,
  TYPE_NODE,
  TYPE_START,
  TYPE_TOWER,
  TYPE_WOOD,
  type Node,
  type NodeMap,
} from "@/api/NodeApi";
import type { Island } from "@/api/IslandApi";
import type { ComponentExposed } from "vue-component-type-helpers";

interface Props {
  island: Island,
  nodes: NodeMap,
  rewards: Array<ViewNodeReward>,
  isShowQuantity: boolean,
}

type MinMaxNodeCoordinates = {
  minX: number | null,
  maxX: number | null,
  minY: number | null,
  maxY: number | null,
}

type ImagesByUrls = { [key: string]: HTMLImageElement }

const props = defineProps<Props>();

const { t } = useI18n();

const formId = "download-map-form";

const dialogRef = useTemplateRef<ComponentExposed<typeof ModalDialog>>("dialogRef");

const { show, onMountedDialog } = useShow(dialogRef)

const loading = ref(false);

const drawedNodes = computed(() => getDrawedNodes(props.nodes));
const iconItemsResult = computed(() =>
  getIconsItems(props.rewards, drawedNodes.value)
);
const iconItems = computed(() => iconItemsResult.value.icons);
const rewardQuantities = computed(() => {
  return props.isShowQuantity ? iconItemsResult.value.quantities : [];
});

const minMaxNodeCoordinates = computed<MinMaxNodeCoordinates>(() => {
  let minX: number | null = null;
  let minY: number | null = null;
  let maxX: number | null = null;
  let maxY: number | null = null;

  if (props.nodes.size > 0) {
    const node = props.nodes.values().next().value as Node
    minX = node.mx;
    maxX = node.mx;
    minY = node.my;
    maxY = node.my;
  }

  props.nodes.forEach((node) => {
    if (node.mx > (maxX as number)) {
      maxX = node.mx;
    }
    if (node.mx < (minX as number)) {
      minX = node.mx;
    }
    if (node.my < (minY as number)) {
      minY = node.my;
    }
    if (node.my > (maxY as number)) {
      maxY = node.my;
    }
  })

  return {
    minX,
    maxX,
    minY,
    maxY,
  };
});
const horizontalCellsCount = computed(() => {
  if (minMaxNodeCoordinates.value.maxX !== null && minMaxNodeCoordinates.value.minX !== null) {
    // +1 for center cell
    return minMaxNodeCoordinates.value.maxX - minMaxNodeCoordinates.value.minX + 1;
  }
  return 0
});
const verticalCellsCount = computed(() => {
  if (minMaxNodeCoordinates.value.maxY !== null && minMaxNodeCoordinates.value.minY !== null) {
    // +1 for center cell
    return minMaxNodeCoordinates.value.maxY - minMaxNodeCoordinates.value.minY + 1;
  }
  return 0
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

    if (context === null) {
      throw new Error("Create 2D context is null.")
    }

    drawMap(context, imagesByUrls);

    const url = canvasElem
      .toDataURL("image/png")
      .replace(/^data:image\/png/, "data:application/octet-stream");

    download(url, t("common.map") + " " + props.island.name + ".png");
  } finally {
    canvasElem.remove();
    loading.value = false;
  }

  dialogRef.value?.hide();
}

async function loadImages(): Promise<ImagesByUrls> {
  let urlMap: { [key: string]: boolean } = {};
  let imagesByUrls: ImagesByUrls = {};

  iconItems.value.forEach((iconItem) => {
    if (iconItem.iconUrl) {
      if (!urlMap[iconItem.iconUrl]) {
        urlMap[iconItem.iconUrl] = true;
      }
    }
  });

  const promises = Object.keys(urlMap).map((url) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        imagesByUrls[url] = image;
        resolve(true);
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
    console.error(error); // TODO: log it
  }

  return imagesByUrls;
}

function drawMap(context: CanvasRenderingContext2D, imagesByUrls: ImagesByUrls) {
  context.save();

  if (minMaxNodeCoordinates.value.minX !== null && minMaxNodeCoordinates.value.minY !== null) {
    context.translate(
      -(minMaxNodeCoordinates.value.minX - 1) * getHorizontalStep(),
      -(minMaxNodeCoordinates.value.minY - 1) * getVerticalStep()
    );
  }

  const FONT_SIZE = 20;
  const FONT_SIZE_SMALL = 15;
  const colors: { [key: string]: string } = {
    [TYPE_NODE]: "#9da7c9",
    [TYPE_START]: "#94fdfe",
    [TYPE_TOWER]: "#ba662c",
    [TYPE_WOOD]: "#773e23",
    [TYPE_BUBBLE]: "#deb28d",
    [TYPE_CHEST]: "#1a660b",
    [TYPE_BLOCKER]: "#867878",
  };

  context.strokeStyle = "#ddd";
  drawedNodes.value.forEach((drawedNode) => {
    const coordinates = drawedNode.coordinates;
    const node = drawedNode.node;

    context.fillStyle = colors[node.type] ?? "#ffff00";

    if (node.status == STATUS_NOT_SURE) {
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
  })

  context.lineWidth = 1;
  iconItems.value.forEach((iconItem) => {
    if (iconItem.iconUrl) {
      if (imagesByUrls[iconItem.iconUrl]) {
        const image = imagesByUrls[iconItem.iconUrl];
        context.drawImage(
          image,
          iconItem.iconX,
          iconItem.iconY,
          iconItem.iconWidth,
          iconItem.iconHeight
        );
      } else {
        drawEmptyImage(context, iconItem);
        context.fillStyle = "#000";
        context.fillText(
          "?",
          iconItem.iconX + iconItem.iconWidth / 2,
          iconItem.iconY + iconItem.iconHeight / 2
        );
      }
    } else {
      drawEmptyImage(context, iconItem);
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

function drawEmptyImage(context: CanvasRenderingContext2D, item: IconItem) {
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
