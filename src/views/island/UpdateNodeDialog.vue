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
<script>
import ModalDialog from "@/components/ModalDialog.vue";
import NodeForm from "./NodeForm.vue";

const EVENT_MOUNTED = "mounted";

export default {
  name: "UpdateNodeDialog",
  components: { ModalDialog, NodeForm },
  props: {
    node: { type: Object, required: true },
  },
  emits: [EVENT_MOUNTED],
  data: function () {
    return {
      saving: false,
    };
  },
  computed: {
    dialogId() {
      return "node-dialog__" + this.node.id;
    },
    formId() {
      return this.dialogId + "__form";
    },
  },
  mounted() {
    this.$emit(EVENT_MOUNTED);
  },
  methods: {
    show() {
      return this.$refs.dialog.show();
    },
    onSaving(value) {
      this.saving = value;
    },
    onSuccessSave(result) {
      this.$refs.dialog.confirm(result);
    },
  },
};
</script>
