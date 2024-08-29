import { TYPE_BLOCKER, TYPE_START } from "@/api/Node";
import { useI18n } from "@/i18n";

export const TRANSLATE_X = 20;
export const TRANSLATE_Y = 20;
export const EVENT_CHANGE_TRANSLATE = "change-translate";

export const DELTA_SCALE = 0.5;
export const EVENT_CHANGE_SCALE = "change-scale";

/**
 * @param {Object} node
 * @returns {Boolean}
 */
export function canSelectNode(node) {
  return node.typeId !== TYPE_START && node.typeId != TYPE_BLOCKER;
}

/**
 * @param {Object} drawedNodes
 * @param {Object} selectedNodes
 * @param {Object} node
 * @returns {String|null}
 */
export function canSelectNextNode(drawedNodes, selectedNodes, nextDrawedNode) {
  const { t } = useI18n();
  let result = null;

  if (nextDrawedNode.node.typeId === TYPE_START) {
    return t("page.island.canNotSelectStartNode");
  }

  // if no link to selected or started node
  // then cancel

  if (Object.keys(selectedNodes).length === 0) {
    let isFound = false;
    let isNearStart = false
    for (const id in drawedNodes) {
      const drawedNode = drawedNodes[id];
      if (drawedNode.node.typeId === TYPE_START) {
        isFound = true;

        if (isNearNode(nextDrawedNode, drawedNode)) {
          isNearStart = true
          break
        }
      }
    }
    if (!isFound) {
      result = t("page.island.notFoundStartNodeAdmin");
    } else if (!isNearStart) {
      result = t("page.island.canSelectNearStart");
    }
  } else {
    let isFound = false;
    for (const id in drawedNodes) {
      const drawedNode = drawedNodes[id];

      if (nextDrawedNode.xyId === drawedNode.xyId) {
        continue;
      }
      if (isNearNode(nextDrawedNode, drawedNode)) {
        if (drawedNode.node.typeId === TYPE_START) {
          isFound = true;
          break;
        }
        if (selectedNodes[drawedNode.node.id]) {
          isFound = true;
          break;
        }
      }
    }
    if (!isFound) {
      result = t("page.island.canSelectOnlySelect");
    }
  }

  return result;
}

/**
 * @param {Object} nextDrawedNode
 * @param {Object} drawedNode
 * @returns {Boolean}
 */
function isNearNode(nextDrawedNode, drawedNode) {
  const dy = nextDrawedNode.node.my - drawedNode.node.my;

  if (nextDrawedNode.node.mx == drawedNode.node.mx) {
    return dy >= -1 && dy <= 1;
  }

  const dx = nextDrawedNode.node.mx - drawedNode.node.mx;

  if (dx < -1 || dx > 1) {
    return false
  }

  return nextDrawedNode.node.mx % 2 === 0 ? dy >= 0 && dy <= 1 : dy >= -1 && dy <= 0;
}
