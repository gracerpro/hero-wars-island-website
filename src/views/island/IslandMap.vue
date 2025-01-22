<script setup>
import IslandMapLoading from "./IslandMapLoading.vue";
import IslandMapToolbar from "./IslandMapToolbar.vue";
import IslandMapSteps from "./IslandMapSteps.vue";
import IslandMapContainer from "./IslandMapContainer.vue";
import IslandMapDownloadDialog from "./IslandMapDownloadDialog.vue";
import IslandMapFilter from "./IslandMapFilter.vue";
import IslandMapTable from "./IslandMapTable.vue";
import { canSelectNode } from "@/services/island-map";
import { onMounted, onUnmounted, ref, computed, shallowReactive } from "vue";
import { getHumanQuantity } from "@/helpers/formatter";
import { useI18n } from "vue-i18n";
import { fullscreenElement } from "@/core/fullscreen";
import { TYPE_BLOCKER, TYPE_CHEST, TYPE_START, TYPE_TOWER } from "@/api/Node";
import { GAME_ID_EXPLORER_MOVE, GAME_ID_WOOD } from "@/api/Item";
import { isObject } from "@/helpers/core";
import { getNodesMap } from "@/services/api/island-node";
import { SELECT_MODE_DISABLE, SELECT_MODE_GOING, SELECT_MODE_PLAN } from "./select-mode";
import { shallowRef } from "vue";
import UserError from "@/exceptions/UserError";

const { t } = useI18n();

const props = defineProps({
  island: { type: Object, required: true },
  parentPageId: { type: String, required: true },
});

let byIslandState = {};

const minCharsCount = 3;
const componentId = props.parentPageId + "__map";

const calculatingRewards = ref(false);
const errorMessage = ref("");
const regionNumbers = ref([]);

const loadingNodes = ref(true);
const nodes = ref({});
const rewards = ref([]);
const userNodesIdsMap = ref({});
const userNodesGoingIdsMap = ref({});
const disableNodesIdsMap = ref({});

const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);

const isSelectAnyNode = ref(true);
const selectMode = ref(SELECT_MODE_PLAN);
const isShowQuantity = ref(true);
const isShowGroupRewards = ref(false);
const isShowRewardsBlock = ref(true);
const isShowUserRewardsBlock = ref(true);
const filter = shallowReactive({
  itemName: "",
  typeId: null,
  isNodeTypeTower: false,
  isNodeTypeChest: false,
});

const mapContainer = ref(null);
const downloadDialog = ref(null);
const downloadDialogComponent = shallowRef(null);

const loading = computed(() => loadingNodes.value || calculatingRewards.value);

const visibleRewards = computed(() => {
  let resultRewards = rewards.value.filter((reward) => {
    return !disableNodesIdsMap.value[reward.node.id];
  });

  if (filter.itemName.length >= minCharsCount) {
    resultRewards = resultRewards.filter((item) => {
      if (!item.item.name) {
        return false;
      }
      return item.item.name.toLowerCase().includes(filter.itemName.toLowerCase());
    });
  }
  if (filter.typeId > 0) {
    resultRewards = resultRewards.filter((item) => item.item.typeId === filter.typeId);
  }
  if (filter.isNodeTypeChest || filter.isNodeTypeTower) {
    const typeMap = {};
    if (filter.isNodeTypeChest) {
      typeMap[TYPE_CHEST] = true;
    }
    if (filter.isNodeTypeTower) {
      typeMap[TYPE_TOWER] = true;
    }

    resultRewards = resultRewards.filter((item) => {
      return typeMap[item.node.typeId] !== undefined;
    });
  }

  return resultRewards;
});
const visibleRewardsCount = computed(() => visibleRewards.value.length);
const userRewards = computed(() => {
  return rewards.value.filter((reward) => {
    return nodes.value[reward.node.id] && userNodesIdsMap.value[reward.node.id];
  });
});
const userRewardsCount = computed(() => userRewards.value.length);
const groupRewards = computed(() => {
  const map = {};

  rewards.value
    .filter((reward) => !disableNodesIdsMap.value[reward.node.id])
    .forEach(({ item }) => {
      if (!map[item.id]) {
        map[item.id] = {
          id: item.id,
          quantity: 0,
          item,
        };
      }
      map[item.id].quantity += item.quantity;
    });

  let arr = Object.values(map);

  arr.sort((a, b) => {
    if (a.item.name < b.item.name) {
      return -1;
    }
    if (a.item.name > b.item.name) {
      return 1;
    }
    return 0;
  });
  arr.every((item) => (item.humanQuantity = getHumanQuantity(item.quantity)));

  return arr;
});
const groupRewardsCount = computed(() => Object.keys(groupRewards.value).length);

