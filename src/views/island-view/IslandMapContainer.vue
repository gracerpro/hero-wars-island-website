<script setup lang="ts">
/* global window */
/* global SVGElement */
/* global MouseEvent */
/* global WheelEvent */
/* global KeyboardEvent */

/* eslint-env browser */

import { TYPE_DANGER } from '@/components/toast'
import ToastMessage from '@/components/ToastMessage.vue'
import { type Node, type NodeMap, Status, Type } from '@/api/NodeApi'
import { ref, shallowRef, computed, onMounted, onUnmounted, useTemplateRef, reactive } from 'vue'
import {
  TRANSLATE_X,
  TRANSLATE_Y,
  canSelectNode,
  canSelectNextNode,
  getDeltaScale,
  MAX_SCALE,
} from '@/services/island-map'
import {
  getIconsItems,
  getDrawedNodes,
  SIDE,
  type UserNodeIds,
  type ViewNodeReward,
  type NodeCoordinates,
  type DrawedNode,
  type IconItemsResult,
  type WarningPointsMap,
  type IconItem,
  type RewardQuantity,
  type DrawedNodeMap,
  HEIGHT,
} from './map'
import { useI18n } from 'vue-i18n'
import IslandMapInfoDialog from './IslandMapInfoDialog.vue'
import { GAME_ID_WOOD, type ItemMap } from '@/api/ItemApi'
import type { Image } from '@/api/IslandApi'
import type { ComponentExposed } from 'vue-component-type-helpers'
import ClientOnly from '@/components/ClientOnly.vue'

interface Props {
  scale: number
  translateX: number
  translateY: number
  isShowQuantity: boolean
  rewards: Array<ViewNodeReward>
  nodes: NodeMap
  originRewards: ItemMap
  userNodesIds: UserNodeIds
  userNodesGoingIds: UserNodeIds
  disableNodesIds: UserNodeIds
  isSelectAnyNode?: boolean
  backgroundImage?: Image | null
}

const props = withDefaults(defineProps<Props>(), {
  isSelectAnyNode: true,
  backgroundImage: null,
})
const emit = defineEmits<{
  'change-translate': [x: number | null, y: number | null]
  'change-scale': [value: number]
  'select-node': [nodeId: number]
  'reset-transform': [scale: number]
}>()

const { t } = useI18n()

const BUTTON_MAIN = 0

const isDebug = false

type MouseState = {
  isDown: boolean
  x0: number | null
  y0: number | null
  tx0: number | null
  ty0: number | null
}

interface SvgDrawedNode extends DrawedNode {
  nodeClass: string
  spacePoints: string
}

const mouse: MouseState = {
  isDown: false,
  x0: null,
  y0: null,
  tx0: null,
  ty0: null,
}

const infoDialog = useTemplateRef<ComponentExposed<typeof IslandMapInfoDialog>>('infoDialog')
const infoDialogComponent = shallowRef<typeof IslandMapInfoDialog | null>(null)
const infoDialogDrawedNode = ref<SvgDrawedNode | null>(null)

const svgMapRef = useTemplateRef<SVGElement>('svgMapRef')
const toastRef = useTemplateRef<ComponentExposed<typeof ToastMessage>>('toastRef')

defineExpose({
  svgMapRef,
})

const initTranslate = reactive({
  x: 0,
  y: 0,
})
const viewBox = reactive({
  x: -500,
  y: -500,
  width: 1000,
  height: 1000,
})
const viewBoxValue = computed(() => `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`)

const totalNodes = computed<Map<number, SvgDrawedNode>>(() => {
  const result = new Map<number, SvgDrawedNode>()
  const drawedNodes = getDrawedNodes(props.nodes)

  drawedNodes.forEach((drawedNode, nodeId) => {
    result.set(nodeId, {
      ...drawedNode,
      nodeClass: getNodeClass(drawedNode.node),
      spacePoints: getPoints(drawedNode.coordinates),
    })
  })

  return result
})
const backgroundImageUrl = computed(() => {
  return props.backgroundImage ? props.backgroundImage.url : ''
})

const iconItems = computed<IconItemsResult>(() => {
  return getIconsItems(props.rewards, totalNodes.value)
})
const rewardIcons = computed(() => iconItems.value.icons)
const warningPoints = computed<WarningPointsMap>(() => iconItems.value.warningPoints)
const rewardQuantities = computed<Array<RewardQuantity>>(() => {
  return props.isShowQuantity ? iconItems.value.quantities : []
})

