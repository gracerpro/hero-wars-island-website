import type { Item } from '@/api/ItemApi'
import { isCommonStep, type Node, type NodeMap } from '@/api/NodeApi'

export const SIDE = 50
const HALF_SIDE = SIDE / 2
export const HEIGHT = 34
const IMAGE_SIDE = 24

export type UserNodeIds = Set<number>

export interface ViewReward {
  readonly uniqueId: string
  readonly item: Item
  quantity: number
  humanQuantity: string
}

export interface ViewNodeReward extends ViewReward {
  readonly node: Node
}

export interface Coordinate {
  x: number
  y: number
}

export interface RewardQuantity {
  nodeId: number
  isSmallText: boolean
  humanQuantity: string
  x: number
  y: number
  uid: string
}

export type NodeCoordinates = [
  Coordinate,
  Coordinate,
  Coordinate,
  Coordinate,
  Coordinate,
  Coordinate,
]

type CountsByNode = { [key: number]: number }
type IndexesByNode = { [key: number]: number }

export interface DrawedNode {
  node: Node
  x: number
  y: number
  xyId: string
  coordinates: NodeCoordinates
}
export type DrawedNodeMap = Map<number, DrawedNode>

export const SELECT_MODE_PLAN = 'plan'
export const SELECT_MODE_GOING = 'going'
export const SELECT_MODE_DISABLE = 'disable'

export type SelectMode = 'plan' | 'going' | 'disable'

export interface IconItem {
  iconX: number
  iconY: number
  iconWidth: number
  iconHeight: number
  node: Node
  uniqueId: string
  iconUrl: string | null
  itemName: string
  quantity: number
}

export interface WarningPoint {
  x: number
  y: number
}
export type WarningPointsMap = Map<number, WarningPoint>

export type IconItemsResult = {
  icons: Array<IconItem>
  quantities: Array<RewardQuantity>
  warningPoints: WarningPointsMap
}

export function getDrawedNodes(nodes: NodeMap): DrawedNodeMap {
  const drawedNodes = new Map<number, DrawedNode>()

  nodes.forEach((node) => {
    drawedNodes.set(node.id, getDrawedNode(node))
  })

  return drawedNodes
}

