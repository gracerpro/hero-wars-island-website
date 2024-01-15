<template>
  <div class="modal fade" tabindex="-1" :id="elementId" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" :class="[sizeClass]">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ header }}</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
            :disabled="saving"
          ></button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div class="modal-footer">
          <button
            v-if="isShowSubmit"
            type="submit"
            :form="formId"
            class="btn btn-primary"
            :disabled="saving"
          >
            <span
              v-show="saving"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            <span v-show="saving" class="visually-hidden">Loading...</span>
            Сохранить
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
            :disabled="saving"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from "bootstrap";

export default {
  resolve: null,
  reject: null,
  modal: null,
  result: null,

  name: "ModalDialog",
  props: {
    elementId: { type: String, required: true },
    saving: { type: Boolean, default: false },
    formId: { type: String, default: "" },
    header: { type: String, default: "" },
    size: { type: String, default: "lg" },
    isShowSubmit: { type: Boolean, default: true },
    initResult: {
      type: [Object, Number, String, null, undefined],
      default: null,
    },
  },
  computed: {
    sizeClass() {
      let size = "";

      switch (this.size) {
        case "sm":
          size = "modal-sm";
          break;
        case "lg":
          size = "modal-lg";
          break;
        case "xl":
          size = "modal-xl";
          break;
      }

      return size;
    },
  },
  methods: {
    show() {
      if (this.$options.modal) {
        throw new Error("The modal dialog is already open.");
      }

      let localResolve;
      let localReject;

      let promise = new Promise((resolve, reject) => {
        localResolve = resolve;
        localReject = reject;
      });

      this.$options.resolve = localResolve;
      this.$options.reject = localReject;

      const modalElement = document.getElementById(this.elementId);
      modalElement.addEventListener(
        "hidden.bs.modal",
        () => {
          this.hide();
        },
        { once: true },
      );

      this.$options.result = this.$options.initResult;
      this.$options.modal = new Modal(modalElement, {});
      this.$options.modal.show();

      return promise;
    },
    confirm(result) {
      this.$options.result = result;
      this.$options.modal.hide();
    },
    hide() {
      this.$options.modal.dispose();
      this.$options.modal = null;

      this.$options.resolve(this.$options.result);
    },
  },
};
</script>