onMounted(() => {
  window.addEventListener('keydown', onKeyDownMap)

  centerNodes(totalNodes.value)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDownMap)
})

function onKeyDownMap(event: KeyboardEvent) {
  if (event.defaultPrevented) {
    return
  }
  if (event.target != svgMapRef.value) {
    return
  }

  if (event.key === 'PageDown' || event.key === '-') {
    emitNewScale(event, -getDeltaScale(props.scale))
    event.preventDefault()
    return
  }
  if (event.key === 'PageUp' || event.key === '+') {
    emitNewScale(event, getDeltaScale(props.scale))
    event.preventDefault()
    return
  }
  if (event.key === 'Home') {
    emitNewScale(event, MAX_SCALE)
    event.preventDefault()
    return
  }
  if (event.key === 'End') {
    emitNewScale(event, -MAX_SCALE)
    event.preventDefault()
    return
  }

  let dx = 0
  let dy = 0

  switch (event.key) {
    case 'ArrowLeft':
      dx = -TRANSLATE_X * 5
      break
    case 'ArrowRight':
      dx = TRANSLATE_X * 5
      break
    case 'ArrowUp':
      dy = -TRANSLATE_Y * 5
      break
    case 'ArrowDown':
      dy = TRANSLATE_Y * 5
      break
    default:
      return
  }

  if (dx != 0 || dy != 0) {
    if (event.ctrlKey) {
      dx /= 10
      dy /= 10
    } else if (event.shiftKey) {
      dx /= 2
      dy /= 2
    }
    emit('change-translate', props.translateX + dx, props.translateY + dy)
    event.preventDefault()
  }
}

function getNodeClass(node: Node): string {
  const classes: { [key: string]: string } = {
    [Type.Node]: 'node-step',
    [Type.Start]: 'node-start',
    [Type.Tower]: 'node-tower',
    [Type.Wood]: 'node-wood',
    [Type.Bubble]: 'node-bubble',
    [Type.Chest]: 'node-chest',
    [Type.Blocker]: 'node-blocker',
    [Type.Banner]: 'node-banner',
  }
  let nodeClass = classes[node.type] ?? ''

  if (node.status == Status.NotSure) {
    nodeClass += ' -warning'
  }
  if (node.costItem.gameId === GAME_ID_WOOD) {
    nodeClass += ' node-cost-wood'
  }

  return nodeClass
}

const cellsBounds = ref<null | {
  minX: number
  maxX: number
  minY: number
  maxY: number
}>(null)

function centerNodes(nodes: DrawedNodeMap) {
  initTranslate.x = 0
  initTranslate.y = 0

  const firstEntry = nodes.entries().next().value
  if (!firstEntry) {
    return
  }
  const firstNode = firstEntry[1]
  let minX = firstNode.x
  let maxX = firstNode.x
  let minY = firstNode.y
  let maxY = firstNode.y

  nodes.forEach((cell) => {
    if (cell.x < minX) {
      minX = cell.x
    }
    if (cell.x > maxX) {
      maxX = cell.x
    }
    if (cell.y < minY) {
      minY = cell.y
    }
    if (cell.y > maxY) {
      maxY = cell.y
    }
  })
  cellsBounds.value = {
    minX: minX - SIDE,
    maxX: maxX + SIDE,
    minY: minY - HEIGHT,
    maxY: maxY + HEIGHT,
  }

  const cellsHeight = cellsBounds.value.maxY - cellsBounds.value.minY
  const cellsHeightEven = cellsHeight % 2 === 0 ? cellsHeight : cellsHeight + 1
  const scaleY = viewBox.height / cellsHeightEven

  emit('reset-transform', scaleY)

  const cellsCenterX = (maxX + minX) / 2
  const cellsCenterY = (maxY + minY) / 2

  initTranslate.x = -cellsCenterX
  initTranslate.y = -cellsCenterY
}

function getPoints(coordinates: NodeCoordinates): string {
  return coordinates.map((item) => item.x + ',' + item.y).join(' ')
}

function onNodeClick(drawedNode: SvgDrawedNode, event: MouseEvent) {
  if (event.ctrlKey) {
    infoDialogDrawedNode.value = drawedNode
    infoDialogComponent.value = IslandMapInfoDialog
  } else {
    selectNode(drawedNode)
  }
}

