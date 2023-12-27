<template>
  <div>
    <label :for="formId + '__itemName'" class="form-label">Ресурс</label>
    <input
      :id="formId + '__itemName'"
      class="form-control"
      @input="onInputItemName"
    />
    <div class="form-text fw-normal">
      Нужно ввести от {{ minCharsCount }} символов
    </div>
  </div>
</template>
<script>
const EVENT_UPDATE_ITEM_NAME = "update:itemName";

export default {
  name: "MapFilter",
  props: {
    itemName: { type: String, required: true },
    minCharsCount: { type: Number, required: true },
  },
  emits: [EVENT_UPDATE_ITEM_NAME],
  computed: {
    formId() {
      return "nodesForm";
    },
  },
  methods: {
    onInputItemName(event) {
      this.$emit(EVENT_UPDATE_ITEM_NAME, event.target.value.trim());
    },
  },
};
</script>
