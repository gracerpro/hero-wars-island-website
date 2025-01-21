<script>
const EVENT_UPDATE_IS_SELECT_ANY_NODE = "update:is-select-any-node";
const EVENT_RESET_USER_NODES = "reset-user-nodes";
const EVENT_RESET_DISABLE_NODES = "reset-disable-nodes";
const EVENT_UPDATE_SELECT_MODE = "update:select-mode";
</script>
<script setup>
import { createI18nRouteTo } from "@/i18n/translation";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { SELECT_MODE_DISABLE, SELECT_MODE_GOING, SELECT_MODE_PLAN } from "./select-mode";

const { t } = useI18n();

const props = defineProps({
  selectMode: { type: String, required: true },
  isSelectAnyNode: { type: Boolean, required: true },
  explorerMoveCount: { type: Number, required: true },
  totalExplorerMoveCount: { type: Number, required: true },
  disableNodesCount: { type: Number, required: true },
  woodMoveCount: { type: Number, required: true },
  totalWoodMoveCount: { type: Number, required: true },
});

const emit = defineEmits([
  EVENT_UPDATE_IS_SELECT_ANY_NODE,
  EVENT_RESET_USER_NODES,
  EVENT_UPDATE_SELECT_MODE,
  EVENT_RESET_DISABLE_NODES,
]);

const selectModes = computed(() => {
  return [
    { value: SELECT_MODE_PLAN, label: t("page.island.planning") },
    { value: SELECT_MODE_GOING, label: t("page.island.going") },
    { value: SELECT_MODE_DISABLE, label: t("page.island.exclusion") },
  ];
});
const selectModeHint = computed(() => {
  switch (props.selectMode) {
    case SELECT_MODE_PLAN:
      return t("page.island.canSelectAnyNode");
    case SELECT_MODE_GOING:
      return t("page.island.canSelectOnlyPlannedNode");
    case SELECT_MODE_DISABLE:
      return t("page.island.makeExcludedCellDescr");
  }
  return "";
});

function onChangeIsSelectAnyNode(event) {
  emit(EVENT_UPDATE_IS_SELECT_ANY_NODE, event.target.checked);
}

function onChangeSelectMode(event) {
  emit(EVENT_UPDATE_SELECT_MODE, event.target.value);
}
</script>

<template>
  <div class="row">
    <div class="col-sm-6">
      <div>
        {{ t("page.island.myExplorersMoves") }}
      </div>
      <div>
        <span class="d-inline-block mb-1">
          <span
            class="hero-icon item-explorer-move align-middle me-3"
            :title="t('item.explorerMove')"
          />
          <span class="fs-4 align-middle">
            <b>{{ explorerMoveCount }}</b> / {{ totalExplorerMoveCount }}
          </span>
        </span>
        <br />
        <span class="d-inline-block">
          <span
            class="hero-icon item-wood align-middle me-3"
            :title="t('item.wood')"
          ></span>
          <span class="fs-4 align-middle">
            <b>{{ woodMoveCount }}</b> / {{ totalWoodMoveCount }}
          </span>
        </span>
      </div>
      <div class="mb-3">
        <button
          type="button"
          :class="['btn btn-secondary mt-1', explorerMoveCount > 0 ? '' : 'disabled']"
          @click="emit(EVENT_RESET_USER_NODES)"
        >
          {{ t("common.reset") }}
        </button>
      </div>
      <div>
        {{ t("page.island.excludedCells") }} <b class="fs-4">{{ disableNodesCount }}</b>
      </div>
      <div class="mb-3">
        <button
          type="button"
          :class="['btn btn-secondary mt-1', disableNodesCount > 0 ? '' : 'disabled']"
          @click="emit(EVENT_RESET_DISABLE_NODES)"
        >
          {{ t("common.reset") }}
        </button>
      </div>
    </div>
    <div class="col-sm-6 mb-3">
      <label
        v-for="mode in selectModes"
        :key="mode.value"
        class="me-2"
      >
        <input
          type="radio"
          :value="mode.value"
          :checked="selectMode === mode.value"
          @change="onChangeSelectMode"
        />
        {{ mode.label }}
      </label>
      <div class="fst-italic text-secondary small">{{ selectModeHint }}</div>
    </div>
    <div class="col-sm-6">
      <label class="d-block mb-3">
        <input
          type="checkbox"
          :checked="isSelectAnyNode"
          @change="onChangeIsSelectAnyNode"
        />
        {{ t("common.selectAnyNodeQuestion") }}
      </label>
    </div>
    <div class="col-sm-6 text-end">
      <router-link
        :to="createI18nRouteTo({ name: 'contact' })"
        class="d-block mb-3"
        >{{ t("common.haveErrosOrProposal") }}</router-link
      >
    </div>
  </div>
</template>

<style scoped>
.tmp-icon {
  display: inline-block;
  width: 32px;
  height: 32px;
  outline: 1px solid #ddd;
  margin-right: 8px;
  vertical-align: middle;
}
</style>
