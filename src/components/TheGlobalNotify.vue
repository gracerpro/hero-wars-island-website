<script setup lang="ts">
import { type Notification } from '@/api/NotificationApi'
import { type GlobalNotificationsMap } from '@/store'
import { HIDE_GLOBAL_NOTIFY } from '@/store/mutation-types'
import { computed } from 'vue'
import { useStore } from 'vuex'

interface VisibleNotification {
  id: number
  content: string
}

interface Props {
  notifications: Array<Notification>
}

const props = defineProps<Props>()

const store = useStore()

const visibleNotifications = computed<Array<VisibleNotification>>(() => {
  const notifications: Array<VisibleNotification> = []
  const globalNotifications = store.state.globalNotifications as GlobalNotificationsMap

  props.notifications.forEach((notification) => {
    const notify = globalNotifications[notification.id]

    if (!notify || !notify.hideAt || notification.contentUpdatedAt > notify.hideAt) {
      notifications.push({
        id: notification.id,
        content: notification.content,
      })
    }
  })

  return notifications
})

function onHide(notification: VisibleNotification) {
  store.commit(HIDE_GLOBAL_NOTIFY, { id: notification.id })
}
</script>

<template>
  <div class="container">
    <div
      v-for="notification in visibleNotifications"
      :key="notification.id"
      class="alert alert-warning mt-3 alert-dismissible fade show"
      role="alert"
    >
      <div
        class="notification-content"
        v-html="notification.content"
      ></div>
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="alert"
        aria-label="Close"
        @click="onHide(notification)"
      ></button>
    </div>
  </div>
</template>

<style>
.notification-content p:last-child {
  margin-bottom: 0;
}
</style>
