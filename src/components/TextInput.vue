<template>
  <div class="input-group">
    <input
      :value="modelValue"
      :id="inputId"
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
<script>
const EVENT_UPDATE_VALUE = "update:model-value";
</script>
<script setup>
const props = defineProps({
  inputId: { type: String, required: true },
  modelValue: { type: String, default: "" },
  modelModifiers: {
    default: () => ({}),
  },
});
const emit = defineEmits([EVENT_UPDATE_VALUE]);

const onInput = (event) => {
  let value = event.target.value;

  if (props.modelModifiers.trim) {
    value = value.trim();
  }

  emit(EVENT_UPDATE_VALUE, value);
};
const onClear = () => {
  emit(EVENT_UPDATE_VALUE, "");
};
</script>
