import ApiRequest from "@/core/ApiRequest";
import { getCurrentLocale } from "@/i18n/translation";
import { ApiList } from "./common"

export interface Notification {
  id: number,
  createdAt: Date,
  contentUpdatedAt: Date,
  content: string,
}

export class NotificationApi {
  private apiRequest: ApiRequest

  constructor() {
    this.apiRequest = new ApiRequest();
    this.apiRequest.setBeforeRequest((request: ApiRequest) => {
      request.setLocale(getCurrentLocale());
    });
  }

  async getList(): Promise<ApiList<Notification>> {
    const response = await this.apiRequest.get("/notifications");

    let items: Array<Notification> = []
    let totalCount = 0

    if (response.items) {
      items = response.items.map((item: any) => this.modifyNotification(item));
      totalCount = response.totalCount
    }

    return new ApiList<Notification>(items, totalCount);
  }

  private modifyNotification(notification: any): Notification {
    return {
      id: notification.id,
      createdAt: new Date(notification.createdAt),
      contentUpdatedAt: new Date(notification.contentUpdatedAt),
      content: notification.content,
    }
  }
}
