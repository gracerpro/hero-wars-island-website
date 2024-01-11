<template>
  <div>
    <label :for="formId + '__itemName'" class="form-label">Ресурс</label>
    <text-input
      :value="itemName"
      :input-id="formId + '__itemName'"
      @update:value="onUpdateName"
    />
    <div class="form-text fw-normal">
      Нужно ввести от {{ minCharsCount }} символов
    </div>
  </div>
</template>
<script>
const EVENT_UPDATE_ITEM_NAME = "update:itemName";
import TextInput from "@/components/TextInput.vue";

export default {
  name: "MapFilter",
  components: { TextInput },
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
    onUpdateName(name) {
      this.$emit(EVENT_UPDATE_ITEM_NAME, name.trim());
    },
  },
};
</script>
