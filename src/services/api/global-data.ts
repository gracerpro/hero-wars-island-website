import { NotificationApi, type Notification } from "@/api/NotificationApi";

export type GlobalData = {
  notifications: Array<Notification>
}

export async function loadGlobalData(): Promise<GlobalData> {
  const client = new NotificationApi();

  const notificationList = await client.getList();

  return {
    notifications: notificationList.items,
  };
}
