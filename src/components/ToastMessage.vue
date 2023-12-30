<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div
      :id="elementId"
      :class="['toast align-items-center border-0', this.classType]"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="d-flex">
        <div class="toast-body">{{ message }}</div>
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
<script>
import { Toast } from "bootstrap";

export const TYPE_SUCCESS = "success";
export const TYPE_DANGER = "danger";

export default {
  name: "ToastMessage",
  props: {
    elementId: { type: String, required: true },
    type: { type: String, default: TYPE_SUCCESS },
  },
  data: function () {
    return {
      message: "",
    };
  },
  computed: {
    classType() {
      if (this.type === TYPE_SUCCESS) {
        return "text-bg-success";
      }
      if (this.type === TYPE_DANGER) {
        return "text-bg-danger";
      }
      return "";
    },
  },
  methods: {
    show(message) {
      this.message = message;

      const toastBootstrap = new Toast(
        document.getElementById(this.elementId),
        { delay: 2000 }
      );
      toastBootstrap.show();
    },
  },
};
</script>
