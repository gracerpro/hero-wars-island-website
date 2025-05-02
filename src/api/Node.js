import { getCurrentLocale } from "@/i18n/translation";
import ApiRequest from "../core/ApiRequest";
import { GAME_ID_EXPLORER_MOVE, TYPE_COIN } from "./Item";

export const TYPE_NODE = 0;
export const TYPE_START = 1;
export const TYPE_TOWER = 2;
export const TYPE_CHEST = 3;
export const TYPE_BLOCKER = 4;
export const TYPE_WOOD = 6;
export const TYPE_BUBBLE = 7;

export const STATUS_CREATED = 0;
export const STATUS_NOT_SURE = 3;

export const defaultCostItem = {
  typeId: TYPE_COIN,
  gameId: GAME_ID_EXPLORER_MOVE,
  count: 1,
};

export class Node {
  constructor() {
    this._apiRequest = new ApiRequest();
    this._apiRequest.setBeforeRequest((request) => {
      request.setLocale(getCurrentLocale());
    });
  }

  /**
   * @param {Number} islandId
   * @param {Object|null} filter
   * @returns {Promise<Object>}
   */
  async getList(islandId, filter = null) {
    let params = {
      islandId,
    };

    if (filter?.regionNumbers) {
      params.regionNumbers = filter.regionNumbers.join(",");
    }

    const list = await this._apiRequest.get("/island-nodes", params);

    if (list.items) {
      list.items.forEach((node) => this.modifyNode(node));
    }

    return list;
  }

  /**
   * @param {Number} nodeId
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async update(nodeId, data) {
    const node = await this._apiRequest.post(`/island-nodes/${nodeId}/update`, data);

    if (node) {
      this.modifyNode(node);
    }

    return node;
  }

  /**
   * @private
   * @param {Object} node
   */
  modifyNode(node) {
    if (node.typeId === undefined) {
      node.typeId = TYPE_NODE;
    }
    if (node.statusId === undefined) {
      node.statusId = STATUS_CREATED;
    }
    if (node.items) {
      node.items.forEach((item) => {
        if (item.emeraldCost === undefined) {
          item.emeraldCost = null;
        }
        if (!item.quantity) {
          item.quantity = 1;
        }
        if (!item.description) {
          item.description = "";
        }
      });
    } else {
      node.items = [];
    }
    if (node.cost === undefined) {
      node.cost = defaultCostItem;
    }
  }
}

/**
 * @param {Function} t
 * @param {Number} statusId
 * @returns {String}
 */
export function getStatusName(t, statusId) {
  const names = {
    [STATUS_CREATED]: t("common.created"),
    [STATUS_NOT_SURE]: t("common.haveDoubts"),
  };

  return names[statusId] ?? t("common.unknownStatus");
}

/**
 * @param {Number} typeId
 * @returns {String}
 */
export function getTypeName(typeId) {
  const map = {
    [TYPE_NODE]: "TYPE_NODE",
    [TYPE_START]: "TYPE_START",
    [TYPE_TOWER]: "TYPE_TOWER",
    [TYPE_CHEST]: "TYPE_CHEST",
    [TYPE_BLOCKER]: "TYPE_BLOCKER",
    [TYPE_WOOD]: "TYPE_WOOD",
    [TYPE_BUBBLE]: "TYPE_BUBBLE",
  };

  return map[typeId] ?? "";
}

export function isStepType(typeId) {
  return !(typeId === TYPE_START || typeId === TYPE_BLOCKER);
}
