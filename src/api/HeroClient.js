import { getCurrentLocale } from "@/i18n/translation";
import ApiRequest from "../core/ApiRequest";
import { STATUS_ACCEPTED_SUCCESS, TYPE_NODE } from "./node";

export default class HeroClient {
  constructor() {
    this._apiRequest = new ApiRequest();
    this._apiRequest.setBeforeRequest((request) => {
      request.setLocale(getCurrentLocale());
    });
  }

  /**
   * @param {Number} id
   * @returns {Promise<Object|null>}
   */
  async getIsland(id) {
    let island = await this._apiRequest.get("/islands/" + id);

    if (island) {
      this.modifyIsland(island);
    }

    return island;
  }

  /**
   * @returns {Promise<Object|null>}
   */
  async getActualIsland() {
    let island = await this._apiRequest.get("/islands/actual");

    if (island) {
      this.modifyIsland(island);
    }

    return island;
  }

  /**
   * @param {Number} pageSize
   * @param {Number} [pageNumber=1]
   * @returns {Promise<Object|null>}
   */
  async getIslandList(pageSize, pageNumber = 1) {
    const params = { pageSize };

    if (pageNumber > 1) {
      params.pageNumber = pageNumber;
    }

    const list = await this._apiRequest.get("/islands", params);

    if (list.items) {
      list.items.forEach((island) => this.modifyIsland(island));
    }

    return list;
  }

  /**
   * @param {Number} islandId
   * @returns {Promise<Object>}
   */
  async getNodes(islandId) {
    const list = await this._apiRequest.get(`/islands/${islandId}/nodes`);

    if (list.items) {
      list.items.forEach((node) => this.modifyNode(node));
    }

    return list;
  }

  /**
   * @private
   * @param {Object} node
   */
  modifyNode(node) {
    if (!node.userComment) {
      node.userComment = "";
    }
    if (!node.userQuantity) {
      node.userQuantity = "";
    }
    if (!node.typeId) {
      node.typeId = TYPE_NODE;
    }
    if (!node.statusId) {
      node.statusId = STATUS_ACCEPTED_SUCCESS;
    }
    if (node.items) {
      node.items.forEach((item) => {
        if (!item.emeraldCost) {
          item.emeraldCost = null;
        }
        if (!item.quantity) {
          item.quantity = 1;
        }
        if (!item.description) {
          item.description = "";
        }
      });
      // emeraldCost
    } else {
      node.items = [];
    }
  }

  /**
   * @param {Object} island
   * @private
   */
  modifyIsland(island) {
    if (island.eventStartAt) {
      island.eventStartAt = new Date(island.eventStartAt);
    }
    if (island.eventEndAt) {
      island.eventEndAt = new Date(island.eventEndAt);
    }
  }

  /**
   * @param {Number} nodeId
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async updateNode(nodeId, data) {
    const node = await this._apiRequest.post(
      `/island-nodes/${nodeId}/update`,
      data,
    );

    if (node) {
      this.modifyNode(node);
    }

    return node;
  }

  /**
   * @param {Object|null} filter
   * @param {Number} limit
   * @returns {Promise<Object>}
   */
  async getItems(limit, filter = null) {
    let params = { limit };

    if (filter) {
      Object.keys(filter).forEach((key) => {
        params[`filter[${key}]`] = filter[key];
      });
    }

    return this._apiRequest.get("/items", params);
  }

  /**
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createFeedback(data) {
    return this._apiRequest.post("/feedback-items/create", data);
  }
}
