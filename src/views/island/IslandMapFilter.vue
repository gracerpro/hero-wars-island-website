<template>
  <div class="row">
    <div class="col-md-6">
      <label :for="formId + '__itemName'" class="form-label">{{
        t("common.resource")
      }}</label>
      <text-input
        :modelValue="itemName"
        :modelModifiers="{ trim: true }"
        :input-id="formId + '__itemName'"
        @update:model-value="onUpdateName"
      />
      <div class="form-text fw-normal">
        {{ t("common.needEnterAtLeastCharacters", { n: minCharsCount }) }}
      </div>
    </div>
    <div class="col-md-6">
      <label :for="formId + '__typeId'" class="form-label">{{
        t("common.type")
      }}</label>
      <clear-select
        :modelValue="typeId"
        :input-id="formId + '__typeId'"
        :select-values="getLabelsByTypes()"
        @update:model-value="onChangeType"
      />
    </div>
  </div>
</template>
<script>
const EVENT_UPDATE_ITEM_NAME = "update:item-name";
const EVENT_UPDATE_TYPE = "update:type-id";
</script>
<script setup>
import TextInput from "@/components/TextInput.vue";
import ClearSelect from "@/components/ClearSelect.vue";
import { getLabelsByTypes } from "@/api/item";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const formId = "nodesForm";

defineProps({
  itemName: { type: String, required: true },
  typeId: { type: [Number, null], required: true },
  minCharsCount: { type: Number, required: true },
});
const emit = defineEmits([EVENT_UPDATE_ITEM_NAME, EVENT_UPDATE_TYPE]);

const onUpdateName = (name) => {
  emit(EVENT_UPDATE_ITEM_NAME, name);
};
const onChangeType = (typeId) => {
  emit(EVENT_UPDATE_TYPE, typeId);
};
</script>
