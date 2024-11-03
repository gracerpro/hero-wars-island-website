<template>
  <div>
    <island-map-loading v-if="loading" />
    <div
      v-else-if="errorMessage"
      class="alert alert-danger"
    >
      {{ errorMessage }}
    </div>
    <div v-else>
      <island-map-toolbar
        :is-show-quantity="isShowQuantity"
        @update:is-show-quantity="onChangeIsShowQuantity"
        @reset-scale="onResetScale"
        @reset-translate="onResetTranslate"
        @change-scale="onChangeScale"
        @change-translate="onChangeTranslate"
        @fullscreen-on="onFullscreen"
        @begin-download="onBeginDownload"
        @reload-map="forceReloadMap"
      />
      <island-map-container
        ref="mapContainer"
        :scale="scale"
        :translate-x="translateX"
        :translate-y="translateY"
        :is-show-quantity="isShowQuantity"
        :is-select-any-node="isSelectAnyNode"
        :items="visibleItems"
        :nodes="nodes"
        :user-nodes-map="userNodesMap"
        @change-translate="onChangeTranslate"
        @change-scale="onChangeScale"
        @change-node="onChangeNode"
        @select-node="onSelectNode"
      />
      <div class="row mt-3">
        <div class="col-lg-6">
          <island-map-filter
            v-model:item-name="filter.itemName"
            v-model:type-id="filter.typeId"
            v-model:is-node-type-tower="filter.isNodeTypeTower"
            v-model:is-node-type-chest="filter.isNodeTypeChest"
            v-model:region-number="filter.regionNumber"
            :items="items"
            :min-chars-count="minCharsCount"
            :regions="island.regions"
          />
        </div>
        <div class="col-lg-6">
          <island-map-steps
            v-model:is-select-any-node="isSelectAnyNode"
            v-model:select-mode="selectMode"
            :user-nodes-count="userNodesCount"
            :total-nodes-count="totalNodesCount"
            @reset-user-nodes="onResetUserNodes"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-lg-6 mt-4">
          <h3>
            {{ t("page.island.resourcesOnMap") }}
          </h3>
          <a
            href="#"
            @click.prevent="isShowItemsBlock = !isShowItemsBlock"
          >
            {{ t(isShowItemsBlock ? "common.hide" : "common.show") }}
          </a>
          <span class="badge text-bg-secondary ms-2">{{ visibleItemsCount }}</span>
          <island-map-table
            v-if="isShowItemsBlock"
            :items="visibleItems"
          />
        </div>
        <div class="col-lg-6 mt-4">
          <h3>{{ t("page.island.selectedResources") }}</h3>
          <a
            href="#"
            @click.prevent="isShowUserItemsBlock = !isShowUserItemsBlock"
          >
            {{ t(isShowUserItemsBlock ? "common.hide" : "common.show") }}
          </a>
          <span class="badge text-bg-secondary ms-2">{{ userItemsCount }}</span>
          <island-map-table
            v-if="isShowUserItemsBlock"
            :items="userItems"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-lg-6 mt-4">
          <h3 class="mt-2">{{ t("common.groupData") }}</h3>
          <a
            href="#"
            @click.prevent="isShowGroupItems = !isShowGroupItems"
          >
            {{ t(isShowGroupItems ? "common.hide" : "common.show") }}
          </a>
          <span class="badge text-bg-secondary ms-2">{{ groupItemsCount }}</span>
          <island-map-table
            v-if="isShowGroupItems"
            :items="groupItems"
          />
        </div>
      </div>
    </div>
    <component
      :is="downloadDialogComponent"
      ref="downloadDialog"
      :island="island"
      :nodes="nodes"
      :rewards="visibleItems"
      :is-show-quantity="isShowQuantity"
      @vue:mounted="onMountedDownloadDialog"
    />
  </div>
</template>
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
import { TYPE_CHEST, TYPE_TOWER } from "@/api/Node";
import { TYPE_UNKNOWN } from "@/api/Item";
import { isObject } from "@/helpers/core";
import { getNodesMap } from "@/services/api/island-node";
import { SELECT_MODE_PLAN } from "./select-mode";
import { shallowRef } from "vue";

const { t } = useI18n();

const props = defineProps({
  island: { type: Object, required: true },
  parentPageId: { type: String, required: true },
});

let userNodesIds = [];
let userNodesGoingIds = [];
let byIslandState = {};

const minCharsCount = 3;
const componentId = props.parentPageId + "__map";

