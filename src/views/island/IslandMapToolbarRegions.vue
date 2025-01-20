<script>
const EVENT_UPDATE_REGION_NUMBERS = "update:region-numbers";
const EVENT_RESET_REGION_NUMBERS = "reset-region-numbers";
</script>
<script setup>
import { useI18n } from "vue-i18n";
import { getRegionTitle } from "./island";

const { t } = useI18n();

const props = defineProps({
  regions: { type: Array, required: true },
  regionNumbers: { type: Array, required: true },
  loading: { type: Boolean, required: true },
});
const emit = defineEmits([EVENT_UPDATE_REGION_NUMBERS, EVENT_RESET_REGION_NUMBERS]);

function onChangeNumber(region) {
  if (!region.isVisible) {
    return;
  }
  const numbers = props.regionNumbers;
  const index = numbers.indexOf(region.number);

  if (index >= 0) {
    numbers.splice(index, 1);
  } else {
    numbers.push(region.number);
  }

  emit(EVENT_UPDATE_REGION_NUMBERS, numbers);
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
      @click="emit(EVENT_RESET_REGION_NUMBERS)"
    >
      <span class="btn-close"></span>
    </button>
  </div>
</template>
