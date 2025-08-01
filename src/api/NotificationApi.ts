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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items = response.items.map((item: any) => this.modifyNotification(item));
      totalCount = response.totalCount
    }

    return new ApiList<Notification>(items, totalCount);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private modifyNotification(data: any): Notification {
    return {
      id: data.id,
      createdAt: new Date(data.createdAt),
      contentUpdatedAt: new Date(data.contentUpdatedAt),
      content: data.content,
    }
  }
}
