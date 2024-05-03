import { getCurrentLocale } from "@/i18n/translation";
import ApiRequest from "../core/ApiRequest";

export default class Feedback {
  constructor() {
    this._apiRequest = new ApiRequest();
    this._apiRequest.setBeforeRequest((request) => {
      request.setLocale(getCurrentLocale());
    });
  }

  /**
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async create(data) {
    return this._apiRequest.post("/feedback-items/create", data);
  }

  async getList(pageSize, pageNumber = 1) {
    const params = { pageSize };

    if (pageNumber > 1) {
      params.pageNumber = pageNumber;
    }

    const list = await this._apiRequest.get("/feedback-items/index", params);

    if (list.items) {
      list.items.forEach((item) => this.modifyFeedback(item));
    }

    return list;
  }

  /**
   * @param {Object} feedbackItem
   * @private
   */
  modifyFeedback(feedbackItem) {
    if (feedbackItem.createdAt) {
      feedbackItem.createdAt = new Date(feedbackItem.createdAt);
    }
  }
}
