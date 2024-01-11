import ApiRequest from "../core/ApiRequest";

export const TYPE_NODE = 0;
export const TYPE_START = 1;
export const TYPE_TOWN = 2;
export const TYPE_CHEST = 3;

export const STATUS_CREATED = 0;
export const STATUS_ON_MODERATION = 1;
export const STATUS_ACCEPTED_SUCCESS = 2;
export const STATUS_NOT_SURE = 3;

export function getStatusName(statusId) {
  let name = "";

  switch (statusId) {
    case STATUS_CREATED:
      name = "Создано";
      break;
    case STATUS_ON_MODERATION:
      name = "На модерации";
      break;
    case STATUS_NOT_SURE:
      name = "Есть сомнение";
      break;
    case STATUS_ACCEPTED_SUCCESS:
      name = "Принято";
      break;
  }

  return name;
}

export default class HeroClient {
  constructor() {
    this._apiRequest = new ApiRequest();
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
    let params = { pageSize };

    if (pageNumber > 1) {
      params.pageNumber = pageNumber;
    }

    let list = await this._apiRequest.get("/islands", params);

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
    return this._apiRequest.get(`/islands/${islandId}/nodes`);
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
    return this._apiRequest.post(`/island-nodes/${nodeId}/update`, data);
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
