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
        :selected="modelValue == id"
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
<script>
const EVENT_UPDATE_VALUE = "update:model-value";
</script>
<script setup>
import { computed } from "vue";

const props = defineProps({
  inputId: { type: String, required: true },
  selectValues: { type: Object, required: true },
  modelValue: { type: [Number, null], default: null },
});
const emit = defineEmits([EVENT_UPDATE_VALUE]);

const isDisabled = computed(() => props.modelValue === null || props.modelValue === 0);

const onChange = (event) => {
  emit(EVENT_UPDATE_VALUE, event.target.value === "" ? null : parseInt(event.target.value));
};
const onClear = () => {
  emit(EVENT_UPDATE_VALUE, null);
};
</script>