const loadingNodes = ref(true);
const calculatingItems = ref(false);
const errorMessage = ref("");
const nodes = ref({});
const items = ref([]);
const userNodesMap = ref({});
const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const isSelectAnyNode = ref(true);
const selectMode = ref(SELECT_MODE_PLAN);
const isShowQuantity = ref(true);
const isShowGroupItems = ref(false);
const isShowItemsBlock = ref(true);
const isShowUserItemsBlock = ref(true);
const filter = shallowReactive({
  itemName: "",
  typeId: null,
  isNodeTypeTower: false,
  isNodeTypeChest: false,
  regionNumber: null,
});
const mapContainer = ref(null);
const downloadDialog = ref(null);
const downloadDialogComponent = shallowRef(null);

const loading = computed(() => loadingNodes.value || calculatingItems.value);
const visibleItems = computed(() => {
  let resultItems = items.value;

  if (filter.itemName.length >= minCharsCount) {
    resultItems = resultItems.filter((item) => {
      if (!item.item.name) {
        return false;
      }
      return item.item.name.toLowerCase().includes(filter.itemName.toLowerCase());
    });
  }
  if (filter.typeId > 0) {
    resultItems = resultItems.filter((item) => item.item.typeId === filter.typeId);
  }
  if (filter.isNodeTypeChest || filter.isNodeTypeTower) {
    const typeMap = {};
    if (filter.isNodeTypeChest) {
      typeMap[TYPE_CHEST] = true;
    }
    if (filter.isNodeTypeTower) {
      typeMap[TYPE_TOWER] = true;
    }

    resultItems = resultItems.filter((item) => {
      return typeMap[item.node.typeId] !== undefined;
    });
  }
  if (filter.regionNumber) {
    resultItems = resultItems.filter((item) => {
      return item.node.regionNumber === filter.regionNumber;
    });
  }

  return resultItems;
});
const visibleItemsCount = computed(() => visibleItems.value.length);
const userItems = computed(() => {
  return items.value.filter((item) => {
    return userNodesMap.value[item.node.id] !== undefined;
  });
});
const userItemsCount = computed(() => userItems.value.length);
const groupItems = computed(() => {
  let map = {};

  items.value.forEach(({ item }) => {
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
const groupItemsCount = computed(() => Object.keys(groupItems.value).length);

const userNodesCount = computed(() => Object.keys(userNodesMap.value).length);
const totalNodesCount = computed(() => {
  const length = Object.keys(nodes.value).length;
  return length > 0 ? length - 1 : 0; // "-1" it means subtract an entry node
});

onMounted(() => {
  reloadMap();
});
onUnmounted(() => {
  saveState();
});

loadState();

/**
 * @param {Boolean} isForce
 */
async function loadNodes(isForce) {
  let nodes = {};

  loadingNodes.value = true;
  try {
    nodes = await getNodesMap(props.island, isForce);
  } catch (error) {
    errorMessage.value = t("page.island.failNodesLoading");
  } finally {
    loadingNodes.value = false;
  }

  return nodes;
}

/**
 * @param {Object} nodes
 */
function initUserNodes(nodes) {
  let nodesMap = {};

  userNodesIds.forEach((id) => {
    const node = nodes[id];
    if (node) {
      if (canSelectNode(node)) {
        nodesMap[id] = node;
      }
      if (userNodesGoingIds.includes(id)) {
        node.isGoingChecked = true;
      }
    }
  });

  return nodesMap;
}

/**
 * @param {Array} nodes
 */
function calculateItems(nodes) {
  calculatingItems.value = true;

  let items = [];
  let index = 0;

  for (const id in nodes) {
    const node = nodes[id];
    const itemCount = node?.items.length;
    if (!itemCount) {
      continue;
    }

    node.items.forEach((item) => {
      items.push({
        uniqueId: getUniqueId(node, item, index),
        iconUrl: item.iconUrl,
        humanQuantity: getHumanQuantity(item.quantity),
        emeraldCost: item.emeraldCost !== null ? item.emeraldCost * item.quantity : null,
        node,
        item,
      });

      ++index;
    });
  }

  calculatingItems.value = false;

  return items;
}

/**
 * @param {Object} node
 * @param {Object} reward
 * @param {Number} index
 * @returns {String}
 */
function getUniqueId(node, reward, index) {
  let rewardId = reward.id;

  if (reward.typeId === TYPE_UNKNOWN) {
    rewardId += "_" + index;
  }

  return node.mx + "_" + node.my + "_" + rewardId;
}

/**
 * @param {Number} value
 */
function onChangeScale(value) {
  scale.value += value;

  const MAX_SCALE = 6;
  const MIN_SCALE = 0.3;

  if (scale.value > MAX_SCALE) {
    scale.value = MAX_SCALE;
  } else if (scale.value < MIN_SCALE) {
    scale.value = MIN_SCALE;
  }
}

function onResetScale() {
  scale.value = 1;
}

function onChangeTranslate(dx, dy) {
  if (dx !== 0) {
    translateX.value += dx;
  }
  if (dy !== 0) {
    translateY.value += dy;
  }
}

function onResetTranslate() {
  translateX.value = 0;
  translateY.value = 0;
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
  if (selectMode.value === SELECT_MODE_PLAN) {
    if (!nodes.value[nodeId]) {
      throw new Error(t("page.island.notFoundNodeAdmin"));
    }

    if (userNodesMap.value[nodeId] !== undefined) {
      delete userNodesMap.value[nodeId];
      nodes.value[nodeId].isGoingChecked = false;
    } else {
      userNodesMap.value[nodeId] = nodes.value[nodeId];
    }
  } else {
    if (userNodesMap.value[nodeId] !== undefined) {
      userNodesMap.value[nodeId].isGoingChecked = !userNodesMap.value[nodeId].isGoingChecked;
    }
  }
}

function onResetUserNodes() {
  userNodesMap.value = {};
  selectMode.value = SELECT_MODE_PLAN;
  for (let id in nodes.value) {
    delete nodes.value[id].isGoingChecked;
  }
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
    items.value = calculateItems(responseNodes);
    userNodesMap.value = initUserNodes(responseNodes);
  });
}

function onMountedDownloadDialog() {
  downloadDialog.value.show().finally(() => {
    downloadDialogComponent.value = null;
  });
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
      isShowQuantity: true,
      byIsland: {},
      filter: {},
      isShowItemsBlock: true,
      isShowUserItemsBlock: true,
      isShowGroupItems: false,
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
  if (state.isShowQuantity === undefined) {
    state.isShowQuantity = true;
  }
  if (state.isShowItemsBlock === undefined) {
    state.isShowItemsBlock = true;
  }
  if (state.isShowUserItemsBlock === undefined) {
    state.isShowUserItemsBlock = true;
  }
  if (state.isShowGroupItems === undefined) {
    state.isShowGroupItems = false;
  }

  if (!state.byIsland || !isObject(state.byIsland)) {
    state.byIsland = {};
  }
  byIslandState = state.byIsland;

  const byIsland = byIslandState[props.island.id] ? byIslandState[props.island.id] : {};
  scale.value = byIsland.scale !== undefined ? byIsland.scale : 1;
  translateX.value = byIsland.translateX !== undefined ? byIsland.translateX : 0;
  translateY.value = byIsland.translateY !== undefined ? byIsland.translateY : 0;
  userNodesIds = byIsland.userNodesIds ? byIsland.userNodesIds : [];
  userNodesGoingIds = byIsland.userNodesGoingIds ? byIsland.userNodesGoingIds : [];

  filter.value = state.filter;
  isShowQuantity.value = state.isShowQuantity;
  isShowItemsBlock.value = state.isShowItemsBlock;
  isShowUserItemsBlock.value = state.isShowUserItemsBlock;
  isShowGroupItems.value = state.isShowGroupItems;

  isSelectAnyNode.value = typeof state.isSelectAnyNode === "boolean" ? state.isSelectAnyNode : true;
}

function saveState() {
  const state = {
    filter: filter.value,
    isShowQuantity: isShowQuantity.value,
    isSelectAnyNode: isSelectAnyNode.value,
    isShowGroupItems: isShowGroupItems.value,
    isShowItemsBlock: isShowItemsBlock.value,
    isShowUserItemsBlock: isShowUserItemsBlock.value,
  };
  byIslandState[props.island.id] = {
    userNodesIds: Object.keys(userNodesMap.value).map((id) => parseInt(id)),
    userNodesGoingIds: Object.values(userNodesMap.value)
      .filter((node) => node.isGoingChecked)
      .map((node) => parseInt(node.id)),
    scale: scale.value,
    translateX: translateX.value,
    translateY: translateY.value,
  };
  state.byIsland = byIslandState;

  localStorage.setItem(componentId, JSON.stringify(state));
}
</script>