const userWoodMoveCount = computed(() => {
  let result = 0;

  for (const nodeId in userNodesIdsMap.value) {
    const node = nodes.value[nodeId];
    if (node?.cost?.gameItemId == GAME_ID_WOOD) {
      ++result;
    }
  }

  return result;
});
const userExplorerMoveCount = computed(() => {
  let totalUserNodeCount = 0;

  for (const nodeId in userNodesIdsMap.value) {
    const node = nodes.value[nodeId];
    if (node) {
      ++totalUserNodeCount;
    }
  }

  return totalUserNodeCount - userWoodMoveCount.value;
});
const totalExplorerMoveCount = computed(() => {
  let result = 0;

  for (const nodeId in nodes.value) {
    const node = nodes.value[nodeId];

    if (!node.cost) {
      if (!(node.typeId === TYPE_START || node.typeId === TYPE_BLOCKER)) {
        ++result;
      }
    } else if (node.cost.gameItemId == GAME_ID_EXPLORER_MOVE) {
      ++result;
    }
  }

  return result;
});
const totalWoodMoveCount = computed(() => {
  let result = 0;

  for (const nodeId in nodes.value) {
    const node = nodes.value[nodeId];

    if (node.cost?.gameItemId == GAME_ID_WOOD) {
      ++result;
    }
  }

  return result;
});
const disableNodesCount = computed(() => Object.keys(disableNodesIdsMap.value).length);

loadState();

onMounted(() => reloadMap());
onUnmounted(() => saveState());

/**
 * @param {Boolean} isForce
 */
async function loadNodes(isForce) {
  let nodes = {};
  let filter = {};

  const visibleRegions = props.island.regions
    ? props.island.regions.filter((region) => region.isVisible)
    : [];
  const isAllNumbersSelect = visibleRegions.length === regionNumbers.value.length;

  if (regionNumbers.value.length && !isAllNumbersSelect) {
    filter.regionNumbers = regionNumbers.value;
  }

  loadingNodes.value = true;
  try {
    nodes = await getNodesMap(props.island, isForce, filter);
  } catch (error) {
    if (error instanceof UserError) {
      errorMessage.value = error.message;
    } else {
      errorMessage.value = t("page.island.failNodesLoading");
      throw error;
    }
  } finally {
    loadingNodes.value = false;
  }

  return nodes;
}

/**
 * @param {Array} nodes
 */
function calculateRewards(nodes) {
  calculatingRewards.value = true;

  const tmpMap = {};
  const rewards = [];
  let index = 0;

  for (const id in nodes) {
    const node = nodes[id];
    const itemCount = node?.items.length;
    if (!itemCount) {
      continue;
    }

    node.items.forEach((item) => {
      const uid = getUniqueId(node, item, index);
      if (tmpMap[uid]) {
        throw new Error("UID exists " + uid);
      }
      tmpMap[uid] = true;

      rewards.push({
        uniqueId: uid,
        iconUrl: item.iconUrl,
        humanQuantity: getHumanQuantity(item.quantity),
        emeraldCost: item.emeraldCost !== null ? item.emeraldCost * item.quantity : null,
        node,
        item,
      });

      ++index;
    });
  }

  calculatingRewards.value = false;

  return rewards;
}

/**
 * @param {Object} node
 * @param {Object} reward
 * @param {Number} index
 * @returns {String}
 */
function getUniqueId(node, reward, index) {
  return "mx" + node.mx + "_my" + node.my + "_id" + reward.id + "_i" + index;
}

