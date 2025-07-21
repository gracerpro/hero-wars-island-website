import ApiRequest from "@/core/ApiRequest";
import { getCurrentLocale } from "@/i18n/translation";

export class Notification {
  private ApiRequest apiRequest

  constructor() {
    this._apiRequest = new ApiRequest();
    this._apiRequest.setBeforeRequest((request) => {
      request.setLocale(getCurrentLocale());
    });
  }

  /**
   * @returns {Promise<Object>}
   */
  async getList() {
    const list = await this._apiRequest.get("/notifications");

    if (list.items) {
      list.items.forEach((item) => this.modifyNotification(item));
    }

    return list;
  }

  /**
   * @private
   * @param {Object} notification
   * @returns {Object}
   */
  modifyNotification(notification) {
    if (notification.createdAt) {
      notification.createdAt = new Date(notification.createdAt);
    }
    if (notification.contentUpdatedAt) {
      notification.contentUpdatedAt = new Date(notification.contentUpdatedAt);
    }

    return notification;
  }
}
