<template>
  <suspense>
    <modal-dialog
      ref="dialog"
      element-id="island-map-help-dialog"
      :is-show-submit="false"
      :header="t('common.map')"
      @vue:mounted="onMountedDialog"
    >
      <p>
        {{ t("page.island.helpParagraph1") }}<br />
        {{ t("page.island.helpParagraph2") }}<br />
        {{ t("page.island.keyboardParagraph") }}<br />
        {{ t("page.island.helpFullscreenExit") }}<br />
        {{ t("page.island.helpKeyboard") }}<br />
      </p>
      <h4>{{ t("common.node", 2) }}</h4>
      <ul class="list-unstyled">
        <li><span class="node-box node-start"></span>{{ t("common.startNode") }}</li>
        <li><span class="node-box node"></span>{{ t("page.island.oneResource") }}</li>
        <li><span class="node-box node-tower"></span>{{ t("common.tower") }}</li>
        <li><span class="node-box node-wood"></span>{{ t("common.wood") }}</li>
        <li><span class="node-box node-chest"></span>{{ t("common.chest") }}</li>
        <li><span class="node-box node-blocker"></span>{{ t("common.blockerExNames") }}</li>
        <li><span class="node-box -warning"></span>{{ t("common.warningCellDescription") }}</li>
        <li><span class="node-box node-bubble"></span>Bubble</li>
      </ul>
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
  background-color: #94fdfe;
}
.node-tower {
  background-color: #ba662c;
}
.node-wood {
  background-color: #773e23;
}
.node-bubble {
  background-color: #deb28d;
}
.node-chest {
  background-color: #1a660b;
}
.node-blocker {
  background-color: #867878;
}
.-warning {
  background-color: yellow;
}
</style>
