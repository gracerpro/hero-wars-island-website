<template>
  <div class="row">
    <div class="col-md-6">
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
    <div class="col-md-6">
      <label :for="formId + '__typeId'" class="form-label">Тип</label>
      <select
        :id="formId + '__typeId'"
        @change="onChangeType"
        class="form-select"
      >
        <option value=""></option>
        <option v-for="(name, typeId) in types" :key="typeId" :value="typeId">
          {{ name }}
        </option>
      </select>
    </div>
  </div>
</template>
<script>
import TextInput from "@/components/TextInput.vue";
import { getLabelsByTypes } from "@/api/item";

const EVENT_UPDATE_ITEM_NAME = "update:item-name";
const EVENT_UPDATE_TYPE = "update:type-id";

export default {
  name: "MapFilter",
  components: { TextInput },
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
      this.$emit(EVENT_UPDATE_ITEM_NAME, name.trim());
    },
    onChangeType(event) {
      this.$emit(
        EVENT_UPDATE_TYPE,
        event.target.value === "" ? null : parseInt(event.target.value)
      );
    },
  },
};
</script>
