<template>
  <div class="modal fade" tabindex="-1" :id="elementId" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" :class="sizeClass">
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
<script setup>
import { Modal } from "bootstrap";
import { computed } from "vue";

let moduleResolve = null;
let modal = null;
let dialogResult = null;

const props = defineProps({
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
});

const sizeClass = computed(() => {
  const sizes = {
    sm: "modal-sm",
    lg: "modal-lg",
    xl: "modal-xl",
  };

  return sizes[props.size] ? sizes[props.size] : "";
});

const show = () => {
  if (modal) {
    throw new Error("The modal dialog is already open.");
  }

  let promise = new Promise((resolve) => {
    moduleResolve = resolve;
  });

  const modalElement = document.getElementById(props.elementId);
  modalElement.addEventListener(
    "hidden.bs.modal",
    () => {
      hide();
    },
    { once: true },
  );

  dialogResult = props.initResult;
  modal = new Modal(modalElement, {});
  modal.show();

  return promise;
};
const confirm = (confirmResult) => {
  dialogResult = confirmResult;
  modal.hide();
};
const hide = () => {
  modal.dispose();
  modal = null;

  moduleResolve(dialogResult);
};

defineExpose({
  show,
  confirm,
  hide,
});
</script>
