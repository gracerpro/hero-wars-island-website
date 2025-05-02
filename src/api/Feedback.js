import { getCurrentLocale } from "@/i18n/translation";
import ApiRequest from "../core/ApiRequest";

export const STATUS_CREATED = "created";
export const STATUS_IN_PROCESS = "in_process";
export const STATUS_MODERATED = "moderated";
export const STATUS_ABORT = "abort";
export const STATUS_CLOSED = "closed";
export const STATUS_QUEUE = "queue";

export class Feedback {
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

  /**
   * @param {Number} pageSize
   * @param {Number} pageNumber
   * @returns {Promise<Object>}
   */
  async getList(pageSize, pageNumber = 1) {
    const params = { pageSize };

    if (pageNumber > 1) {
      params.pageNumber = pageNumber;
    }

    const list = await this._apiRequest.get("/feedback-items", params);

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

export function getStatusName(t, statusId) {
  const names = {
    [STATUS_CREATED]: t("common.created"),
    [STATUS_IN_PROCESS]: t("common.inProgress"),
    [STATUS_MODERATED]: t("common.moderated"),
    [STATUS_ABORT]: t("common.abort"),
    [STATUS_CLOSED]: t("common.closed"),
    [STATUS_QUEUE]: t("common.inQueue"),
  };

  return names[statusId] ? names[statusId] : t("common.unknownStatus");
}
