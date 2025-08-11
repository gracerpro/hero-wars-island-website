<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { getRegionTitle } from './island'
import type { Region } from '@/api/IslandApi'

interface Props {
  regions: Array<Region>
  loading: boolean
}

defineProps<Props>()

const regionNumbers = defineModel<Array<number>>('regionNumbers', { required: true })

const { t } = useI18n()

function onChangeNumber(region: Region) {
  if (!region.isVisible) {
    return
  }
  const numbers = regionNumbers.value
  const index = numbers.indexOf(region.number)

  if (index >= 0) {
    numbers.splice(index, 1)
  } else {
    numbers.push(region.number)
  }

  regionNumbers.value = Array.from(numbers)
}
</script>

<template>
  <div
    class="btn-group mb-3 me-3"
    role="group"
  >
    <button
      v-for="region in regions"
      :key="region.number"
      :class="[
        'btn toolbar-button',
        regionNumbers.includes(region.number) ? 'btn-secondary' : 'btn-outline-secondary',
        region.isVisible ? '' : 'text-secondary',
      ]"
      :disabled="loading"
      :title="getRegionTitle(region)"
      type="button"
      @click="onChangeNumber(region)"
    >
      {{ region.number }}
    </button>
    <button
      type="button"
      class="btn btn-outline-secondary toolbar-button"
      :disabled="loading || regionNumbers.length === 0"
      :title="t('common.reset')"
      @click="regionNumbers = []"
    >
      <span class="btn-close"></span>
    </button>
  </div>
</template>
