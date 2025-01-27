<script setup>
import { HIDE_GLOBAL_NOTIFY } from "@/store/mutation-types";
import { ref } from "vue";
import { useStore } from "vuex";
import { NOTIFY_MAIN_SERVER } from "./notify";

const store = useStore();

const notifyContent = ref("");
const isShow = ref(false);

load();

function load() {
  if (import.meta.env.SSR) {
    return;
  }

  const notify = store.state.globalNotifications[NOTIFY_MAIN_SERVER];

  if (!notify || !notify.hideAt) {
    isShow.value = true;
  }

  // TODO: load from server, notifyContent
}

function onHide() {
  store.commit(HIDE_GLOBAL_NOTIFY, { id: NOTIFY_MAIN_SERVER });
}
</script>

<template>
  <div
    v-if="isShow && notifyContent"
    class="container"
  >
    <div
      class="alert alert-warning mt-2 alert-dismissible fade show"
      role="alert"
    >
      {{ notifyContent }}
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="alert"
        aria-label="Close"
        @click="onHide"
      ></button>
    </div>
  </div>
</template>
