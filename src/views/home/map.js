import { TYPE_START } from "@/api/node";

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
  let result = null;

  if (nextNode.typeId === TYPE_START) {
    return "Невозможно выбрать стартовый узел.";
  }

  // если нет связи следующего узла с выделенным ранее или входным
  // то запрет

  if (Object.keys(selectedNodes).length === 0) {
    let isFound = false;
    for (const id in nodes) {
      const node = nodes[id];
      if (node.typeId === TYPE_START) {
        isFound = true;

        if (!isNearNode(nextNode, node)) {
          result = "Выделить узел можно около входа.";
          break;
        }
      }
    }
    if (!isFound) {
      result = "Не найден узел входа. Обратитесь к администраторам.";
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
      result = "Выделить узел можно только около выделенного узла или входа.";
    }
  }

  return result;
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
