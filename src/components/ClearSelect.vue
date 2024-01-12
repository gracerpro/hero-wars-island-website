<template>
  <div class="input-group">
    <select :id="inputId" @change="onChange" class="form-select">
      <option value=""></option>
      <option
        v-for="(name, id) in selectValues"
        :key="id"
        :value="id"
        :selected="value == id"
      >
        {{ name }}
      </option>
    </select>
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
  name: "ClearSelect",
  props: {
    inputId: { type: String, required: true },
    selectValues: { type: Object, required: true },
    value: { type: [Number, null], default: null },
  },
  emits: [EVENT_UPDATE_VALUE],
  methods: {
    onChange(event) {
      this.$emit(
        EVENT_UPDATE_VALUE,
        event.target.value === "" ? null : parseInt(event.target.value)
      );
    },
    onClear() {
      this.$emit(EVENT_UPDATE_VALUE, null);
    },
  },
};
</script>
