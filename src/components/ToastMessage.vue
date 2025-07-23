<script setup lang="ts">
import { ref, computed } from "vue";
import { type ToastType, TYPE_DANGER, TYPE_SUCCESS } from "./toast";

let Toast

if (!import.meta.env.SSR) {
  import("bootstrap").then((module) => (Toast = module.Toast));
}

const props = defineProps<{
  elementId: string
}>()

const toastMessage = ref("");
const toastType = ref<ToastType>(TYPE_SUCCESS);
const isShow = ref(false);

const classType = computed(() => {
  if (toastType.value === TYPE_SUCCESS) {
    return "text-bg-success";
  }
  if (toastType.value === TYPE_DANGER) {
    return "text-bg-danger";
  }
  return "";
});

/**
 * @param {String} message
 * @param {String|null} type
 */
function show(message: string, type?: ToastType) {
  toastMessage.value = message;

  if (type) {
    toastType.value = type;
  }

  const element = document.getElementById(props.elementId) as HTMLElement;
  element.addEventListener("hide.bs.toast", () => (isShow.value = false), {
    once: true,
  });

  const toast = new Toast(element, {
    delay: 2000,
    autohide: true,
  });
  toast.show();
  isShow.value = true;
}

defineExpose({
  show,
});
</script>

<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div
      :id="elementId"
      :class="['toast align-items-center border-0', classType, isShow ? 'show' : '']"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="d-flex">
        <div class="toast-body">{{ toastMessage }}</div>
        <button
          type="button"
          class="btn-close btn-close-white me-2 m-auto"
          data-bs-dismiss="toast"
          aria-label="Close"
        ></button>
      </div>
    </div>
  </div>
</template>
