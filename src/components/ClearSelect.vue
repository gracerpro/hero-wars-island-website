<template>
  <div class="input-group">
    <select :id="inputId" @change="onChange" class="form-select">
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

export default {
  name: "ClearSelect",
  props: {
    inputId: { type: String, required: true },
    selectValues: { type: Object, required: true },
    modelValue: { type: [Number, null], default: null },
  },
  emits: [EVENT_UPDATE_VALUE],
  computed: {
    isDisabled() {
      return (this.modelValue === null) | (this.modelValue === 0);
    },
  },
  methods: {
    onChange(event) {
      this.$emit(
        EVENT_UPDATE_VALUE,
        event.target.value === "" ? null : parseInt(event.target.value),
      );
    },
    onClear() {
      this.$emit(EVENT_UPDATE_VALUE, null);
    },
  },
};
</script>
