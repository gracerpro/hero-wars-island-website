import { getCurrentLocale } from "@/i18n/translation";
import ApiRequest from "../core/ApiRequest";

export default class News {
  constructor() {
    this._apiRequest = new ApiRequest();
    this._apiRequest.setBeforeRequest((request) => {
      request.setLocale(getCurrentLocale());
    });
  }

  /**
   * @param {Number} pageSize
   * @param {Number} pageNumber
   * @param {Object} filter
   * @returns {Promise<Object|null>}
   */
  async getList(pageSize, pageNumber = 1, filter = null) {
    let params = "pageSize=" + pageSize;

    if (pageNumber > 1) {
      params += "&pageNumber=" + pageNumber;
    }
    if (filter && Object.keys(filter).length) {
      params += "&" + Object.keys(filter).map(key => `filter[${key}]=${encodeURIComponent(filter[key])}`).join('&')
    }

    const list = await this._apiRequest.get("/news", params);

    if (list.items) {
      list.items.forEach((oneNews) => this.modifyOneNews(oneNews));
    }

    return list;
  }

  /**
   * @param {String} slug
   * @returns {Promise<Object>}
   */
  async get(slug) {
    let oneNews = await this._apiRequest.get("/news/view?slug=" + slug)

    this.modifyOneNews(oneNews)

    return oneNews
  }

  /**
   * @private
   */
  modifyOneNews(oneNews) {
    if (oneNews.createdAt) {
      oneNews.createdAt = new Date(oneNews.createdAt);
    }
    if (oneNews.updatedAt) {
      oneNews.updatedAt = new Date(oneNews.updatedAt);
    }
  }
}
