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
        :is-only-image="isOnlyImage"
        :is-show-no-moderate="isShowNoModerate"
        :can-edit-nodes="canEditNodes"
        @update:is-only-image="onChangeOnlyImage"
        @update:is-show-no-moderate="onChangeIsShowNoModerate"
        @reset-scale="onResetScale"
        @reset-translate="onResetTranslate"
        @change-scale="onChangeScale"
        @change-translate="onChangeTranslate"
        @fullscreen-on="onFullscreen"
      />
      <island-map-container
        :scale="scale"
        :translate-x="translateX"
        :translate-y="translateY"
        :is-only-image="isOnlyImage"
        :is-show-no-moderate="isShowNoModerate"
        :items="visibleItems"
        :input-nodes="nodes"
        :user-nodes-map="userNodesMap"
        @change-translate="onChangeTranslate"
        @change-scale="onChangeScale"
        @change-node="onChangeNode"
        @select-node="onSelectNode"
        ref="mapContainer"
      />
      <div class="row mt-3">
        <div class="col-lg-6">
          <island-map-filter
            v-model:item-name="filter.itemName"
            v-model:type-id="filter.typeId"
            v-model:is-node-type-tower="filter.isNodeTypeTower"
            v-model:is-node-type-chest="filter.isNodeTypeChest"
            :min-chars-count="minCharsCount"
          />
        </div>
        <div class="col-lg-6">
          <div class="mb-2">
            <router-link
              :to="createI18nRouteTo({ name: 'contact' })"
              class="float-end"
              >{{ t("common.haveErrosOrProposal") }}</router-link
            >
            {{ t("page.island.myExplorersMoves") }}
          </div>
          <div>
            <span class="fs-4 me-2 align-middle">
              <b>{{ userNodesCount }}</b> / {{ totalNodesCount }}
            </span>
            <button
              type="button"
              :class="['btn btn-secondary align-middle', userNodesCount > 0 ? '' : 'disabled']"
              @click="onResetUserNodes"
            >
              {{ t("common.reset") }}
            </button>
          </div>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-lg-6">
          <island-map-table :items="visibleItems" />
        </div>
        <div class="col-lg-6">
          <island-map-table :items="userItems" />
        </div>
      </div>
      <div class="row">
        <div class="col-lg-6">
          <h3 class="mt-2">{{ t("common.groupData") }}</h3>
          <a
            href="#"
            @click.prevent="isShowGroupItems = !isShowGroupItems"
          >
            {{ t(isShowGroupItems ? "common.hide" : "common.show") }}
          </a>
          <island-map-group-items
            v-if="isShowGroupItems"
            :items="items"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import IslandMapLoading from "./IslandMapLoading.vue";
import IslandMapToolbar from "./IslandMapToolbar.vue";
import IslandMapContainer from "./IslandMapContainer.vue";
import IslandMapFilter from "./IslandMapFilter.vue";
import IslandMapTable from "./IslandMapTable.vue";
import IslandMapGroupItems from "./IslandMapGroupItems.vue";
import { canEditNode, canSelectNode } from "@/services/island-map";
import { onMounted, onUnmounted, ref, computed, shallowReactive } from "vue";
import { getHumanQunatity } from "@/helpers/formatter";
import { useI18n } from "vue-i18n";
import { createI18nRouteTo } from "@/i18n/translation";
import { fullscreenElement } from "@/core/fullscreen";
import { TYPE_CHEST, TYPE_TOWN } from "@/api/node";
import { isObject } from "@/helpers/core";
import { getNodesMap } from "@/services/api/island-node";

const { t } = useI18n();

const props = defineProps({
  island: { type: Object, required: true },
  parentPageId: { type: String, required: true },
});

let userNodesIds = [];
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
const isOnlyImage = ref(false);
const isShowNoModerate = ref(true);
const isShowGroupItems = ref(false);
const filter = shallowReactive({
  itemName: "",
  typeId: null,
  isNodeTypeTower: false,
  isNodeTypeChest: false,
});
const mapContainer = ref(null);

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
  if (filter.isNodeTypeChest && filter.isNodeTypeTower) {
    resultItems = resultItems.filter((item) => {
      return item.node.typeId === TYPE_CHEST || item.node.typeId === TYPE_TOWN;
    });
  } else if (filter.isNodeTypeChest) {
    resultItems = resultItems.filter((item) => item.node.typeId === TYPE_CHEST);
  } else if (filter.isNodeTypeTower) {
    resultItems = resultItems.filter((item) => item.node.typeId === TYPE_TOWN);
  }

  return resultItems;
});
const userItems = computed(() => {
  return items.value.filter((item) => {
    return userNodesMap.value[item.node.id] !== undefined;
  });
});
const userNodesCount = computed(() => Object.keys(userNodesMap.value).length);
// TODO: if 0?
const totalNodesCount = computed(() => Object.keys(nodes.value).length - 1); // "-1" it means subtract an entry node
const canEditNodes = computed(() => {
  for (const id in nodes.value) {
    const node = nodes.value[id];
    if (canEditNode(node)) {
      return true;
    }
  }

  return false;
});

