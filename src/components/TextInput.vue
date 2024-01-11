<template>
  <div class="input-group">
    <input :value="value" type="text" class="form-control" @input="onInput" />
    <span class="input-group-text">
      <button
        type="button"
        class="btn-close"
        aria-label="Close"
        @click="onClear"
      ></button>
    </span>
  </div>
</template>
<script>
const EVENT_UPDATE_VALUE = "update:value";

export default {
  name: "TextInput",
  props: {
    inputId: { type: String, required: true },
    value: { type: String, default: "" },
  },
  emits: [EVENT_UPDATE_VALUE],
  methods: {
    onInput(event) {
      this.$emit(EVENT_UPDATE_VALUE, event.target.value);
    },
    onClear() {
      this.$emit(EVENT_UPDATE_VALUE, "");
    },
  },
};
</script>