/**
 * @param {Number} value
 */
function onChangeScale(value) {
  scale.value += value;

  const MAX_SCALE = 8;
  const MIN_SCALE = 0.3;

  if (scale.value > MAX_SCALE) {
    scale.value = MAX_SCALE;
  } else if (scale.value < MIN_SCALE) {
    scale.value = MIN_SCALE;
  }
}

function onResetMap() {
  if (props.island.initMap?.scale !== undefined) {
    scale.value = props.island.initMap.scale;
  } else {
    scale.value = 1;
  }
  if (props.island.initMap?.offsetX !== undefined) {
    translateX.value = props.island.initMap.offsetX;
  } else {
    translateX.value = 0;
  }
  if (props.island.initMap?.offsetY !== undefined) {
    translateY.value = props.island.initMap.offsetY;
  } else {
    translateY.value = 0;
  }
}

/**
 * @param {Number|null} x
 * @param {Number|null} y
 */
function onChangeTranslate(x, y) {
  if (x !== null) {
    translateX.value = x;
  }
  if (y !== null) {
    translateY.value = y;
  }
}

function onChangeIsShowQuantity() {
  isShowQuantity.value = !isShowQuantity.value;
}

function onChangeNode(node) {
  if (!nodes.value[node.id]) {
    throw new Error(t("page.island.notFoundNodeAdmin"));
  }
  nodes.value[node.id] = node;
}

function onSelectNode(nodeId) {
  if (!nodes.value[nodeId]) {
    throw new Error(t("page.island.notFoundNodeAdmin"));
  }

  switch (selectMode.value) {
    case SELECT_MODE_PLAN:
      if (!disableNodesIdsMap.value[nodeId]) {
        if (userNodesIdsMap.value[nodeId]) {
          delete userNodesIdsMap.value[nodeId];
        } else {
          userNodesIdsMap.value[nodeId] = true;
        }
        if (userNodesGoingIdsMap.value[nodeId]) {
          delete userNodesGoingIdsMap.value[nodeId];
        }
      }
      break;
    case SELECT_MODE_GOING:
      if (userNodesIdsMap.value[nodeId] && !disableNodesIdsMap.value[nodeId]) {
        if (userNodesGoingIdsMap.value[nodeId]) {
          delete userNodesGoingIdsMap.value[nodeId];
        } else {
          userNodesGoingIdsMap.value[nodeId] = true;
        }
      }
      break;
    case SELECT_MODE_DISABLE:
      if (disableNodesIdsMap.value[nodeId]) {
        delete disableNodesIdsMap.value[nodeId];
      } else {
        disableNodesIdsMap.value[nodeId] = true;

        if (userNodesIdsMap.value[nodeId]) {
          delete userNodesIdsMap.value[nodeId];
        }
        if (userNodesGoingIdsMap.value[nodeId]) {
          delete userNodesGoingIdsMap.value[nodeId];
        }
      }
      break;
  }
}

function onResetUserNodes() {
  userNodesGoingIdsMap.value = {};
  userNodesIdsMap.value = {};
  selectMode.value = SELECT_MODE_PLAN;
}

function onResetDisableNodes() {
  disableNodesIdsMap.value = {};
}

function onFullscreen() {
  fullscreenElement(mapContainer.value.svgMap);
}

function onBeginDownload() {
  downloadDialogComponent.value = IslandMapDownloadDialog;
}

function forceReloadMap() {
  saveState();
  reloadMap(true);
}

/**
 * @param {Boolean} isForce
 */
function reloadMap(isForce = false) {
  loadNodes(isForce).then((responseNodes) => {
    nodes.value = responseNodes;
    rewards.value = calculateRewards(responseNodes);

    for (const nodeId in userNodesIdsMap.value) {
      const node = nodes.value[nodeId];
      if ((node && !canSelectNode(node)) || disableNodesIdsMap.value[nodeId]) {
        delete userNodesIdsMap.value[nodeId];
      }
    }
  });
}

function onMountedDownloadDialog() {
  downloadDialog.value.show().finally(() => {
    downloadDialogComponent.value = null;
  });
}

