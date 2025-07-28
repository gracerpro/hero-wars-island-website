<script setup lang="ts">
import ModalDialog from "@/components/ModalDialog.vue";
import { computed, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { useShow } from "@/components/modal-dialog";
import { getStatusName, getTypeName } from "@/api/NodeApi";
import { getTypeName as getItemTypeName } from "@/api/ItemApi";
import type { ComponentExposed } from "vue-component-type-helpers";

interface Props {
  drawedNode: { type: Object, required: true },
}

const props = defineProps<Props>();

const { t } = useI18n();

const dialogRef = useTemplateRef<ComponentExposed<typeof ModalDialog>>("dialogRef");

const { show, onMountedDialog } = useShow(dialogRef);

const hasRewards = computed(
  () => props.drawedNode.node.items && props.drawedNode.node.items.length > 0
);
const dialogId = computed(() => "island-map-info-dialog")
const formId = computed(() => dialogId.value + "__form")

defineExpose({
  show,
});
</script>

<template>
  <suspense>
    <modal-dialog
      ref="dialogRef"
      :form-id="formId"
      :element-id="dialogId"
      :is-show-submit="false"
      :header="t('common.cell')"
      @vue:mounted="onMountedDialog"
    >
      <div>ID = {{ drawedNode.node.id }}</div>
      <div>X = {{ drawedNode.node.mx }}, Y = {{ drawedNode.node.my }}</div>
      <div>
        status: {{ getStatusName(t, drawedNode.node.statusId) }}, id =
        {{ drawedNode.node.statusId }}
      </div>
      <div>type: {{ getTypeName(drawedNode.node.typeId) }}, id = {{ drawedNode.node.typeId }}</div>

      <h4 class="mt-3 mb-0">Rewards</h4>
      <div v-if="!hasRewards">No</div>
      <ul
        v-else
        class="mb-0"
      >
        <li
          v-for="reward in drawedNode.node.items"
          :key="reward.id"
          class="reward-item"
        >
          <div class="row">
            <div class="col-md-4">
              <b>Server</b><br />
              ID: {{ reward.id }}<br />
              name: {{ reward.name }}<br />
              type: {{ getItemTypeName(reward.type, t) }}, id = {{ reward.typeId }}<br />
              quantity: {{ reward.quantity }}<br />
            </div>
            <div class="col-md-4">
              <b>Game</b><br />
              ID: {{ reward.gameId }}<br />
              type: {{ reward.gameType }}
            </div>
          </div>
        </li>
      </ul>
    </modal-dialog>
  </suspense>
</template>

<style scoped>
.reward-item {
  margin-bottom: 8px;
}
.reward-item:last-child {
  margin-bottom: 0;
}
</style>
