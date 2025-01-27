<script setup>
import ModalDialog from "@/components/ModalDialog.vue";
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useShow } from "@/components/modal-dialog";
import { getStatusName, getTypeName } from "@/api/Node";
import { getLabelsByTypes } from "@/api/Item";

const props = defineProps({
  drawedNode: { type: Object, required: true },
});

const { t } = useI18n();
const labelsByTypes = getLabelsByTypes(t);

const dialog = ref(null);

const { show, onMountedDialog } = useShow(dialog);

const hasRewards = computed(
  () => props.drawedNode.node.items && props.drawedNode.node.items.length > 0
);

/**
 * @param {String} typeId
 * @returns {String}
 */
function getRewardTypeName(typeId) {
  return labelsByTypes[typeId] ?? "";
}

defineExpose({
  show,
});
</script>

<template>
  <suspense>
    <modal-dialog
      ref="dialog"
      element-id="island-map-info-dialog"
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
              type: {{ getRewardTypeName(reward.typeId) }}, id = {{ reward.typeId }}<br />
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