function onResetRegionNumbers() {
  regionNumbers.value = [];
  reloadMap();
}

function onChangeRegionNumbers(newNumbers) {
  regionNumbers.value = newNumbers;
  const isFullIsland = newNumbers.length === 0;
  const isForse = isFullIsland ? false : true;

  reloadMap(isForse);
}

function loadState() {
  let state;

  try {
    state = JSON.parse(localStorage.getItem(componentId));
  } catch (error) {
    console.error(error);
  }

  if (!state) {
    state = {
      byIsland: {},
      filter: {},
    };
  }
  if (!state.filter) {
    state.filter = {};
  }
  if (!state.filter.itemName) {
    state.filter.itemName = "";
  }
  if (!state.filter.typeId) {
    state.filter.typeId = null;
  }
  if (typeof state.filter.isNodeTypeChest !== "boolean") {
    state.filter.isNodeTypeChest = false;
  }
  if (typeof state.filter.isNodeTypeTower !== "boolean") {
    state.filter.isNodeTypeTower = false;
  }

  if (!state.byIsland || !isObject(state.byIsland)) {
    state.byIsland = {};
  }
  byIslandState = state.byIsland;

  const byIsland = byIslandState[props.island.id] ?? {};

  if (byIsland.scale === undefined) {
    if (props.island.initMap?.scale !== undefined) {
      scale.value = props.island.initMap.scale;
    } else {
      scale.value = 1;
    }
  } else {
    scale.value = byIsland.scale;
  }
  if (byIsland.translateX === undefined) {
    if (props.island.initMap?.offsetX !== undefined) {
      translateX.value = props.island.initMap.offsetX;
    } else {
      translateX.value = 0;
    }
  } else {
    translateX.value = byIsland.translateX;
  }
  if (byIsland.translateY === undefined) {
    if (props.island.initMap?.offsetY !== undefined) {
      translateY.value = props.island.initMap.offsetY;
    } else {
      translateY.value = 0;
    }
  } else {
    translateY.value = byIsland.translateY;
  }
  regionNumbers.value = byIsland.regionNumbers || [];

  if (byIsland.userNodesIds) {
    byIsland.userNodesIds.forEach((id) => (userNodesIdsMap.value[id] = true));
  }
  if (byIsland.userNodesGoingIds) {
    byIsland.userNodesGoingIds.forEach((id) => (userNodesGoingIdsMap.value[id] = true));
  }
  if (byIsland.disableNodesIds) {
    byIsland.disableNodesIds.forEach((id) => (disableNodesIdsMap.value[id] = true));
  }

  filter.value = state.filter;
  isShowQuantity.value = state.isShowQuantity === undefined ? true : state.isShowQuantity;
  isShowRewardsBlock.value =
    state.isShowRewardsBlock === undefined ? true : state.isShowRewardsBlock;
  isShowUserRewardsBlock.value =
    state.isShowUserRewardsBlock === undefined ? true : state.isShowUserRewardsBlock;
  isShowGroupRewards.value =
    state.isShowGroupRewards === undefined ? false : state.isShowGroupRewards;

  isSelectAnyNode.value = typeof state.isSelectAnyNode === "boolean" ? state.isSelectAnyNode : true;
}

function saveState() {
  const state = {
    filter: filter.value,
    isShowQuantity: isShowQuantity.value,
    isSelectAnyNode: isSelectAnyNode.value,
    isShowGroupRewards: isShowGroupRewards.value,
    isShowRewardsBlock: isShowRewardsBlock.value,
    isShowUserRewardsBlock: isShowUserRewardsBlock.value,
  };
  byIslandState[props.island.id] = {
    userNodesIds: Object.keys(userNodesIdsMap.value).map((id) => parseInt(id)),
    disableNodesIds: Object.keys(disableNodesIdsMap.value).map((id) => parseInt(id)),
    userNodesGoingIds: Object.keys(userNodesGoingIdsMap.value).map((id) => parseInt(id)),
    scale: scale.value,
    translateX: translateX.value,
    translateY: translateY.value,
    regionNumbers: regionNumbers.value,
  };
  state.byIsland = byIslandState;

  localStorage.setItem(componentId, JSON.stringify(state));
}
</script>

