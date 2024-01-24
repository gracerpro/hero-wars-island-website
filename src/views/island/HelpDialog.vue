<template>
  <modal-dialog
    :element-id="dialogId"
    :is-show-submit="false"
    :header="t('common.map')"
    ref="dialog"
  >
    <p>
      {{ t("page.island.helpParagraph1") }}<br />
      {{ t("page.island.helpParagraph2") }}
    </p>
    <h4>{{ t("common.node", 2) }}</h4>
    <ul class="list-unstyled">
      <li>
        <span class="node-box node-start"></span>{{ t("common.startNode") }}
      </li>
      <li>
        <span class="node-box node"></span>{{ t("page.island.oneResource") }}
      </li>
      <li><span class="node-box node-town"></span>{{ t("common.tower") }}</li>
      <li><span class="node-box node-chest"></span>{{ t("common.chest") }}</li>
    </ul>
    <h4>{{ t("common.help") }}</h4>
    <p class="mb-0">{{ t("page.island.helpOnQuestion") }}</p>
    <ul class="mb-0">
      <li>{{ t("page.island.helpResource1") }}</li>
      <li>{{ t("page.island.helpResource2") }}</li>
    </ul>
  </modal-dialog>
</template>
<script setup>
import ModalDialog from "@/components/ModalDialog.vue";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const dialogId = "node-help-dialog";

const dialog = ref(null);

const show = () => dialog.value.show();

defineExpose({
  show,
});
</script>
<style scoped>
.node-box {
  display: inline-block;
  width: 2em;
  height: 1em;
  border: 1px solid #dddddd;
  vertical-align: middle;
  margin-right: 0.5em;
}
.node {
  background-color: #9da7c9;
}
.node-start {
  background-color: #a6f3fd;
}
.node-town {
  background-color: #94440e;
}
.node-chest {
  background-color: #1a660b;
}
</style>
