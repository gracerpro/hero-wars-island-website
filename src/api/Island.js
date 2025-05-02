import { getCurrentLocale } from "@/i18n/translation";
import ApiRequest from "../core/ApiRequest";

export class Island {
  constructor() {
    this._apiRequest = new ApiRequest();
    this._apiRequest.setBeforeRequest((request) => {
      request.setLocale(getCurrentLocale());
    });
  }

  /**
   * @param {Number} id
   * @param {Boolean} isWithDescription
   * @returns {Promise<Object|null>}
   */
  async get(id, fields) {
    let params = {};

    if (fields.isWithDescription) {
      params.isWithDescription = 1;
    }
    if (fields.isWithBackgroundImage) {
      params.isWithBackgroundImage = 1;
    }
    const island = await this._apiRequest.get("/islands/" + id, params);

    if (island) {
      this.modifyIsland(island);
    }

    return island;
  }

  /**
   * @returns {Promise<Object|null>}
   */
  async getActual() {
    const params = {
      isWithSeo: 0,
      isWithDescription: 0,
    };
    let island = await this._apiRequest.get("/islands/actual", params);

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
  async getList(pageSize, pageNumber = 1) {
    const params = {
      pageSize,
      "fields[isWithDescription]": 0,
      "fields[isWithSeo]": 0,
    };

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
    if (island.nodesLastUpdatedAt) {
      island.nodesLastUpdatedAt = new Date(island.nodesLastUpdatedAt);
    }
    if (island.regions === undefined) {
      island.regions = [];
    }
    island.regions.forEach((region) => {
      if (region.startAt) {
        region.startAt = new Date(region.startAt);
      }
    });
  }
}