function onItemClick(nodeId: number, event: MouseEvent) {
  const drawedNode = totalNodes.value.get(nodeId)

  if (drawedNode) {
    if (event.ctrlKey) {
      infoDialogDrawedNode.value = drawedNode
      infoDialogComponent.value = IslandMapInfoDialog
    } else {
      selectNode(drawedNode)
    }
  }
}

function selectNode(drawedNode: SvgDrawedNode) {
  if (!canSelectNode(drawedNode.node)) {
    return
  }
  if (!isUserNode(drawedNode.node)) {
    if (!props.isSelectAnyNode) {
      const message = canSelectNextNode(totalNodes.value, props.userNodesIds, drawedNode)
      if (message) {
        toastRef.value?.show(message, TYPE_DANGER)
        return
      }
    }
  }

  emit('select-node', drawedNode.node.id)
}

function onMouseDown(event: MouseEvent) {
  if (event.button === BUTTON_MAIN) {
    mouse.isDown = true
    mouse.x0 = event.pageX
    mouse.y0 = event.pageY
    mouse.tx0 = props.translateX
    mouse.ty0 = props.translateY
  }
}

function onMouseEnter() {
  mouse.isDown = false
}

function onMouseMove(button: MouseEvent) {
  if (!mouse.isDown) {
    return
  }

  let resultX = null
  let resultY = null

  if (mouse.x0 !== null && mouse.tx0 !== null) {
    const fx = viewBox.width / svgMapRef.value!.clientHeight // YES, clientHeight, not clientWidth
    const dx = button.pageX - mouse.x0
    resultX = mouse.tx0 + (dx * fx) / props.scale
  }
  if (mouse.y0 !== null && mouse.ty0 !== null) {
    const fy = viewBox.height / svgMapRef.value!.clientHeight
    const dy = button.pageY - mouse.y0
    resultY = mouse.ty0 + (dy * fy) / props.scale
  }

  if (resultX !== null || resultY !== null) {
    emit('change-translate', resultX, resultY)
  }
}

function onMouseUp(event: MouseEvent) {
  if (event.button === BUTTON_MAIN) {
    mouse.isDown = false
  }
}

function onMouseWheel(event: WheelEvent) {
  const delta = getDeltaScale(props.scale)
  const value = event.deltaY > 0 ? -delta : delta
  emitNewScale(event, value)
  event.preventDefault()
}

function emitNewScale(event: MouseEvent | KeyboardEvent, delta: number) {
  if (event.ctrlKey) {
    delta /= 10
  } else if (event.shiftKey) {
    delta /= 2
  }

  emit('change-scale', delta)
}

function onMountedInfoDialog() {
  infoDialog.value?.show().finally(() => {
    infoDialogDrawedNode.value = null
    infoDialogComponent.value = null
  })
}

function isUserNode(node: Node): boolean {
  return props.userNodesIds.has(node.id)
}

function getUserNodeClass(drawedNode: SvgDrawedNode): string {
  const nodeId = drawedNode.node.id
  if (props.userNodesIds.has(nodeId)) {
    return props.userNodesGoingIds.has(nodeId) ? 'user-node-going' : 'user-node'
  }
  return ''
}

function getItemTitle(item: IconItem): string {
  let result = item.itemName ?? t('common.noName')

  if (item.quantity > 1) {
    result += ', ' + item.quantity
  }

  return result
}
</script>

