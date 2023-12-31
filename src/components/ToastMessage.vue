<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div
      :id="elementId"
      :class="[
        'toast align-items-center border-0',
        classType,
        isShow ? 'show' : '',
      ]"
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
  },
  data: function () {
    return {
      message: "",
      type: TYPE_SUCCESS,
      isShow: false,
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
    /**
     * @param {String} message
     * @param {String|null} type
     */
    show(message, type) {
      this.message = message;
      if (type) {
        this.type = type;
      }

      const element = document.getElementById(this.elementId);
      element.addEventListener(
        "hide.bs.toast",
        () => {
          console.log("hide");
          this.isShow = false;
        },
        { once: true }
      );

      const toast = new Toast(element, {
        delay: 2000,
        autohide: true,
      });
      toast.show();
      this.isShow = true;
    },
  },
};
</script>
