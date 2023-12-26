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
 * @param {Array} selectedNodes
 * @param {Object} node
 * @returns {String|null}
 */
export function canSelectNextNode(nodes, selectedNodes, nextNode) {
  let result = null;

  if (!selectedNodes.length) {
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
      throw new Error("Could not find a start node.");
    }
  } else {
    result = "TODO";
  }

  return result;
}

function isNearNode(nextNode, node) {
  console.log(nextNode, node.mx, node.my);

  // если нет связи следующего узла с выделенным ранее или входным
  // то запрет
  return (
    Math.abs(nextNode.mx - node.mx) <= 1 && Math.abs(nextNode.my - node.my) <= 1
  );
}
