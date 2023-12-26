import { STATUS_ACCEPTED_SUCCESS, TYPE_START } from "@/api/HeroClient";

export const TRANSLATE_X = 6;
export const TRANSLATE_Y = 6;
export const EVENT_CHANGE_TRANSLATE = "change-translate";

export const DELTA_SCALE = 0.1;
export const EVENT_CHANGE_SCALE = "change-scale";

export function canSelectNode(node) {
  return (
    node.statusId === STATUS_ACCEPTED_SUCCESS && node.typeId !== TYPE_START
  );
}

/**
 * @param {Object} nodes
 * @param {Object} selectedNodes
 * @param {Object} node
 * @returns {String|null}
 */
export function canSelectNextNode(nodes, selectedNodes, nextNode) {
  let result = null;

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
      result = "Можно выделить узел только около выделенного узла или начала.";
    }
  }

  return result;
}

function isNearNode(nextNode, node) {
  const dx = Math.abs(nextNode.mx - node.mx);
  const dy = nextNode.my - node.my;
  const maxY = nextNode.mx == node.mx ? 1 : 0;

  return dx <= 1 && dy >= -1 && dy <= maxY;
}
