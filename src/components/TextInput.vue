<template>
  <div class="input-group">
    <input
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
<script>
const EVENT_UPDATE_VALUE = "update:model-value";

export default {
  name: "TextInput",
  props: {
    inputId: { type: String, required: true },
    modelValue: { type: String, default: "" },
    modelModifiers: {
      default: () => ({}),
    },
  },
  emits: [EVENT_UPDATE_VALUE],
  methods: {
    onInput(event) {
      let value = event.target.value;

      if (this.modelModifiers.trim) {
        value = value.trim();
      }

      this.$emit(EVENT_UPDATE_VALUE, value);
    },
    onClear() {
      this.$emit(EVENT_UPDATE_VALUE, "");
    },
  },
};
</script>
