<template>
  <div class="row">
    <div class="col-md-6">
      <label
        :for="formId + '__itemName'"
        class="form-label"
        >{{ t("common.resource") }}</label
      >
      <text-input
        :model-value="itemName"
        :model-modifiers="{ trim: true }"
        :input-id="formId + '__itemName'"
        @update:model-value="onUpdateName"
      />
      <div class="form-text fw-normal">
        {{ t("common.needEnterAtLeastCharacters", { n: minCharsCount }) }}
      </div>
    </div>
    <div class="col-md-6">
      <label
        :for="formId + '__typeId'"
        class="form-label"
        >{{ t("common.type") }}</label
      >
      <clear-select
        :model-value="typeId"
        :input-id="formId + '__typeId'"
        :select-values="visibleTypes"
        @update:model-value="onChangeType"
      />
    </div>
    <div class="col-md-6 mt-3">
      <div class="form-check form-check-inline">
        <input
          :id="formId + '__nodeTypeTower'"
          class="form-check-input"
          type="checkbox"
          :value="TYPE_TOWER"
          :checked="isNodeTypeTower"
          @change="onChangeNodeType"
        />
        <label
          class="form-check-label"
          :for="formId + '__nodeTypeTower'"
          >{{ t("common.tower") }}</label
        >
      </div>
      <div class="form-check form-check-inline">
        <input
          :id="formId + '__nodeTypeChest'"
          class="form-check-input"
          type="checkbox"
          :value="TYPE_CHEST"
          :checked="isNodeTypeChest"
          @change="onChangeNodeType"
        />
        <label
          class="form-check-label"
          :for="formId + '__nodeTypeChest'"
          >{{ t("common.chest") }}</label
        >
      </div>
    </div>
    <div
      v-if="regions.length"
      class="col-md-6"
    >
      <label
        :for="formId + '__regionNumber'"
        class="form-label"
        >{{ t("common.regionNumber") }}</label
      >
      <clear-select
        :model-value="regionNumber"
        :input-id="formId + '__regionNumber'"
        :select-values="visibleRegions"
        @update:model-value="onChangeRegionNumber"
      />
    </div>
  </div>
</template>
<script>
const EVENT_UPDATE_ITEM_NAME = "update:item-name";
const EVENT_UPDATE_TYPE = "update:type-id";
const EVENT_UPDATE_IS_NODE_TYPE_TOWER = "update:is-node-type-tower";
const EVENT_UPDATE_IS_NODE_TYPE_CHEST = "update:is-node-type-chest";
const EVENT_UPDATE_REGION_NUMBER = "update:region-number";
</script>
<script setup>
import TextInput from "@/components/TextInput.vue";
import ClearSelect from "@/components/ClearSelect.vue";
import { getLabelsByTypes } from "@/api/Item";
import { useI18n } from "vue-i18n";
import { TYPE_CHEST, TYPE_TOWER } from "@/api/Node";
import { computed } from "vue";

const { t } = useI18n();

const formId = "nodesForm";

const props = defineProps({
  items: { type: Object, required: true },
  itemName: { type: String, required: true },
  typeId: { type: [Number, null], required: true },
  isNodeTypeTower: { type: Boolean, required: true },
  isNodeTypeChest: { type: Boolean, required: true },
  minCharsCount: { type: Number, required: true },
  regionNumber: { type: [Number, null], required: false, default: () => 0 },
  regions: { type: Array, required: false, default: () => [] },
});
const emit = defineEmits([
  EVENT_UPDATE_ITEM_NAME,
  EVENT_UPDATE_TYPE,
  EVENT_UPDATE_IS_NODE_TYPE_TOWER,
  EVENT_UPDATE_IS_NODE_TYPE_CHEST,
  EVENT_UPDATE_REGION_NUMBER,
]);

const visibleTypes = computed(() => {
  const map = {};
  const labels = getLabelsByTypes(t);

  props.items.forEach((item) => {
    map[item.item.typeId] = true;
  });

  const types = {};
  Object.keys(map).forEach((typeId) => {
    if (typeId > 0) {
      types[typeId] = labels[typeId];
    }
  });

  return types;
});
const visibleRegions = computed(() => {
  let result = {};

  props.regions.forEach((region) => {
    result[region.number] = region.number;
  });

  return result;
});

const onUpdateName = (name) => {
  emit(EVENT_UPDATE_ITEM_NAME, name);
};
const onChangeType = (typeId) => {
  emit(EVENT_UPDATE_TYPE, typeId);
};
const onChangeNodeType = (event) => {
  const typeId = parseInt(event.target.value);

  if (typeId === TYPE_TOWER) {
    emit(EVENT_UPDATE_IS_NODE_TYPE_TOWER, event.target.checked);
  }
  if (typeId === TYPE_CHEST) {
    emit(EVENT_UPDATE_IS_NODE_TYPE_CHEST, event.target.checked);
  }
};
function onChangeRegionNumber(regionNumber) {
  emit(EVENT_UPDATE_REGION_NUMBER, regionNumber);
}
</script>