<template>
  <div>
    <island-map-toolbar
      v-if="!errorMessage"
      :is-show-quantity="isShowQuantity"
      :loading="loading"
      :translate-x="translateX"
      :translate-y="translateY"
      :regions="island.regions"
      :region-numbers="regionNumbers"
      @update:is-show-quantity="onChangeIsShowQuantity"
      @reset="onResetMap"
      @change-scale="onChangeScale"
      @change-translate="onChangeTranslate"
      @fullscreen-on="onFullscreen"
      @begin-download="onBeginDownload"
      @reload-map="forceReloadMap"
      @update:region-numbers="onChangeRegionNumbers"
      @reset-region-numbers="onResetRegionNumbers"
    />

    <island-map-loading v-if="loading" />
    <div
      v-else-if="errorMessage"
      class="alert alert-danger"
    >
      {{ errorMessage }}
    </div>
    <div v-else>
      <island-map-container
        ref="mapContainer"
        :scale="scale"
        :translate-x="translateX"
        :translate-y="translateY"
        :is-show-quantity="isShowQuantity"
        :is-select-any-node="isSelectAnyNode"
        :rewards="visibleRewards"
        :nodes="nodes"
        :user-nodes-ids-map="userNodesIdsMap"
        :user-nodes-going-ids-map="userNodesGoingIdsMap"
        :disable-nodes-ids-map="disableNodesIdsMap"
        :background-image="island.backgroundImage"
        @change-translate="onChangeTranslate"
        @change-scale="onChangeScale"
        @change-node="onChangeNode"
        @select-node="onSelectNode"
      />
      <div
        class="text-end mb-3"
        style="font-size: 0.9em"
      >
        <span
          :title="t('common.zoom')"
          class="me-4"
          >{{ scale.toFixed(2) }}</span
        >
        <span :title="t('common.offset')"
          >{{ translateX.toFixed(1) }} {{ translateY.toFixed(1) }}</span
        >
      </div>
      <div class="row">
        <div class="col-lg-6">
          <island-map-filter
            v-model:item-name="filter.itemName"
            v-model:type-id="filter.typeId"
            v-model:is-node-type-tower="filter.isNodeTypeTower"
            v-model:is-node-type-chest="filter.isNodeTypeChest"
            :rewards="rewards"
            :min-chars-count="minCharsCount"
          />
        </div>
        <div class="col-lg-6">
          <island-map-steps
            v-model:is-select-any-node="isSelectAnyNode"
            v-model:select-mode="selectMode"
            :explorer-move-count="userExplorerMoveCount"
            :total-explorer-move-count="totalExplorerMoveCount"
            :wood-move-count="userWoodMoveCount"
            :total-wood-move-count="totalWoodMoveCount"
            :disable-nodes-count="disableNodesCount"
            @reset-user-nodes="onResetUserNodes"
            @reset-disable-nodes="onResetDisableNodes"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-lg-6 mt-4">
          <island-map-table
            v-model:is-show-block="isShowRewardsBlock"
            :header="t('page.island.resourcesOnMap')"
            :rewards="visibleRewards"
            :visible-rewards-count="visibleRewardsCount"
          />
        </div>
        <div class="col-lg-6 mt-4">
          <island-map-table
            v-model:is-show-block="isShowUserRewardsBlock"
            :header="t('page.island.selectedResources')"
            :rewards="userRewards"
            :visible-rewards-count="userRewardsCount"
          />
        </div>
        <div class="col-lg-6 mt-4">
          <island-map-table
            v-model:is-show-block="isShowGroupRewards"
            :header="t('common.groupData')"
            :rewards="groupRewards"
            :visible-rewards-count="groupRewardsCount"
          />
        </div>
      </div>
    </div>

    <component
      :is="downloadDialogComponent"
      ref="downloadDialog"
      :island="island"
      :nodes="nodes"
      :rewards="visibleRewards"
      :is-show-quantity="isShowQuantity"
      @vue:mounted="onMountedDownloadDialog"
    />
  </div>
</template>
