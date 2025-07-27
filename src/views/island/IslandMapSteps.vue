<script>
const EVENT_UPDATE_IS_SELECT_ANY_NODE = "update:is-select-any-node";
const EVENT_RESET_USER_NODES = "reset-user-nodes";
const EVENT_RESET_DISABLE_NODES = "reset-disable-nodes";
const EVENT_UPDATE_SELECT_MODE = "update:select-mode";
</script>
<script setup lang="ts">
import { createI18nRouteTo } from "@/i18n/translation";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { SELECT_MODE_DISABLE, SELECT_MODE_GOING, SELECT_MODE_PLAN, type SelectMode } from "./select-mode";
import { defaultCostItem, isCommonStep, isStepType } from "@/api/NodeApi";
import { GAME_ID_EXPLORER_MOVE, GAME_ID_WOOD, TYPE_COIN, TYPE_STARMONEY } from "@/api/ItemApi";
import type { UserNodeIdsMap } from "./map";

interface Props {
  selectMode: SelectMode,
  isSelectAnyNode: boolean,
  disableNodesCount: number,
  nodes: Map<number, Node>,
  userNodesIdsMap: UserNodeIdsMap,
}

const { t } = useI18n();

const props = defineProps<Props>();

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
const userStepCostItems = computed(() => {
  const map = {};

  for (let nodeId in props.userNodesIdsMap) {
    const node = props.nodes[nodeId];
    if (!node) {
      continue;
    }

    const costItem = node.cost ?? defaultCostItem;
    const key = costItem.typeId + "_" + costItem.gameId;

    if (!map[key]) {
      map[key] = {
        typeId: costItem.typeId,
        gameId: costItem.gameId,
        count: 0,
      };
    }
    map[key].count += costItem.count ?? 1;
  }

  return map;
});
const otherStepCostItems = computed(() => {
  const result = {};

  for (const key in userStepCostItems.value) {
    const item = userStepCostItems.value[key];

    if (!isCommonStep(item)) {
      let icon = null;

      if (item.typeId === TYPE_STARMONEY) {
        icon = "item-emerald";
      }

      result[key] = {
        ...item,
        icon,
      };
    }
  }

  return result;
});
const explorerMoveCount = computed(
  () => userStepCostItems.value[TYPE_COIN + "_" + GAME_ID_EXPLORER_MOVE]?.count ?? 0
);
const woodMoveCount = computed(
  () => userStepCostItems.value[TYPE_COIN + "_" + GAME_ID_WOOD]?.count ?? 0
);
const totalWoodMoveCount = computed(() => {
  let result = 0;

  for (const nodeId in props.nodes) {
    const node = props.nodes[nodeId];

    if (node.cost) {
      if (node.cost.typeId === TYPE_COIN && node.cost.gameId == GAME_ID_WOOD) {
        ++result;
      }
    }
  }

  return result;
});
const totalExplorerMoveCount = computed(() => {
  let result = 0;

  for (const nodeId in props.nodes) {
    const node = props.nodes[nodeId];

    if (!node.cost) {
      if (isStepType(node.typeId)) {
        ++result;
      }
    } else if (node.cost.typeId === TYPE_COIN && node.cost.gameId == GAME_ID_EXPLORER_MOVE) {
      ++result;
    }
  }

  return result;
});

function onChangeIsSelectAnyNode(event: Event) {
  emit(EVENT_UPDATE_IS_SELECT_ANY_NODE, (event.target as HTMLInputElement).checked);
}

function onChangeSelectMode(event: Event) {
  emit(EVENT_UPDATE_SELECT_MODE, (event.target as HTMLInputElement).value);
}
</script>

<template>
  <div class="row">
    <div class="col-sm-6">
      <div>
        {{ t("page.island.myExplorersMoves") }}
      </div>
      <div>
        <div class="mb-1">
          <span
            class="hero-color-icon item-explorer-move align-middle me-3"
            :title="t('item.explorerMove')"
          />
          <span class="fs-4 align-middle">
            <b>{{ explorerMoveCount }}</b> / {{ totalExplorerMoveCount }}
          </span>
        </div>
        <div
          v-if="woodMoveCount > 0"
          class="mb-1"
        >
          <span
            class="hero-color-icon item-wood align-middle me-3"
            :title="t('item.wood')"
          ></span>
          <span class="fs-4 align-middle">
            <b>{{ woodMoveCount }}</b> / {{ totalWoodMoveCount }}
          </span>
        </div>
        <div
          v-for="(item, key) in otherStepCostItems"
          :key="key"
          class="mb-1"
        >
          <span class="d-inline-block">
            <span
              v-if="item.icon"
              :class="['hero-color-icon align-middle me-3', item.icon]"
              :title="'typeId = ' + item.typeId + ' gameId = ' + item.gameId"
            ></span>
            <span
              v-else
              class="hero-color-icon align-middle me-3"
              :title="'typeId = ' + item.typeId + ' gameId = ' + item.gameId"
            ></span>
            <span class="fs-4 align-middle">
              <b>{{ item.count }}</b>
            </span>
          </span>
        </div>
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
