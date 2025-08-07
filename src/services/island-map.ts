import { TYPE_BLOCKER, TYPE_START, type Node } from '@/api/NodeApi'
import { useI18n } from '@/i18n'
import type { DrawedNode, DrawedNodeMap, UserNodeIds } from '@/views/island/map'

export const TRANSLATE_X = 20
export const TRANSLATE_Y = 20
export const EVENT_CHANGE_TRANSLATE = 'change-translate'

export const DELTA_SCALE = 0.5
export const EVENT_CHANGE_SCALE = 'change-scale'

export function canSelectNode(node: Node): boolean {
  return node.type !== TYPE_START && node.type != TYPE_BLOCKER
}

export function canSelectNextNode(
  drawedNodes: DrawedNodeMap,
  userNodesIds: UserNodeIds,
  nextDrawedNode: DrawedNode
): string | null {
  const { t } = useI18n()
  let result = null

  if (nextDrawedNode.node.type === TYPE_START) {
    return t('page.island.canNotSelectStartNode')
  }

  // if no link to selected or started node
  // then cancel

  if (userNodesIds.size === 0) {
    let isFound = false
    let isNearStart = false

    for (const drawedNode of drawedNodes.values()) {
      if (drawedNode.node.type === TYPE_START) {
        isFound = true

        if (isNearNode(nextDrawedNode, drawedNode)) {
          isNearStart = true
          break
        }
      }
    }
    if (!isFound) {
      result = t('page.island.notFoundStartNodeAdmin')
    } else if (!isNearStart) {
      result = t('page.island.canSelectNearStart')
    }
  } else {
    let isFound = false
    for (const drawedNode of drawedNodes.values()) {
      if (nextDrawedNode.xyId === drawedNode.xyId) {
        continue
      }
      if (isNearNode(nextDrawedNode, drawedNode)) {
        if (drawedNode.node.type === TYPE_START) {
          isFound = true
          break
        }
        if (userNodesIds.has(drawedNode.node.id)) {
          isFound = true
          break
        }
      }
    }
    if (!isFound) {
      result = t('page.island.canSelectOnlySelect')
    }
  }

  return result
}

function isNearNode(nextDrawedNode: DrawedNode, drawedNode: DrawedNode): boolean {
  const dy = nextDrawedNode.node.my - drawedNode.node.my

  if (nextDrawedNode.node.mx == drawedNode.node.mx) {
    return dy >= -1 && dy <= 1
  }

  const dx = nextDrawedNode.node.mx - drawedNode.node.mx

  if (dx < -1 || dx > 1) {
    return false
  }

  return nextDrawedNode.node.mx % 2 === 0 ? dy >= 0 && dy <= 1 : dy >= -1 && dy <= 0
}
