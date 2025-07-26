<script>
const EVENT_UPDATE_ITEM_NAME = "update:item-name";
const EVENT_UPDATE_TYPE = "update:type-id";
const EVENT_UPDATE_IS_NODE_TYPE_TOWER = "update:is-node-type-tower";
const EVENT_UPDATE_IS_NODE_TYPE_CHEST = "update:is-node-type-chest";
</script>
<script setup lang="ts">
import TextInput from "@/components/TextInput.vue";
import ClearSelect from "@/components/ClearSelect.vue";
import { getLabelsByTypes, type Item, type Type } from "@/api/ItemApi";
import { useI18n } from "vue-i18n";
import { TYPE_CHEST, TYPE_TOWER } from "@/api/NodeApi";
import { computed } from "vue";
import type { SelectItemMap } from "@/components/select";

const { t } = useI18n();

const formId = "nodesForm";

interface Props {
  rewards: { type: Object, required: true },
  itemName: string,
  typeId: Type | null,
  isNodeTypeTower: boolean,
  isNodeTypeChest: boolean,
  minCharsCount: number,
}

const props = defineProps<Props>();
const emit = defineEmits([
  EVENT_UPDATE_ITEM_NAME,
  EVENT_UPDATE_TYPE,
  EVENT_UPDATE_IS_NODE_TYPE_TOWER,
  EVENT_UPDATE_IS_NODE_TYPE_CHEST,
]);

const visibleTypes = computed<SelectItemMap>(() => {
  const map = new Map<number, boolean>();
  const labels = getLabelsByTypes(t);

  props.rewards.forEach((item: Item) => {
    map.set(item.item.typeId, true);
  });

  const types: SelectItemMap = {};
  for (const typeId of map.keys()) {
    if (typeId > 0) {
      types[typeId] = labels[typeId];
    }
  }

  return types;
})
const isCheckedFlags = computed(() => {
  return props.isNodeTypeTower || props.isNodeTypeChest;
});
const filledFilterCount = computed(() => {
  let count = 0;

  if (props.typeId !== null) {
    ++count;
  }
  if (props.itemName !== "") {
    ++count;
  }
  if (isCheckedFlags.value) {
    ++count;
  }

  return count;
});

function onUpdateName(name: string) {
  emit(EVENT_UPDATE_ITEM_NAME, name);
}
function onChangeType(typeId: Type) {
  emit(EVENT_UPDATE_TYPE, typeId);
}
function onChangeNodeType(event: Event) {
  const typeId = parseInt(event.target.value);

  if (typeId === TYPE_TOWER) {
    emit(EVENT_UPDATE_IS_NODE_TYPE_TOWER, event.target.checked);
  }
  if (typeId === TYPE_CHEST) {
    emit(EVENT_UPDATE_IS_NODE_TYPE_CHEST, event.target.checked);
  }
}
function onReset() {
  if (props.typeId !== null) {
    emit(EVENT_UPDATE_TYPE, null);
  }
  if (props.itemName !== "") {
    emit(EVENT_UPDATE_ITEM_NAME, "");
  }
  if (props.isNodeTypeTower) {
    emit(EVENT_UPDATE_IS_NODE_TYPE_TOWER, false);
  }
  if (props.isNodeTypeChest) {
    emit(EVENT_UPDATE_IS_NODE_TYPE_CHEST, false);
  }
}
</script>

<template>
  <div class="row">
    <div class="col-md-6 mb-3">
      <label
        :for="formId + '__itemName'"
        :class="['form-label', itemName.length > 0 ? 'not-empty' : '']"
        >{{ t("common.resource") }}
        <span
          v-if="itemName"
          class="badge rounded-pill text-bg-warning"
          >&nbsp;</span
        >
      </label>
      <text-input
        :model-value="itemName"
        :model-modifiers="{ trim: true }"
        :input-id="formId + '__itemName'"
        :class="{ 'not-empty': itemName.length > 0 }"
        @update:model-value="onUpdateName"
      />
      <div class="form-text fw-normal">
        {{ t("common.needEnterAtLeastCharacters", { n: minCharsCount }) }}
      </div>
    </div>
    <div class="col-md-6 mb-3">
      <label
        :for="formId + '__typeId'"
        :class="['form-label', typeId != null ? 'not-empty' : '']"
      >
        {{ t("common.type") }}
        <span
          v-if="typeId != null"
          class="badge rounded-pill text-bg-warning"
          >&nbsp;</span
        >
      </label>
      <clear-select
        :model-value="typeId"
        :input-id="formId + '__typeId'"
        :select-values="visibleTypes"
        :class="{ 'not-empty': typeId != null }"
        @update:model-value="onChangeType"
      />
    </div>
    <div class="col-md-6 mb-3">
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
      <span
        v-if="isCheckedFlags"
        class="badge rounded-pill text-bg-warning form-check-not-empty"
        >&nbsp;</span
      >
    </div>
    <div class="col-md-6 mb-3">
      <button
        type="button"
        class="btn btn-secondary"
        :disabled="filledFilterCount === 0"
        @click="onReset"
      >
        {{ t("common.reset") }}
      </button>
    </div>
  </div>
</template>

<style>
.not-empty .badge {
  font-size: 0.5em;
  vertical-align: middle;
}
.form-check-not-empty {
  font-size: 0.6em;
  vertical-align: middle;
}
.not-empty .form-control,
.not-empty .form-select {
  border-color: var(--bs-warning);
}
</style>
