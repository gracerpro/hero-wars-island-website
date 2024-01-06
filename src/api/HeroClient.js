import ApiRequest from "../core/ApiRequest";

export const TYPE_NODE = 0;
export const TYPE_START = 1;
export const TYPE_TOWN = 2;

export const STATUS_CREATED = 0;
export const STATUS_ON_MODERATION = 1;
export const STATUS_ACCEPTED_SUCCESS = 2;

export default class HeroClient {
  constructor() {
    this._apiRequest = new ApiRequest();
  }

  /**
   * @param {Number} id
   * @returns {Promise<Object|null>}
   */
  async getIsland(id) {
    return this._apiRequest.get("/islands/" + id);
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

    return this._apiRequest.get("/islands", params);
  }

  /**
   * @param {Number} islandId
   * @returns {Promise<Object>}
   */
  async getNodes(islandId) {
    return this._apiRequest.get(`/islands/${islandId}/nodes`);
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
