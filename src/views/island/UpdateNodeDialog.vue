<template>
  <modal-dialog
    :saving="saving"
    :element-id="dialogId"
    :form-id="formId"
    header="Редактирование"
    ref="dialog"
  >
    <node-form
      :node="node"
      :form-id="formId"
      @success-save="onSuccessSave"
      @saving="onSaving"
    />
  </modal-dialog>
</template>
<script setup>
import ModalDialog from "@/components/ModalDialog.vue";
import NodeForm from "./NodeForm.vue";
import { ref, computed } from "vue";

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
});

const saving = ref(false);
const dialog = ref(null);

const dialogId = computed(() => "node-dialog__" + props.node.id);
const formId = computed(() => dialogId.value + "__form");

const onSaving = (value) => (saving.value = value);
const onSuccessSave = (result) => dialog.value.confirm(result);

const show = () => dialog.value.show();

defineExpose({
  show,
});
</script>
