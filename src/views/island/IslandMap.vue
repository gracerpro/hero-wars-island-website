<script setup lang="ts">
/* global window */
/* global Event */
/* global localStorage */

import IslandMapLoading from "./IslandMapLoading.vue";
import IslandMapToolbar from "./IslandMapToolbar.vue";
import IslandMapSteps from "./IslandMapSteps.vue";
import IslandMapContainer from "./IslandMapContainer.vue";
import IslandMapDownloadDialog from "./IslandMapDownloadDialog.vue";
import IslandMapFilter from "./IslandMapFilter.vue";
import IslandMapTable from "./IslandMapTable.vue";
import { canSelectNode } from "@/services/island-map";
import { onMounted, onUnmounted, ref, computed, shallowReactive, useTemplateRef } from "vue";
import { getHumanQuantity } from "@/helpers/formatter";
import { useI18n } from "vue-i18n";
import { fullscreenElement } from "@/core/fullscreen";
import { TYPE_CHEST, TYPE_TOWER, type IslandNodeList, type Node, type NodeFilter, type NodeMap, type NodeReward } from "@/api/NodeApi";
import { isObject } from "@/helpers/core";
import { getNodesMap } from "@/services/api/island-node";
import { SELECT_MODE_DISABLE, SELECT_MODE_GOING, SELECT_MODE_PLAN } from "./map";
import { shallowRef } from "vue";
import { UserError } from "@/exceptions/UserError";
import type { Island } from "@/api/IslandApi";
import type { ViewNodeReward, UserNodeIds, ViewReward, SelectMode } from "./map";
import { getUnknownItem, type Type } from "@/api/ItemApi";
import type { ComponentExposed } from "vue-component-type-helpers";

interface Props {
  island: Island,
  parentPageId: string,
}

const props = defineProps<Props>();

interface Filter {
  itemName: string,
  itemType: Type | null,
  isNodeTypeTower: boolean,
  isNodeTypeChest: boolean,
}

type IslandState = {
  scale: number,
  translateX: number,
  translateY: number,
  regionNumbers: Array<number>,
  userNodesIds: Array<number>,
  userNodesGoingIds: Array<number>,
  disableNodesIds: Array<number>,
}
type IslandStateMap = {[key: number]: IslandState}
type State = {
  byIsland: IslandStateMap,
  filter: Filter,
  isShowQuantity: boolean,
  isSelectAnyNode: boolean,
  isShowGroupRewards: boolean,
  isShowRewardsBlock: boolean,
  isShowUserRewardsBlock: boolean,
};

const { t } = useI18n();

let byIslandState: IslandStateMap = {};

const minCharsCount = 3;
const componentId = props.parentPageId + "__map";

const errorMessage = ref("");
const regionNumbers = ref<Array<number>>([]);

const isLoadingNodes = ref(true);
const nodes = ref<NodeMap>(new Map<number, Node>());
const rewards = ref<Array<ViewNodeReward>>([]);
const calculatingRewards = ref(false);
const userNodesIds = ref<UserNodeIds>(new Set());
const userNodesGoingIds = ref<UserNodeIds>(new Set());
const disableNodesIds = ref<UserNodeIds>(new Set());

const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);

const isSelectAnyNode = ref(true);
const selectMode = ref<SelectMode>(SELECT_MODE_PLAN);
const isShowQuantity = ref(true);
const isShowGroupRewards = ref(false);
const isShowRewardsBlock = ref(true);
const isShowUserRewardsBlock = ref(true);
let filter = shallowReactive<Filter>({
  itemName: "",
  itemType: null,
  isNodeTypeTower: false,
  isNodeTypeChest: false,
});

const mapContainerRef = useTemplateRef<ComponentExposed<typeof IslandMapContainer>>("mapContainerRef");
const downloadDialog = useTemplateRef<ComponentExposed<typeof IslandMapDownloadDialog>>("downloadDialog");
const downloadDialogComponent = shallowRef<typeof IslandMapDownloadDialog|null>(null);

const loading = computed(() => isLoadingNodes.value || calculatingRewards.value);