onMounted(() => {
  loadNodes().then((responseNodes) => {
    nodes.value = responseNodes;
    items.value = calculateItems(responseNodes);
    userNodesMap.value = initUserNodes(responseNodes);
  });
});
onUnmounted(() => {
  saveState();
});

loadState();

async function loadNodes() {
  let nodes = {};

  loadingNodes.value = true;
  try {
    nodes = await getNodesMap(props.island);
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
    if (node && canSelectNode(node)) {
      nodesMap[id] = node;
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

  for (const id in nodes) {
    const node = nodes[id];
    const itemCount = node?.items.length;
    if (!itemCount) {
      continue;
    }

    node.items.forEach((item) => {
      items.push({
        uniqueId: node.mx + "_" + node.my + "_" + item.id,
        iconUrl: item.iconUrl,
        humanQuantity: getHumanQunatity(item.quantity),
        emeraldCost: item.emeraldCost !== null ? item.emeraldCost * item.quantity : null,
        node,
        item,
      });
    });
  }

  calculatingItems.value = false;

  return items;
}
/**
 * @param {Boolean} inc
 */
const onChangeScale = (value) => {
  scale.value += value;

  const MAX_SCALE = 4;
  const MIN_SCALE = 0.3;

  if (scale.value > MAX_SCALE) {
    scale.value = MAX_SCALE;
  } else if (scale.value < MIN_SCALE) {
    scale.value = MIN_SCALE;
  }
};
const onResetScale = () => (scale.value = 1);
const onChangeTranslate = (dx, dy) => {
  if (dx !== 0) {
    translateX.value += dx;
  }
  if (dy !== 0) {
    translateY.value += dy;
  }
};
const onResetTranslate = () => {
  translateX.value = 0;
  translateY.value = 0;
};
const onChangeOnlyImage = () => {
  isOnlyImage.value = !isOnlyImage.value;
};
const onChangeIsShowNoModerate = () => {
  isShowNoModerate.value = !isShowNoModerate.value;
};
const onChangeNode = (node) => {
  if (!nodes.value[node.id]) {
    throw new Error(t("page.island.notFoundNodeAdmin"));
  }
  nodes.value[node.id] = node;
};
const onSelectNode = (id, isRemove) => {
  if (isRemove) {
    delete userNodesMap.value[id];
  } else {
    if (!nodes.value[id]) {
      throw new Error(t("page.island.notFoundNodeAdmin"));
    }
    userNodesMap.value[id] = nodes.value[id];
  }
};
const onResetUserNodes = () => (userNodesMap.value = {});

const onFullscreen = () => {
  fullscreenElement(mapContainer.value.canvas);
};

function loadState() {
  let state;

  try {
    state = JSON.parse(localStorage.getItem(componentId));
  } catch (error) {
    console.error(error);
  }

  if (!state) {
    state = {
      isOnlyImage: false,
      isShowNoModerate: true,
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

  if (!state.isOnlyImage) {
    state.isOnlyImage = false;
  }
  if (state.isShowNoModerate === undefined) {
    state.isShowNoModerate = true;
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

  filter.value = state.filter;
  isOnlyImage.value = state.isOnlyImage;
  isShowNoModerate.value = state.isShowNoModerate;
}

function saveState() {
  const state = {
    filter: filter.value,
    isOnlyImage: isOnlyImage.value,
    isShowNoModerate: isShowNoModerate.value,
  };
  byIslandState[props.island.id] = {
    userNodesIds: Object.keys(userNodesMap.value).map((id) => parseInt(id)),
    scale: scale.value,
    translateX: translateX.value,
    translateY: translateY.value,
  };
  state.byIsland = byIslandState;

  localStorage.setItem(componentId, JSON.stringify(state));
}
</script>
<style scoped>
.map {
  margin-left: 45px;
  height: 600px;
  outline: 1px solid #dddddd;
}

.-left-toolbar {
  width: 40px;
  float: left;
}
</style>
