<script setup lang="ts">
import { Modal } from "bootstrap"; // TODO: test, must be dynamic
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { DialogResult } from "./modal-dialog";

const { t } = useI18n();

interface AppModal {
  show: () => void,
}

defineExpose({
  show,
  hide,
});

let moduleResolve: (value: DialogResult) => void;
let modal: Modal | null = null;
let dialogResult: DialogResult = null;

if (!import.meta.env.SSR) {
  // Load bootstrap module asynchronously else get an error on SSR
  // ReferenceError: document is not defined
  (await import("bootstrap")).Modal;
}

interface Props {
  elementId: string,
  formId: string,
  saving: boolean,
  header: string,
  submitButtonText: string,
  size: string,
  isShowSubmit: boolean,
  initResult: object | number | string | null | undefined,
}

const props = withDefaults(defineProps<Props>(), {
  saving: false,
  header: "",
  submitButtonText: "",
  size: "lg",
  isShowSubmit: true,
  initResult: null,
});

const sizeClass = computed(() => {
  const sizes: { [key: string] : string } = {
    sm: "modal-sm",
    lg: "modal-lg",
    xl: "modal-xl",
  };

  return sizes[props.size] ?? "";
});

const hideDialog = () => {
  modal?.dispose();
  modal = null;

  moduleResolve(dialogResult);
};

function show() {
  if (modal) {
    throw new Error("The modal dialog is already open.");
  }

  let promise = new Promise((resolve) => {
    moduleResolve = resolve;
  });

  const modalElement = document.getElementById(props.elementId) as HTMLElement;
  modalElement.addEventListener(
    Modal.Events.hidden,
    () => {
      hideDialog();
    },
    { once: true }
  );

  dialogResult = props.initResult;

  modal = new Modal(modalElement, {});
  modal.show();

  return promise;
}

function hide() {
  modal?.hide();
}
</script>

<template>
  <div
    :id="elementId"
    class="modal fade"
    tabindex="-1"
    aria-hidden="true"
  >
    <div
      class="modal-dialog modal-dialog-centered"
      :class="sizeClass"
    >
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
            <span
              v-show="saving"
              class="visually-hidden"
              >Loading...</span
            >
            {{ submitButtonText ? submitButtonText : t("common.save") }}
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
            :disabled="saving"
          >
            {{ t("common.cancel") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
