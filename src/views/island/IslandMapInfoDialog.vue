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
      <div>status: {{ drawedNode.node.statusId }}</div>
      <div>type: {{ drawedNode.node.typeId }}</div>

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
          ID: {{ reward.id }}<br />
          name: {{ reward.name }}<br />
          type: {{ reward.typeId }}<br />
          quantity: {{ reward.quantity }}<br />
          game ID: {{ reward.gameId }}<br />
          game type: {{ reward.gameType }}
        </li>
      </ul>
    </modal-dialog>
  </suspense>
</template>
<script setup>
import ModalDialog from "@/components/ModalDialog.vue";
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useShow } from "@/components/modal-dialog";

const { t } = useI18n();

const dialog = ref(null);

const { show, onMountedDialog } = useShow(dialog);

const props = defineProps({
  drawedNode: { type: Object, required: true },
});

const hasRewards = computed(
  () => props.drawedNode.node.items && props.drawedNode.node.items.length > 0
);

defineExpose({
  show,
});
</script>
<style scoped>
.reward-item {
  margin-bottom: 8px;
}
.reward-item:last-child {
  margin-bottom: 0;
}
</style>