const visibleRewards = computed(() => {
  let resultRewards = rewards.value.filter((reward) => {
    return !disableNodesIds.value.has(reward.node.id);
  });

  if (filter.itemName.length >= minCharsCount) {
    resultRewards = resultRewards.filter((item) => {
      if (!item.item.name) {
        return false;
      }
      return item.item.name.toLowerCase().includes(filter.itemName.toLowerCase());
    });
  }
  if (filter.itemType !== null && filter.itemType > 0) {
    resultRewards = resultRewards.filter((item) => item.item.type === filter.itemType);
  }
  if (filter.isNodeTypeChest || filter.isNodeTypeTower) {
    const typeMap: {[key: number]: boolean} = {};

    if (filter.isNodeTypeChest) {
      typeMap[TYPE_CHEST] = true;
    }
    if (filter.isNodeTypeTower) {
      typeMap[TYPE_TOWER] = true;
    }

    resultRewards = resultRewards.filter((item) => {
      return typeMap[item.node.type] !== undefined;
    });
  }

  return resultRewards;
});
const visibleRewardsCount = computed(() => visibleRewards.value.length);
const userRewards = computed(() => {
  return rewards.value.filter((reward) => {
    return nodes.value.has(reward.node.id) && userNodesIds.value.has(reward.node.id);
  });
});
const userRewardsCount = computed(() => userRewards.value.length);
const groupRewards = computed(() => {
  const map: { [key: number]: ViewReward } = {};

  rewards.value
    .filter((reward) => !disableNodesIds.value.has(reward.node.id))
    .forEach((reward) => {
      if (!map[reward.item.id]) {
        map[reward.item.id] = {
          uniqueId: reward.uniqueId,
          quantity: 0,
          item: reward.item,
          humanQuantity: ""
        };
      }
      map[reward.item.id].quantity += reward.quantity;
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
const groupRewardsCount = computed(() => groupRewards.value.length);
const disableNodesCount = computed(() => disableNodesIds.value.size);

loadState();

onMounted(() => {
  window.addEventListener("beforeunload", onBeforeUnload);
  reloadMap();
});
onUnmounted(() => {
  window.removeEventListener("beforeunload", onBeforeUnload);
  saveState();
});

function onBeforeUnload(event: Event): string {
  event.returnValue = false;

  saveState();

  return "";
}

async function loadNodes(isForce: boolean): Promise<IslandNodeList> {
  let nodeList: IslandNodeList = {
    nodes: new Map<number, Node>(),
    totalCount: 0,
    rewards: {}
  };
  let filter: NodeFilter = {};

  const visibleRegions = props.island.regions
    ? props.island.regions.filter((region) => region.isVisible)
    : [];
  const isAllNumbersSelect = visibleRegions.length === regionNumbers.value.length;

  if (regionNumbers.value.length && !isAllNumbersSelect) {
    filter.regionNumbers = regionNumbers.value;
  }

  isLoadingNodes.value = true;
  try {
    nodeList = await getNodesMap(props.island, isForce, filter);
  } catch (error) {
    if (error instanceof UserError) {
      errorMessage.value = error.message;
    } else {
      errorMessage.value = t("page.island.failNodesLoading");
      throw error;
    }
  } finally {
    isLoadingNodes.value = false;
  }

  return nodeList;
}

function calculateRewards(nodeList: IslandNodeList): Array<ViewNodeReward> {
  calculatingRewards.value = true;

  const rewards: Array<ViewNodeReward> = [];
  let index = 0;

  nodeList.nodes.forEach((node) => {
    node.rewards.forEach((nodeReward) => {
      rewards.push({
        quantity: nodeReward.quantity,
        uniqueId: getUniqueId(node, nodeReward, index),
        humanQuantity: getHumanQuantity(nodeReward.quantity),
        item: nodeList.rewards[nodeReward.itemId] ?? getUnknownItem(),
        node,
      });

      ++index;
    });
  })

  calculatingRewards.value = false;

  return rewards;
}

function getUniqueId(node: Node, nodeReward: NodeReward, index: number): string {
  return "mx" + node.mx + "_my" + node.my + "_id" + nodeReward.itemId + "_i" + index;
}

function onChangeScale(value: number) {
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

function onChangeTranslate(x: number | null, y: number | null) {
  if (x !== null) {
    translateX.value = x;
  }
  if (y !== null) {
    translateY.value = y;
  }
}

function onToggleIsShowQuantity() {
  isShowQuantity.value = !isShowQuantity.value;
}

function onChangeNode(node: Node) {
  if (!nodes.value.has(node.id)) {
    throw new Error(t("page.island.notFoundNodeAdmin"));
  }
  nodes.value.set(node.id, node);
}

function onSelectNode(nodeId: number) {
  if (!nodes.value.has(nodeId)) {
    throw new Error(t("page.island.notFoundNodeAdmin"));
  }

  switch (selectMode.value) {
    case SELECT_MODE_PLAN:
      if (!disableNodesIds.value.has(nodeId)) {
        if (userNodesIds.value.has(nodeId)) {
          userNodesIds.value.delete(nodeId);
        } else {
          userNodesIds.value.add(nodeId);
        }
        if (userNodesGoingIds.value.has(nodeId)) {
          userNodesGoingIds.value.delete(nodeId);
        }
      }
      break;
    case SELECT_MODE_GOING:
      if (userNodesIds.value.has(nodeId) && !disableNodesIds.value.has(nodeId)) {
        if (userNodesGoingIds.value.has(nodeId)) {
          userNodesGoingIds.value.delete(nodeId);
        } else {
          userNodesGoingIds.value.add(nodeId);
        }
      }
      break;
    case SELECT_MODE_DISABLE:
      if (disableNodesIds.value.has(nodeId)) {
        disableNodesIds.value.delete(nodeId);
      } else {
        disableNodesIds.value.add(nodeId);

        if (userNodesIds.value.has(nodeId)) {
          userNodesIds.value.delete(nodeId);
        }
        if (userNodesGoingIds.value.has(nodeId)) {
          userNodesGoingIds.value.delete(nodeId);
        }
      }
      break;
  }
}

function onResetUserNodes() {
  userNodesGoingIds.value.clear();
  userNodesIds.value.clear();
  selectMode.value = SELECT_MODE_PLAN;
}

function onResetDisableNodes() {
  disableNodesIds.value.clear();
}

function onFullscreen() {
  if (mapContainerRef.value?.svgMapRef !== null) {
    fullscreenElement(mapContainerRef.value?.svgMapRef);
  }
}

function onBeginDownload() {
  downloadDialogComponent.value = IslandMapDownloadDialog;
}

function forceReloadMap() {
  saveState();
  reloadMap(true);
}

function reloadMap(isForce = false) {
  loadNodes(isForce).then((nodeList: IslandNodeList) => {
    nodes.value = nodeList.nodes;
    rewards.value = calculateRewards(nodeList);

    userNodesIds.value.forEach((nodeId) => {
      const node = nodes.value.get(nodeId);
      if ((node && !canSelectNode(node)) || disableNodesIds.value.has(nodeId)) {
        userNodesIds.value.delete(nodeId);
      }
    })
  })
}

function onMountedDownloadDialog() {
  downloadDialog.value?.show().finally(() => {
    downloadDialogComponent.value = null;
  });
}

function onResetRegionNumbers() {
  regionNumbers.value = [];
  reloadMap();
}

function onChangeRegionNumbers(newNumbers: Array<number>) {
  regionNumbers.value = newNumbers;
  const isFullIsland = newNumbers.length === 0;
  const isForse = isFullIsland ? false : true;

  reloadMap(isForse);
}

function loadState() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stateData: any = {}

  try {
    const item = localStorage.getItem(componentId)

    if (item !== null) {
      stateData = JSON.parse(item) || {};
    }
  } catch {
    stateData = {}
  }
  if (typeof stateData !== "object") {
    stateData = {}
  }

  let tmpFilter: Filter = {
    itemName: "",
    itemType: null,
    isNodeTypeTower: false,
    isNodeTypeChest: false
  }

  if (stateData?.filter) {
    tmpFilter.itemName = stateData.filter.itemName ?? "";
    tmpFilter.itemType = stateData.filter.type ?? null;
    tmpFilter.isNodeTypeChest = stateData.filter.isNodeTypeChest ?? false;
    tmpFilter.isNodeTypeTower = stateData.filter.isNodeTypeTower ?? false;
  }

  if (!stateData.byIsland || !isObject(stateData.byIsland)) {
    stateData.byIsland = {};
  }
  byIslandState = stateData.byIsland;

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

  userNodesIds.value.clear()
  userNodesGoingIds.value.clear()
  disableNodesIds.value.clear()

  if (byIsland.userNodesIds) {
    byIsland.userNodesIds.forEach((id) => userNodesIds.value.add(id));
  }
  if (byIsland.userNodesGoingIds) {
    byIsland.userNodesGoingIds.forEach((id) => userNodesGoingIds.value.add(id));
  }
  if (byIsland.disableNodesIds) {
    byIsland.disableNodesIds.forEach((id) => disableNodesIds.value.add(id));
  }

  filter = tmpFilter;
  isShowQuantity.value = stateData.isShowQuantity ?? true;
  isShowRewardsBlock.value = stateData.isShowRewardsBlock ?? true;
  isShowUserRewardsBlock.value = stateData.isShowUserRewardsBlock ?? true;
  isShowGroupRewards.value = stateData.isShowGroupRewards ?? false;
  isSelectAnyNode.value = stateData ?? true;
}

function saveState() {
  byIslandState[props.island.id] = {
    userNodesIds: [...userNodesIds.value],
    disableNodesIds: [...disableNodesIds.value],
    userNodesGoingIds: [...userNodesGoingIds.value],
    scale: scale.value,
    translateX: translateX.value,
    translateY: translateY.value,
    regionNumbers: regionNumbers.value,
  };

  const state: State = {
    filter,
    isShowQuantity: isShowQuantity.value,
    isSelectAnyNode: isSelectAnyNode.value,
    isShowGroupRewards: isShowGroupRewards.value,
    isShowRewardsBlock: isShowRewardsBlock.value,
    isShowUserRewardsBlock: isShowUserRewardsBlock.value,
    byIsland: byIslandState,
  };

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
      @update:is-show-quantity="onToggleIsShowQuantity"
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
        ref="mapContainerRef"
        :scale="scale"
        :translate-x="translateX"
        :translate-y="translateY"
        :is-show-quantity="isShowQuantity"
        :is-select-any-node="isSelectAnyNode"
        :rewards="visibleRewards"
        :nodes="nodes"
        :user-nodes-ids="userNodesIds"
        :user-nodes-going-ids="userNodesGoingIds"
        :disable-nodes-ids="disableNodesIds"
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
            v-model:item-type="filter.itemType"
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
            :nodes="nodes"
            :user-nodes-ids="userNodesIds"
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
