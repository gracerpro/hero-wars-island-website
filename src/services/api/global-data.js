import { Notification } from "@/api/Notification";

export async function loadGlobalData() {
  const client = new Notification();

  const notificationList = await client.getList();

  return {
    notifications: notificationList.items,
  };
}
