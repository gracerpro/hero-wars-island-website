import ApiRequest from "@/core/ApiRequest";
import { getCurrentLocale } from "@/i18n/translation";

interface Notification {
  id: number,
  createdAt: Date,
  contentUpdatedAt: Date | null,
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

  async getList(): Promise<Notification[]> {
    const response = await this.apiRequest.get("/notifications");

    if (response.items) {
      return response.items.map((item: any) => this.modifyNotification(item));
    }

    return [];
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
