<template>
  <div>
    <island-map-loading v-if="loading" />
    <div v-else-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>
    <div v-else>
      <island-map-toolbar
        :is-only-image="isOnlyImage"
        :is-show-no-moderate="isShowNoModerate"
        @update:is-only-image="onChangeOnlyImage"
        @update:is-show-no-moderate="onChangeIsShowNoModerate"
        @reset-scale="onResetScale"
        @reset-translate="onResetTranslate"
        @change-scale="onChangeScale"
        @change-translate="onChangeTranslate"
      />
      <island-map-container
        :scale="scale"
        :translate-x="translateX"
        :translate-y="translateY"
        :is-only-image="isOnlyImage"
        :is-show-no-moderate="isShowNoModerate"
        :items="visibleItems"
        :input-nodes="nodes"
        :user-nodes="userNodes"
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
            :min-chars-count="minCharsCount"
          />
          <island-map-table :items="visibleItems" />
        </div>
        <div class="col-lg-6">
          <div class="mb-2">
            <router-link to="/contact" class="float-end">{{
              t("common.haveErrosOrProposal")
            }}</router-link>
            {{ t("page.island.myExplorersMoves") }}
          </div>
          <div>
            <b class="fs-4 me-2 align-middle">{{ userNodesCount }}</b>
            <button
              type="button"
              :class="[
                'btn btn-secondary align-middle',
                userNodesCount > 0 ? '' : 'disabled',
              ]"
              @click="onResetUserNodes"
            >
              {{ t("common.reset") }}
            </button>
          </div>
          <div class="form-text fw-normal">&nbsp;</div>
          <island-map-table :items="userItems" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import HeroClient from "@/api/HeroClient";
import IslandMapLoading from "./IslandMapLoading.vue";
import IslandMapToolbar from "./IslandMapToolbar.vue";
import IslandMapContainer from "./IslandMapContainer.vue";
import IslandMapFilter from "./IslandMapFilter.vue";
import IslandMapTable from "./IslandMapTable.vue";
import { canSelectNode } from "@/services/island-map";
import { onMounted, onUnmounted, ref, computed, shallowReactive } from "vue";
import { getHumanQunatity } from "@/helpers/formatter";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const MAX_SCALE = 3;
const MIN_SCALE = 0.3;

const client = new HeroClient();
let userNodesIds = {};

const props = defineProps({
  island: { type: Object, required: true },
  parentPageId: { type: String, required: true },
});

const loadingNodes = ref(true);
const calculatingItems = ref(false);
const errorMessage = ref("");
const nodes = ref([]);
const items = ref([]);
const userNodes = ref({});
const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const isOnlyImage = ref(false);
const isShowNoModerate = ref(true);
const filter = shallowReactive({
  itemName: "",
  typeId: null,
});

const minCharsCount = 3;
const componentId = props.parentPageId + "__map";
const loading = computed(() => loadingNodes.value || calculatingItems.value);
const visibleItems = computed(() => {
  let resultItems = items.value;

  if (filter.itemName.length >= minCharsCount) {
    resultItems = resultItems.filter((item) =>
      item.item.name.toLowerCase().includes(filter.itemName.toLowerCase()),
    );
  }
  if (filter.typeId > 0) {
    resultItems = resultItems.filter(
      (item) => item.item.typeId === filter.typeId,
    );
  }

  return resultItems;
});
const userItems = computed(() => {
  return items.value.filter((item) => {
    return userNodes.value[item.node.id] !== undefined;
  });
});
const userNodesCount = computed(() => Object.keys(userNodes.value).length);

onMounted(() => {
  loadNodes().then((responseNodes) => {
    nodes.value = responseNodes;
    items.value = calculateItems(responseNodes);
    userNodes.value = initUserNodes(responseNodes);
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
    const list = await client.getNodes(props.island.id);
    list.items.forEach((node) => {
      nodes[node.id] = node;
    });
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
  let resultNodes = {};
  const ids = userNodesIds[props.island.id]
    ? userNodesIds[props.island.id]
    : [];

  ids.forEach((id) => {
    const node = nodes[id];
    if (node && canSelectNode(node)) {
      resultNodes[id] = node;
    }
  });

  return resultNodes;
}
/**
 * @param {Object} nodes
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
        emeraldCost:
          item.emeraldCost !== null ? item.emeraldCost * item.quantity : null,
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
    delete userNodes.value[id];
  } else {
    if (!nodes.value[id]) {
      throw new Error(t("page.island.notFoundNodeAdmin"));
    }
    userNodes.value[id] = nodes.value[id];
  }
};
const onResetUserNodes = () => (userNodes.value = {});

function loadState() {
  let state;

  try {
    state = JSON.parse(localStorage.getItem(componentId));
  } catch (error) {
    console.error(error);
  }

  if (!state) {
    state = {
      scale: 1,
      translateX: 0,
      translateY: 0,
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
  if (!state.userNodesIds || typeof state.userNodesIds !== "object") {
    state.userNodesIds = {};
  }
  if (!state.isOnlyImage) {
    state.isOnlyImage = false;
  }
  if (state.isShowNoModerate === undefined) {
    state.isShowNoModerate = true;
  }

  scale.value = state.scale;
  translateX.value = state.translateX;
  translateY.value = state.translateY;
  filter.itemName = state.filter.itemName;
  filter.typeId = state.filter.typeId;
  isOnlyImage.value = state.isOnlyImage;
  isShowNoModerate.value = state.isShowNoModerate;

  userNodesIds = state.userNodesIds;
}
function saveState() {
  let savedUserNodesIds = userNodesIds;

  savedUserNodesIds[props.island.id] = Object.keys(userNodes.value);

  const state = {
    scale: scale.value,
    translateX: translateX.value,
    translateY: translateY.value,
    filter: filter,
    isOnlyImage: isOnlyImage.value,
    isShowNoModerate: isShowNoModerate.value,
    userNodesIds: savedUserNodesIds,
  };
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