<template>
  <div>
    <svg
      ref="svgMapRef"
      height="600"
      class="canvas prevent-select"
      width="100%"
      tabindex="0"
      :viewBox="viewBoxValue"
      :style="{ 'background-image': backgroundImageUrl ? 'url(' + backgroundImageUrl + ')' : '' }"
      xmlns="http://www.w3.org/2000/svg"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
      @mousemove="onMouseMove"
      @mouseenter="onMouseEnter"
      @wheel="onMouseWheel"
      @mousewheel="onMouseWheel"
    >
      <template v-if="isDebug">
        <line
          :x1="viewBox.x"
          :y1="viewBox.y"
          :x2="viewBox.x"
          :y2="viewBox.y + viewBox.height"
          stroke="blue"
        />
        <line
          :x1="viewBox.x"
          :y1="viewBox.y + viewBox.height"
          :x2="viewBox.x + viewBox.width"
          :y2="viewBox.y + viewBox.height"
          stroke="blue"
        />
        <line
          :x1="viewBox.x + viewBox.width"
          :y1="viewBox.y + viewBox.height"
          :x2="viewBox.x + viewBox.width"
          :y2="viewBox.y"
          stroke="blue"
        />
        <line
          :x1="viewBox.x"
          :y1="viewBox.y"
          :x2="viewBox.x + viewBox.width"
          :y2="viewBox.y"
          stroke="blue"
        />
      </template>

      <g
        :transform="
          'scale(' +
          scale +
          ') translate(' +
          (initTranslate.x + translateX) +
          ' ' +
          (initTranslate.y + translateY) +
          ')'
        "
      >
        <template v-if="isDebug && cellsBounds">
          <line
            :x1="cellsBounds.minX"
            :y1="cellsBounds.minY"
            :x2="cellsBounds.minX"
            :y2="cellsBounds.maxY"
            stroke="black"
          />
          <line
            :x1="cellsBounds.minX"
            :y1="cellsBounds.maxY"
            :x2="cellsBounds.maxX"
            :y2="cellsBounds.maxY"
            stroke="black"
          />
          <line
            :x1="cellsBounds.maxX"
            :y1="cellsBounds.maxY"
            :x2="cellsBounds.maxX"
            :y2="cellsBounds.minY"
            stroke="black"
          />
          <line
            :x1="cellsBounds.minX"
            :y1="cellsBounds.minY"
            :x2="cellsBounds.maxX"
            :y2="cellsBounds.minY"
            stroke="black"
          />
        </template>

        <polygon
          v-for="[, node] in totalNodes"
          :key="node.xyId"
          :points="node.spacePoints"
          :class="['node', node.nodeClass, getUserNodeClass(node)]"
          @click="onNodeClick(node, $event)"
        />
        <template
          v-for="item in rewardIcons"
          :key="item.uniqueId"
        >
          <image
            v-if="item.iconUrl"
            :x="item.iconX"
            :y="item.iconY"
            :width="item.iconWidth"
            :height="item.iconHeight"
            :href="item.iconUrl"
            class="item-image"
            @click="onItemClick(item.node.id, $event)"
          >
            <title>{{ getItemTitle(item) }}</title>
          </image>
          <rect
            v-else
            :x="item.iconX"
            :y="item.iconY"
            :width="item.iconWidth"
            :height="item.iconHeight"
            class="item-empty-image"
            :class="item.uniqueId"
            @click="onItemClick(item.node.id, $event)"
          >
            <title>
              {{ getItemTitle(item) }},
              {{ t('page.island.notLinkedImage') }}
            </title>
          </rect>
        </template>
        <circle
          v-for="[nodeId, point] in warningPoints"
          :key="nodeId"
          :cx="point.x"
          :cy="point.y"
          r="10"
          class="warning-point"
          @click="onItemClick(nodeId, $event)"
        >
          <title>{{ t('page.island.unusualStepPrice') }}</title>
        </circle>
        <text
          v-for="item in rewardQuantities"
          :key="item.uid"
          :x="item.x"
          :y="item.y"
          :class="['text', item.isSmallText ? 'text-small' : '']"
          @click="onItemClick(item.nodeId, $event)"
        >
          {{ item.humanQuantity }}
        </text>
      </g>
    </svg>

    <component
      :is="infoDialogComponent"
      v-if="infoDialogDrawedNode"
      ref="infoDialog"
      :drawed-node="infoDialogDrawedNode"
      :origin-rewards="originRewards"
      @vue:mounted="onMountedInfoDialog"
    />

    <client-only>
      <toast-message
        ref="toastRef"
        element-id="mapContainerToast"
      />
    </client-only>
  </div>
</template>

<style>
.node {
  stroke-width: 1;
  stroke: #ddd;
  fill: #9da7c9;
}
.node-step {
  /* TODO: move all colors to config or single place */
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
.node-presents {
  fill: #fa4040;
}
.node-presents:hover {
  fill: #fa7272;
}
.node-banner {
  fill: #0000ff;
}
.node-banner:hover {
  fill: #5959ff;
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
.canvas:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}
.warning-point {
  fill: red;
  stroke-width: 1;
  stroke: #000;
}
</style>
