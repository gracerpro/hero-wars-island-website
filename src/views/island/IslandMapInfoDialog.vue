<script setup lang="ts">
import ModalDialog from '@/components/ModalDialog.vue'
import { computed, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useShow } from '@/components/modal-dialog'
import { getStatusName, getTypeName, type NodeReward } from '@/api/NodeApi'
import {
  getTypeName as getItemTypeName,
  getUnknownItem,
  type Item,
  type ItemMap,
} from '@/api/ItemApi'
import type { ComponentExposed } from 'vue-component-type-helpers'
import type { DrawedNode } from './map'

interface Props {
  drawedNode: DrawedNode
  originRewards: ItemMap
}

interface LocalReward extends NodeReward {
  item: Item
}

const props = defineProps<Props>()

const { t } = useI18n()

const dialogRef = useTemplateRef<ComponentExposed<typeof ModalDialog>>('dialogRef')

const { show, onMountedDialog } = useShow(dialogRef)

const hasRewards = computed(() => props.drawedNode.node.rewards.length > 0)
const dialogId = computed(() => 'island-map-info-dialog')
const formId = computed(() => dialogId.value + '__form')

const rewards = computed<Array<LocalReward>>(() => {
  return props.drawedNode.node.rewards.map((nodeReward) => {
    return {
      ...nodeReward,
      item: props.originRewards[nodeReward.itemId] ?? getUnknownItem(),
    }
  })
})

defineExpose({
  show,
})
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
        status: {{ getStatusName(t, drawedNode.node.status) }}, id =
        {{ drawedNode.node.status }}
      </div>
      <div>type: {{ getTypeName(drawedNode.node.type) }}, id = {{ drawedNode.node.type }}</div>

      <h4 class="mt-3 mb-0">Rewards</h4>
      <div v-if="!hasRewards">No</div>
      <ul
        v-else
        class="mb-0"
      >
        <li
          v-for="reward in rewards"
          :key="reward.itemId"
          class="reward-item"
        >
          <div class="row">
            <div class="col-md-4">
              <b>Server</b><br />
              ID: {{ reward.itemId }}<br />
              name: {{ reward.item.name }}<br />
              type: {{ getItemTypeName(reward.item.type, t) }}, id = {{ reward.item.type }}<br />
              quantity: {{ reward.quantity }}<br />
            </div>
            <div class="col-md-4">
              <b>Game</b><br />
              ID: {{ reward.item.gameId }}<br />
              type: {{ reward.item.gameType }}
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
