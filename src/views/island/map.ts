import type { Item } from "@/api/ItemApi";
import { isCommonStep, type Node } from "@/api/NodeApi";

export const SIDE = 50;
const HALF_SIDE = SIDE / 2;
const HEIGHT = 34;
const IMAGE_SIDE = 24;

export type UserNodeIds = Set<number>

export interface ViewReward {
  readonly uniqueId: string,
  readonly item: Item,
  quantity: number,
  humanQuantity: string,
}

export interface ViewNodeReward extends ViewReward {
  readonly node: Node,
}

export const SELECT_MODE_PLAN = "plan";
export const SELECT_MODE_GOING = "going";
export const SELECT_MODE_DISABLE = "disable";

export type SelectMode = "plan" | "going" | "disable"

/**
 * @param {Object} nodes
 * @returns {Object}
 */
export function getDrawedNodes(nodes) {
  let drawedNodes = {};

  for (const id in nodes) {
    const node = nodes[id];
    drawedNodes[id] = getDrawedNode(node);
  }

  return drawedNodes;
}

/**
 * @param {Array} dataItems
 * @param {Object} drawedNodes
 * @returns {Array}
 */
export function getIconsItems(dataItems, drawedNodes) {
  const countsByNode = getCountsByNode(dataItems);
  const resultItems = [];
  const indexesByNode = {};
  const rewardQuantities = [];
  const warningPoints = {};

  dataItems.forEach((item) => {
    const nodeId = item.node.id;
    const drawedNode = drawedNodes[nodeId];
    const count = countsByNode[nodeId];
    const isShowText = item.item.quantity > 1;

    let itemQuantity = {
      nodeId,
      isSmallText: false,
      humanQuantity: item.humanQuantity,
    };

    if (count === 1) {
      item.iconWidth = IMAGE_SIDE * 2.2;
      item.iconHeight = IMAGE_SIDE * 2.2;
      item.iconX = drawedNode.x - item.iconWidth / 2;
      item.iconY = drawedNode.y - item.iconHeight / 2;

      if (isShowText) {
        itemQuantity.x = item.iconX + item.iconWidth * 0.02;
        itemQuantity.y = drawedNode.y + HEIGHT - 3;
        itemQuantity.uid = nodeId + "_0";
      }
    } else {
      if (!indexesByNode[nodeId]) {
        indexesByNode[nodeId] = 0;
      }
      const index = indexesByNode[nodeId];
      const borderWidth = 2;

      if (count === 2) {
        item.iconWidth = IMAGE_SIDE * 1.4;
        item.iconHeight = IMAGE_SIDE * 1.4;
        const cx = item.iconWidth + borderWidth;
        const srartX = drawedNode.x - cx + borderWidth / 2;
        item.iconX = srartX + cx * index;
        item.iconY = drawedNode.y - item.iconHeight / 2;

        if (isShowText) {
          const fontSize = 16;
          itemQuantity.x = srartX + cx * index;
          itemQuantity.y = drawedNode.y + HEIGHT - fontSize * 0.7;
          itemQuantity.isSmallText = true;
          itemQuantity.uid = nodeId + "_" + index;
        }
      } else if (index <= 3) {
        // 0,0   1,0
        //     *
        // 0,1   1,1
        item.iconWidth = IMAGE_SIDE * 1.1;
        item.iconHeight = IMAGE_SIDE * 1.1;
        const cx = item.iconWidth + borderWidth;
        const srartX = drawedNode.x - cx + borderWidth / 2;
        item.iconX = srartX + (index % 2 === 0 ? 0 : cx);
        const cy = item.iconHeight + borderWidth;
        const srartY = drawedNode.y - cy + borderWidth / 2;
        item.iconY = srartY + (index < 2 ? 0 : cy);
      } else {
        item = null;
        itemQuantity = null;
      }

      indexesByNode[nodeId]++;
    }

    if (item) {
      resultItems.push(item);
    }
    if (isShowText && itemQuantity) {
      rewardQuantities.push(itemQuantity);
    }

    if (item.node.cost) {
      if (!isCommonStep(item.node.cost)) {
        warningPoints[nodeId] = {
          nodeId,
          x: drawedNode.x + SIDE * 0.7,
          y: drawedNode.y,
        };
      }
    }
  });

  return {
    icons: resultItems,
    quantities: rewardQuantities,
    warningPoints,
  };
}

function getCountsByNode(items) {
  let countsByNode = {};

  items.forEach((item) => {
    const nodeId = item.node.id;

    if (!countsByNode[nodeId]) {
      countsByNode[nodeId] = 0;
    }
    countsByNode[nodeId]++;
  });

  return countsByNode;
}

/**
 * @param {Object} node
 */
function getDrawedNode(node) {
  const x = node.mx * getHorizontalStep();
  const y = node.my * getVerticalStep() + (node.mx % 2 === 0 ? 0 : getVerticalStep() / 2);

  return {
    node,
    xyId: node.mx + "_" + node.my,
    x,
    y,
    coordinates: getCoordinates(x, y),
  };
}

/**
 * @returns {Number}
 */
export function getHorizontalStep() {
  return 1.5 * SIDE;
}

/**
 * @returns {Number}
 */
export function getVerticalStep() {
  return 2 * HEIGHT;
}

/**
 * @param {Number} x
 * @param {Number} y
 */
function getCoordinates(x, y) {
  let coordinates = new Array(6);
  coordinates[0] = { x: x + SIDE, y };
  coordinates[1] = { x: x + HALF_SIDE, y: y + HEIGHT };
  coordinates[2] = { x: x - HALF_SIDE, y: y + HEIGHT };
  coordinates[3] = { x: x - SIDE, y };
  coordinates[4] = { x: x - HALF_SIDE, y: y - HEIGHT };
  coordinates[5] = { x: x + HALF_SIDE, y: y - HEIGHT };

  return coordinates;
}
