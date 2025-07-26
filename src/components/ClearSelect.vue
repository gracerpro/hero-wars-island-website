<script>
const EVENT_UPDATE_VALUE = "update:model-value";
</script>
<script setup lang="ts">
import { computed } from "vue";
import type { SelectItemMap } from "./select";

interface Props {
  inputId: string,
  selectValues: SelectItemMap,
  modelValue: number | null,
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
});
const emit = defineEmits<{
  [EVENT_UPDATE_VALUE]: [value: number | null]
}>();

const isDisabled = computed(() => props.modelValue === null || props.modelValue === 0);

const onChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit(EVENT_UPDATE_VALUE, target.value === "" ? null : parseInt(target.value));
};
const onClear = () => {
  emit(EVENT_UPDATE_VALUE, null);
};
</script>

<template>
  <div class="input-group">
    <select
      :id="inputId"
      class="form-select"
      @change="onChange"
    >
      <option value=""></option>
      <option
        v-for="(name, id) in selectValues"
        :key="id"
        :value="id"
        :selected="modelValue === id"
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
        @click="onClear"
      ></button>
    </span>
  </div>
</template>
