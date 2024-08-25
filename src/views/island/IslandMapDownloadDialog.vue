<template>
  <suspense>
    <modal-dialog
      element-id="island-map-download-dialog"
      :form-id="formId"
      :header="t('common.download')"
      ref="dialog"
      @vue:mounted="onMountedDialog"
    >
      <p>Скачать карту в формате PNG</p>

      <form @submit.prevent="downloadAsPng" :id="formId">
        
      </form>
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

const { t } = useI18n();

const dialog = ref(null);

const { show, onMountedDialog } = useShow(dialog);

const formId = "download-map-form"

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

function downloadAsPng() {
  const canvasElem = document.createElement("canvas");
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

    console.log("before download")
    download(url, "map.png")
    console.log("after download")
  })
  .finally(() => canvasElem.remove())

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

  context.lineWidth = 1
  for (const i in iconsItems.value) {
    const item = iconsItems.value[i]

    if (item.item.iconUrl) {
      if (imagesByUrls[item.item.iconUrl]) {
        const image = imagesByUrls[item.item.iconUrl]
        context.drawImage(image, item.iconX, item.iconY, item.iconWidth, item.iconHeight)
      } else {
        drawEmptyImage(context, item)
        context.fillStyle = "#000"
        context.fillText("?", item.iconX + item.iconWidth / 2, item.iconY + item.iconHeight / 2)
      }
    } else {
      drawEmptyImage(context, item)
    }

    if (item.textX && item.textY) {
      const fontSize = item.isSmallText ? FONT_SIZE_SMALL : FONT_SIZE
      context.font = `bold ${fontSize}px sans-serif`
      context.fillStyle = "#000"
      context.fillText(item.humanQuantity, item.textX, item.textY)
    }
  }

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