export function getIconsItems(
  nodeRewards: Array<ViewNodeReward>,
  drawedNodes: DrawedNodeMap
): IconItemsResult {
  const countsByNode = getCountsByNode(nodeRewards)
  const indexesByNode: IndexesByNode = {}
  const rewardQuantities: Array<RewardQuantity> = []
  const warningPoints: WarningPointsMap = new Map<number, WarningPoint>()
  const resultItems: Array<IconItem> = []

  nodeRewards.forEach((nodeReward) => {
    const nodeId = nodeReward.node.id
    const drawedNode = drawedNodes.get(nodeId) as DrawedNode
    const count = countsByNode[nodeId]
    const isShowText = nodeReward.quantity > 1

    let rewardQuantity: RewardQuantity | null = null

    let item: IconItem | null = null

    if (count === 1) {
      const iconWidth = IMAGE_SIDE * 2.2
      const iconHeight = IMAGE_SIDE * 2.2
      item = {
        node: nodeReward.node,
        uniqueId: nodeReward.uniqueId,
        iconUrl: nodeReward.item.iconUrl,
        itemName: nodeReward.item.name,
        quantity: nodeReward.quantity,
        iconWidth,
        iconHeight,
        iconX: drawedNode.x - iconWidth / 2,
        iconY: drawedNode.y - iconHeight / 2,
      }

      if (isShowText) {
        rewardQuantity = {
          nodeId,
          isSmallText: false,
          humanQuantity: nodeReward.humanQuantity,
          x: item!.iconX + item!.iconWidth * 0.02,
          y: drawedNode.y + HEIGHT - 3,
          uid: nodeId + '_0',
        }
      }
    } else {
      if (!indexesByNode[nodeId]) {
        indexesByNode[nodeId] = 0
      }
      const index = indexesByNode[nodeId]
      const borderWidth = 2

      if (count === 2) {
        const iconWidth = IMAGE_SIDE * 1.4
        const iconHeight = IMAGE_SIDE * 1.4
        const cx = iconWidth + borderWidth
        const srartX = drawedNode.x - cx + borderWidth / 2

        item = {
          node: nodeReward.node,
          uniqueId: nodeReward.uniqueId,
          iconUrl: nodeReward.item.iconUrl,
          itemName: nodeReward.item.name,
          quantity: nodeReward.quantity,
          iconWidth,
          iconHeight,
          iconX: srartX + cx * index,
          iconY: drawedNode.y - iconHeight / 2,
        }

        if (isShowText) {
          const fontSize = 16

          rewardQuantity = {
            nodeId,
            isSmallText: true,
            humanQuantity: nodeReward.humanQuantity,
            x: srartX + cx * index,
            y: drawedNode.y + HEIGHT - fontSize * 0.7,
            uid: nodeId + '_' + index,
          }
        }
      } else if (index <= 3) {
        // 0,0   1,0
        //     *
        // 0,1   1,1
        const iconWidth = IMAGE_SIDE * 1.1
        const iconHeight = IMAGE_SIDE * 1.1
        const cx = iconWidth + borderWidth
        const srartX = drawedNode.x - cx + borderWidth / 2
        const cy = iconHeight + borderWidth
        const srartY = drawedNode.y - cy + borderWidth / 2

        item = {
          node: nodeReward.node,
          uniqueId: nodeReward.uniqueId,
          iconUrl: nodeReward.item.iconUrl,
          itemName: nodeReward.item.name,
          quantity: nodeReward.quantity,
          iconWidth,
          iconHeight,
          iconX: srartX + (index % 2 === 0 ? 0 : cx),
          iconY: srartY + (index < 2 ? 0 : cy),
        }
      } else {
        item = null
        rewardQuantity = null
      }

      indexesByNode[nodeId]++
    }

    if (item) {
      resultItems.push(item)

      if (!isCommonStep(item.node.costItem)) {
        warningPoints.set(nodeId, {
          x: drawedNode.x + SIDE * 0.7,
          y: drawedNode.y,
        })
      }
    }
    if (isShowText && rewardQuantity) {
      rewardQuantities.push(rewardQuantity)
    }
  })

  return {
    icons: resultItems,
    quantities: rewardQuantities,
    warningPoints,
  }
}

function getCountsByNode(nodeRewards: Array<ViewNodeReward>): CountsByNode {
  const result: CountsByNode = {}

  nodeRewards.forEach((nodeReward) => {
    const nodeId = nodeReward.node.id

    if (!result[nodeId]) {
      result[nodeId] = 0
    }
    result[nodeId]++
  })

  return result
}

function getDrawedNode(node: Node): DrawedNode {
  const x = node.mx * getHorizontalStep()
  const y = node.my * getVerticalStep() + (node.mx % 2 === 0 ? 0 : getVerticalStep() / 2)

  return {
    node,
    xyId: node.mx + '_' + node.my,
    x,
    y,
    coordinates: getCoordinates(x, y),
  }
}

export function getHorizontalStep(): number {
  return SIDE + HALF_SIDE
}

export function getVerticalStep(): number {
  return 2 * HEIGHT
}

function getCoordinates(x: number, y: number): NodeCoordinates {
  const coordinates = new Array<Coordinate>(6)
  coordinates[0] = { x: x + SIDE, y }
  coordinates[1] = { x: x + HALF_SIDE, y: y + HEIGHT }
  coordinates[2] = { x: x - HALF_SIDE, y: y + HEIGHT }
  coordinates[3] = { x: x - SIDE, y }
  coordinates[4] = { x: x - HALF_SIDE, y: y - HEIGHT }
  coordinates[5] = { x: x + HALF_SIDE, y: y - HEIGHT }

  return coordinates as NodeCoordinates
}
