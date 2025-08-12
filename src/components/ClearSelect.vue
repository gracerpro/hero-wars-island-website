<script setup lang="ts">
import { computed } from 'vue'
import type { SelectItemMap } from './select'

interface Props {
  inputId: string
  selectValues: SelectItemMap
}

defineProps<Props>()

const modelValue = defineModel<number | null>({
  default: null,
  set(value: string | number | null) {
    return value === '' ? null : value
  },
})

const isDisabled = computed(() => modelValue.value === null || modelValue.value === 0)
</script>

<template>
  <div class="input-group">
    <select
      :id="inputId"
      v-model.number="modelValue"
      class="form-select"
    >
      <option value=""></option>
      <option
        v-for="(name, id) in selectValues"
        :key="id"
        :value="id"
      >
        {{ name }}
      </option>
    </select>
    <span class="input-group-text">
      <button
        type="button"
        class="btn-close"
        aria-label="Close"
        :disabled="isDisabled"
        @click="modelValue = null"
      ></button>
    </span>
  </div>
</template>
