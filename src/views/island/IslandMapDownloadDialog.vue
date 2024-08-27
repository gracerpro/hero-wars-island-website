<template>
  <suspense>
    <modal-dialog
      element-id="island-map-download-dialog"
      :form-id="formId"
      :header="t('common.download')"
      :saving="loading"
      :submit-button-text="t('common.download')"
      ref="dialog"
      @vue:mounted="onMountedDialog"
    >
      <p>Скачать карту в формате PNG</p>

      <form @submit.prevent="downloadAsPng" :id="formId"></form>
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
import { getDrawedNodes, getIconsItems, getOneHeight, getOneWidth } from "./map";
import { STATUS_NOT_SURE, TYPE_BLOCKER, TYPE_CHEST, TYPE_NODE, TYPE_START, TYPE_TOWER } from "@/api/Node";

const { t } = useI18n();

const formId = "download-map-form"

const dialog = ref(null);

const { show, onMountedDialog } = useShow(dialog);

const props = defineProps({
  nodes: { type: Object, required: true },
  rewards: { type: Array, required: true },
  isShowQuantity: { type: Boolean, required: true },
})

const loading = ref(false)

const drawedNodes = computed(() => getDrawedNodes(props.nodes))
const iconModifyRewards = computed(() => getIconsItems(props.rewards, drawedNodes.value, props.isShowQuantity))
const minMaxNodeCoordinates = computed(() => {
  let minX = null;
  let minY = null;
  let maxX = null;
  let maxY = null;

  for (const id in props.nodes) {
    const node = props.nodes[id]
    minX = node.mx
    maxX = node.mx
    minY = node.my
    maxY = node.my
    break;
  }

  for (const id in props.nodes) {
    const node = props.nodes[id];
    
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

async function downloadAsPng() {
  loading.value = true

  const canvasElem = document.createElement("canvas");
  const xCount = Math.abs(minMaxNodeCoordinates.value.maxX - minMaxNodeCoordinates.value.minX) + 1 + 1
  const yCount = Math.abs(minMaxNodeCoordinates.value.maxY - minMaxNodeCoordinates.value.minY) + 1 + 1

  // TODO: max size!
  canvasElem.width = xCount * getOneWidth()
  canvasElem.height = (yCount + 0.5) * getOneHeight()

  const imagesByUrls = await loadImages()
  const context = canvasElem.getContext('2d');

  drawMap(context, imagesByUrls)

  const url = canvasElem.toDataURL('image/png')
    .replace(/^data:image\/png/,'data:application/octet-stream')

  download(url, "map.png")

  canvasElem.remove()
  loading.value = false

  dialog.value.hide()
}

async function loadImages() {
  let urlMap = {};
  let imagesByUrls = {}

  iconModifyRewards.value.forEach((modifyReward) => {
    const reward = modifyReward.item

    if (reward.iconUrl) {
      if (!urlMap[reward.iconUrl]) {
        urlMap[reward.iconUrl] = true
      }
    }
  })
  const promises = Object.keys(urlMap)
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

  const FONT_SIZE = 16
  const FONT_SIZE_SMALL = 13
  const colors = {
    [TYPE_NODE]: "#9da7c9",
    [TYPE_START]: "#a6f3fd",
    [TYPE_TOWER]: "#94440e",
    [TYPE_CHEST]: "#1a660b",
    [TYPE_BLOCKER]: "#867878",
  };

  context.strokeStyle = "#ddd"
  for (const id in drawedNodes.value) {
    const drawedNode = drawedNodes.value[id]
    const coordinates = drawedNode.coordinates
    const node = drawedNode.node

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

  context.lineWidth = 1
  iconModifyRewards.value.forEach((modifyReward) => {
    const item = modifyReward.item

    if (item.iconUrl) {
      if (imagesByUrls[item.iconUrl]) {
        const image = imagesByUrls[item.iconUrl]
        context.drawImage(image, modifyReward.iconX, modifyReward.iconY, modifyReward.iconWidth, modifyReward.iconHeight)
      } else {
        drawEmptyImage(context, modifyReward)
        context.fillStyle = "#000"
        context.fillText("?", modifyReward.iconX + modifyReward.iconWidth / 2, modifyReward.iconY + modifyReward.iconHeight / 2)
      }
    } else {
      drawEmptyImage(context, modifyReward)
    }

    if (modifyReward.textX && modifyReward.textY) {
      const fontSize = modifyReward.isSmallText ? FONT_SIZE_SMALL : FONT_SIZE
      context.font = `bold ${fontSize}px sans-serif`
      context.fillStyle = "#000"
      context.fillText(modifyReward.humanQuantity, modifyReward.textX, modifyReward.textY)
    }
  })

  context.restore()
}

function drawEmptyImage(context, item) {
  context.fillStyle = "#fff"
  context.beginPath()
  context.rect(item.iconX, item.iconY, item.iconWidth, item.iconHeight)
  context.fill()
  context.stroke()
}

defineExpose({
  show,
});
</script>
