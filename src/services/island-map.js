import { STATUS_ACCEPTED_SUCCESS, TYPE_START } from "@/api/Node";
import { useI18n } from "@/i18n";

export const TRANSLATE_X = 6;
export const TRANSLATE_Y = 6;
export const EVENT_CHANGE_TRANSLATE = "change-translate";

export const DELTA_SCALE = 0.1;
export const EVENT_CHANGE_SCALE = "change-scale";

export function canSelectNode(node) {
  return node.typeId !== TYPE_START;
}

/**
 * @param {Object} nodes
 * @param {Object} selectedNodes
 * @param {Object} node
 * @returns {String|null}
 */
export function canSelectNextNode(nodes, selectedNodes, nextNode) {
  const { t } = useI18n();
  let result = null;

  if (nextNode.typeId === TYPE_START) {
    return t("page.island.canNotSelectStartNode");
  }

  // if no link to selected or started node
  // then cancel

  if (Object.keys(selectedNodes).length === 0) {
    let isFound = false;
    for (const id in nodes) {
      const node = nodes[id];
      if (node.typeId === TYPE_START) {
        isFound = true;

        if (!isNearNode(nextNode, node)) {
          result = t("page.island.canSelectNearStart");
          break;
        }
      }
    }
    if (!isFound) {
      result = t("page.island.notFoundStartNodeAdmin");
    }
  } else {
    let isFound = false;
    for (const id in nodes) {
      const node = nodes[id];

      if (nextNode.xyId === node.xyId) {
        continue;
      }
      if (isNearNode(nextNode, node)) {
        if (node.typeId === TYPE_START) {
          isFound = true;
          break;
        }
        if (selectedNodes[node.id]) {
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
 * @param {Object} node
 * @returns {Boolean}
 */
export function canEditNode(node) {
  return (
    node.typeId !== TYPE_START && node.statusId !== STATUS_ACCEPTED_SUCCESS && !node?.items.length
  );
}

function isNearNode(nextNode, node) {
  const dy = nextNode.my - node.my;

  if (nextNode.mx == node.mx) {
    return dy >= -1 && dy <= 1;
  }

  const dx = nextNode.mx - node.mx;

  const canY = nextNode.mx % 2 === 0 ? dy >= 0 && dy <= 1 : dy >= -1 && dy <= 0;

  return dx >= -1 && dx <= 1 && canY;
}
