<script setup lang="ts">
import TextInput from '@/components/TextInput.vue'
import ClearSelect from '@/components/ClearSelect.vue'
import { getLabelsByTypes, type Type } from '@/api/ItemApi'
import { useI18n } from 'vue-i18n'
import { Type as NodeType } from '@/api/NodeApi'
import { computed } from 'vue'
import type { SelectItemMap } from '@/components/select'
import type { ViewNodeReward } from './map'

interface Props {
  rewards: Array<ViewNodeReward>
  minCharsCount: number
}

const itemName = defineModel<string>('itemName', { required: true })
const itemType = defineModel<Type | null>('itemType', { required: true })
const isNodeTypeTower = defineModel<boolean>('isNodeTypeTower', { required: true })
const isNodeTypeChest = defineModel<boolean>('isNodeTypeChest', { required: true })

const props = defineProps<Props>()

const { t } = useI18n()
const TYPE_TOWER = NodeType.Tower
const TYPE_CHEST = NodeType.Chest

const formId = 'nodesForm'

const visibleTypes = computed<SelectItemMap>(() => {
  const map = new Map<number, boolean>()
  const labels = getLabelsByTypes(t)

  props.rewards.forEach((reward) => {
    map.set(reward.item.type, true)
  })

  const types: SelectItemMap = {}
  for (const type of map.keys()) {
    if (type > 0) {
      types[type] = labels[type as Type] ?? t('common.unknown')
    }
  }

  return types
})
const isCheckedFlags = computed(() => {
  return isNodeTypeTower.value || isNodeTypeChest.value
})
const filledFilterCount = computed(() => {
  let count = 0

  if (itemType.value !== null) {
    ++count
  }
  if (itemName.value !== '') {
    ++count
  }
  if (isCheckedFlags.value) {
    ++count
  }

  return count
})

function onReset() {
  if (itemType.value !== null) {
    itemType.value = null
  }
  if (itemName.value !== '') {
    itemName.value = ''
  }
  if (isNodeTypeTower.value) {
    isNodeTypeTower.value = false
  }
  if (isNodeTypeChest.value) {
    isNodeTypeChest.value = false
  }
}
</script>

<template>
  <div class="row">
    <div class="col-md-6 mb-3">
      <label
        :for="formId + '__itemName'"
        :class="['form-label', itemName.length > 0 ? 'not-empty' : '']"
        >{{ t('common.resource') }}
        <span
          v-if="itemName !== ''"
          class="badge rounded-pill text-bg-warning"
          >&nbsp;</span
        >
      </label>
      <text-input
        v-model.trim="itemName"
        :input-id="formId + '__itemName'"
        :class="{ 'not-empty': itemName.length > 0 }"
      />
      <div class="form-text fw-normal">
        {{ t('common.needEnterAtLeastCharacters', { n: minCharsCount }) }}
      </div>
    </div>
    <div class="col-md-6 mb-3">
      <label
        :for="formId + '__itemType'"
        :class="['form-label', itemType != null ? 'not-empty' : '']"
      >
        {{ t('common.type') }}
        <span
          v-if="itemType != null"
          class="badge rounded-pill text-bg-warning"
          >&nbsp;</span
        >
      </label>
      <clear-select
        v-model="itemType"
        :input-id="formId + '__itemType'"
        :select-values="visibleTypes"
        :class="{ 'not-empty': itemType != null }"
      />
    </div>
    <div class="col-md-6 mb-3">
      <div class="form-check form-check-inline">
        <input
          :id="formId + '__nodeTypeTower'"
          v-model="isNodeTypeTower"
          class="form-check-input"
          type="checkbox"
          :value="TYPE_TOWER"
        />
        <label
          class="form-check-label"
          :for="formId + '__nodeTypeTower'"
          >{{ t('common.tower') }}</label
        >
      </div>
      <div class="form-check form-check-inline">
        <input
          :id="formId + '__nodeTypeChest'"
          v-model="isNodeTypeChest"
          class="form-check-input"
          type="checkbox"
          :value="TYPE_CHEST"
        />
        <label
          class="form-check-label"
          :for="formId + '__nodeTypeChest'"
          >{{ t('common.chest') }}</label
        >
      </div>
      <span
        v-if="isCheckedFlags"
        class="badge rounded-pill text-bg-warning form-check-not-empty"
        >&nbsp;</span
      >
    </div>
    <div class="col-md-6 mb-3">
      <button
        type="button"
        class="btn btn-secondary"
        :disabled="filledFilterCount === 0"
        @click="onReset"
      >
        {{ t('common.reset') }}
      </button>
    </div>
  </div>
</template>

<style>
.not-empty .badge {
  font-size: 0.5em;
  vertical-align: middle;
}
.form-check-not-empty {
  font-size: 0.6em;
  vertical-align: middle;
}
.not-empty .form-control,
.not-empty .form-select {
  border-color: var(--bs-warning);
}
</style>
