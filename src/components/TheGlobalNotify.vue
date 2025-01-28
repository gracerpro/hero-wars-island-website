<script setup>
import { HIDE_GLOBAL_NOTIFY } from "@/store/mutation-types";
import { computed } from "vue";
import { useStore } from "vuex";

const props = defineProps({
  notifications: { type: Array, required: true },
});

const store = useStore();

const visibleNotifications = computed(() => {
  const notifications = [];

  props.notifications.forEach((notification) => {
    const notify = store.state.globalNotifications[notification.id];
    console.log(notify);

    if (!notify || !notify.hideAt || notification.contentUpdatedAt > notify.hideAt) {
      notifications.push({
        id: notification.id,
        content: notification.content,
      });
    }
  });

  return notifications;
});

/**
 * @param {Object} notification
 */
function onHide(notification) {
  store.commit(HIDE_GLOBAL_NOTIFY, { id: notification.id });
}
</script>

<template>
  <div class="container">
    <div
      v-for="notification in visibleNotifications"
      :key="notification.id"
      class="alert alert-warning mt-2 alert-dismissible fade show"
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
