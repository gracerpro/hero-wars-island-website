<template>
  <div class="row">
    <div class="col-md-6">
      <label :for="formId + '__itemName'" class="form-label">Ресурс</label>
      <text-input
        :modelValue="itemName"
        :modelModifiers="{ trim: true }"
        :input-id="formId + '__itemName'"
        @update:model-value="onUpdateName"
      />
      <div class="form-text fw-normal">
        Нужно ввести от {{ minCharsCount }} символов
      </div>
    </div>
    <div class="col-md-6">
      <label :for="formId + '__typeId'" class="form-label">Тип</label>
      <clear-select
        :modelValue="typeId"
        :input-id="formId + '__typeId'"
        :select-values="types"
        @update:model-value="onChangeType"
      />
    </div>
  </div>
</template>
<script>
import TextInput from "@/components/TextInput.vue";
import ClearSelect from "@/components/ClearSelect.vue";
import { getLabelsByTypes } from "@/api/item";

const EVENT_UPDATE_ITEM_NAME = "update:item-name";
const EVENT_UPDATE_TYPE = "update:type-id";

export default {
  name: "IslandMapFilter",
  components: { TextInput, ClearSelect },
  props: {
    itemName: { type: String, required: true },
    typeId: { type: [Number, null], required: true },
    minCharsCount: { type: Number, required: true },
  },
  emits: [EVENT_UPDATE_ITEM_NAME, EVENT_UPDATE_TYPE],
  computed: {
    formId() {
      return "nodesForm";
    },
    types() {
      return getLabelsByTypes();
    },
  },
  methods: {
    onUpdateName(name) {
      this.$emit(EVENT_UPDATE_ITEM_NAME, name);
    },
    onChangeType(typeId) {
      this.$emit(EVENT_UPDATE_TYPE, typeId);
    },
  },
};
</script>
