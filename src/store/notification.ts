import type { Notification } from '@/api/NotificationApi'
import { defineStore } from 'pinia'
import { getStoreItemName } from '.'
import { ref } from 'vue'

export type GlobalNotification = {
  id: number
  hideAt: Date | null
}

export type GlobalNotificationsMap = { [key: string]: GlobalNotification }

type GlobalNotificationData = {
  id: number
  hideAt: string | null
}
type GlobalNotificationsDataMap = { [key: string]: GlobalNotificationData }

const NAME_NOTIFICATIONS = 'notifications'

export const useNotificationStore = defineStore('notification', () => {
  const globalNotifications = ref<GlobalNotificationsMap>({})

  if (!import.meta.env.SSR) {
    init()
  }

  function hide(id: number) {
    globalNotifications.value[id] = {
      id: id,
      hideAt: new Date(),
    }
    const notifyData = getNotificationsData(globalNotifications.value)
    localStorage.setItem(getStoreItemName(NAME_NOTIFICATIONS), JSON.stringify(notifyData))
  }

  function clear(notifications: Array<Notification>) {
    for (const id in globalNotifications.value) {
      const notification: GlobalNotification | undefined = globalNotifications.value[id]

      if (notification !== undefined) {
        const exists = notifications.find((item) => item.id === notification.id)

        if (!exists) {
          delete globalNotifications.value[id]
        }
      }
    }

    const itemName = getStoreItemName(NAME_NOTIFICATIONS)

    if (Object.keys(globalNotifications.value).length === 0) {
      localStorage.removeItem(itemName)
    } else {
      const notifyData = getNotificationsData(globalNotifications.value)
      localStorage.setItem(itemName, JSON.stringify(notifyData))
    }
  }

  function init() {
    const notifactionsJson = localStorage.getItem(getStoreItemName(NAME_NOTIFICATIONS)) ?? '{}'
    const notifications = JSON.parse(notifactionsJson)

    for (const id in notifications) {
      const notifyData = notifications[id]

      globalNotifications.value[id] = {
        id: parseInt(id),
        hideAt: notifyData.hideAt ? new Date(notifyData.hideAt) : null,
      }
    }
  }

  return {
    globalNotifications,
    hide,
    clear,
  }
})

function getNotificationsData(
  globalNotifications: GlobalNotificationsMap
): GlobalNotificationsDataMap {
  const notifyData: GlobalNotificationsDataMap = {}

  for (const id in globalNotifications) {
    const notify = globalNotifications[id]
    notifyData[id] = {
      id: notify.id,
      hideAt: notify.hideAt ? notify.hideAt.toISOString() : null,
    }
  }

  return notifyData
}
