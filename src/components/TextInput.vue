<script>
const EVENT_UPDATE_VALUE = "update:model-value";
</script>
<script setup lang="ts">
/* global Event */
/* global HTMLInputElement  */

interface Props {
  inputId: string,
  modelValue?: string,
  modelModifiers?: object,
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  modelModifiers: () => ({})
});
const emit = defineEmits([EVENT_UPDATE_VALUE]);

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value;

  if ("trim" in props.modelModifiers) {
    value = value.trim();
  }

  emit(EVENT_UPDATE_VALUE, value);
};
const onClear = () => {
  emit(EVENT_UPDATE_VALUE, "");
};
</script>

<template>
  <div class="input-group">
    <input
      :id="inputId"
      :value="modelValue"
      type="text"
      class="form-control"
      @input="onInput"
    />
    <span class="input-group-text">
      <button
        type="button"
        class="btn-close"
        aria-label="Close"
        :disabled="modelValue === ''"
        @click="onClear"
      ></button>
    </span>
  </div>
</template>
