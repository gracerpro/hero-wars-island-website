<template>
  <suspense>
    <modal-dialog
      element-id="island-map-download-dialog"
      :header="t('common.download')"
      ref="dialog"
      @vue:mounted="onMountedDialog"
    >
      <p>...</p>
    </modal-dialog>
  </suspense>
</template>
<script setup>
import ModalDialog from "@/components/ModalDialog.vue";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useShow } from "@/components/modal-dialog";

const { t } = useI18n();

const dialog = ref(null);

const { show, onMountedDialog } = useShow(dialog);

defineExpose({
  show,
});
</script>
