export const SIDE = 50;
const HALF_SIDE = SIDE / 2;
const HEIGHT = 34;
const IMAGE_SIDE = 24;

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
 * @param {Boolean} isShowQuantity 
 * @returns {Array}
 */
export function getIconsItems(dataItems, drawedNodes, isShowQuantity) {
  let countsByNode = getCountsByNode(dataItems);
  let resultItems = [];
  let indexesByNode = {};

  dataItems.forEach((item) => {
    const nodeId = item.node.id
    const drawedNode = drawedNodes[item.node.id];
    const count = countsByNode[nodeId];
    const isShowText = item.item.quantity > 1 && isShowQuantity;

    item.textX = null;
    item.textY = null;
    item.isSmallText = null;

    if (count === 1) {
      const fontSize = 20;
      item.iconWidth = IMAGE_SIDE * (isShowText ? 1.9 : 2.2);
      item.iconHeight = IMAGE_SIDE * (isShowText ? 1.9 : 2.2);
      item.iconX = drawedNode.x - item.iconWidth / 2;
      item.iconY = drawedNode.y - item.iconHeight / 2 - (isShowText ? fontSize / 2 : 0);
      if (isShowText) {
        item.textX = item.iconX + item.iconWidth * 0.05;
        item.textY = drawedNode.y + HEIGHT - 3;
      }
    } else {
      if (!indexesByNode[nodeId]) {
        indexesByNode[nodeId] = 0;
      }
      const index = indexesByNode[nodeId];
      const borderWidth = 2;

      if (count === 2) {
        const fontSize = 16;
        item.iconWidth = IMAGE_SIDE * (isShowText ? 1.3 : 1.4);
        item.iconHeight = IMAGE_SIDE * (isShowText ? 1.3 : 1.4);
        const cx = item.iconWidth + borderWidth;
        const srartX = drawedNode.x - cx + borderWidth / 2;
        item.iconX = srartX + cx * index;
        item.iconY = drawedNode.y - item.iconHeight / 2 - (isShowText ? fontSize / 2 : 0);

        if (isShowText) {
          item.textX = srartX + cx * index;
          item.textY = drawedNode.y + HEIGHT - fontSize * 0.7;
          item.isSmallText = true;
        }
      } else if (index <= 3) {
        // count >= 3
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
        item = false;
      }

      indexesByNode[nodeId]++;
    }

    if (item) {
      resultItems.push(item);
    }
  });

  return resultItems;
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
  const x = node.mx * getOneWidth();
  const y = node.my * getOneHeight() + (node.mx % 2 === 0 ? 0 : getOneHeight() / 2);

  return {
    node,
    xyId: node.mx + "_" + node.my,
    x,
    y,
    coordinates: getCoordinates(x, y),
  };
}

export function getOneWidth() {
  return 1.5 * SIDE
}

export function getOneHeight() {
  return 2 * HEIGHT
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

  return coordinates
}
