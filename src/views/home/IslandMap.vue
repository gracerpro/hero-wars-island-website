<template>
  <div>
    <loading-map v-if="loading" />
    <div v-else-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>
    <div v-else>
      <map-toolbar
        :is-only-image="isOnlyImage"
        :is-show-no-moderate="isShowNoModerate"
        @update:is-only-image="onChangeOnlyImage"
        @update:is-show-no-moderate="onChangeIsShowNoModerate"
        @reset-scale="onResetScale"
        @reset-translate="onResetTranslate"
        @change-scale="onChangeScale"
        @change-translate="onChangeTranslate"
      />
      <map-container
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
          <map-filter
            v-model:item-name="filter.itemName"
            :min-chars-count="minCharsCount"
          />
          <map-table :items="visibleItems" />
        </div>
        <div class="col-lg-6">
          <div class="mb-2">
            <router-link to="/contact" class="float-end"
              >Есть ошибка или предложение?</router-link
            >
            Мои ходы
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
              Сбросить
            </button>
          </div>
          <div class="form-text fw-normal">&nbsp;</div>
          <map-table :items="userItems" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import HeroClient from "@/api/HeroClient";
import LoadingMap from "./LoadingMap.vue";
import MapToolbar from "./MapToolbar.vue";
import MapContainer from "./MapContainer.vue";
import MapFilter from "./MapFilter.vue";
import MapTable from "./MapTable.vue";
import { canSelectNode } from "./map";

const MAX_SCALE = 3;
const MIN_SCALE = 0.3;

export default {
  client: new HeroClient(),
  userNodesIds: {},

  name: "IslandMap",
  props: {
    island: { type: Object, required: true },
    parentPageId: { type: String, required: true },
  },
  components: { LoadingMap, MapToolbar, MapContainer, MapFilter, MapTable },
  data: function () {
    return {
      loaded: false,
      loadingNodes: true,
      calculatingItems: false,
      errorMessage: "",

      nodes: [],
      items: [],
      userNodes: {},

      scale: 1,
      translateX: 0,
      translateY: 0,
      isOnlyImage: false,
      isShowNoModerate: true,

      filter: {
        itemName: "",
      },
    };
  },
  computed: {
    loading() {
      return this.loadingNodes || this.calculatingItems || !this.loaded;
    },
    minCharsCount() {
      return 3;
    },
    componentId() {
      return this.parentPageId + "__map";
    },
    visibleItems() {
      if (this.filter.itemName.length >= this.minCharsCount) {
        return this.items.filter((item) =>
          item.item.name
            .toLowerCase()
            .includes(this.filter.itemName.toLowerCase())
        );
      }

      return this.items;
    },
    userItems() {
      return this.items.filter((item) => {
        return this.userNodes[item.node.id] !== undefined;
      });
    },
    userNodesCount() {
      return Object.keys(this.userNodes).length;
    },
  },
  created() {
    this.loadState();
  },
  mounted() {
    this.loadNodes().then((nodes) => {
      this.nodes = nodes;
      this.items = this.calculateItems(nodes);
      this.userNodes = this.initUserNodes(nodes);

      this.loaded = true;
    });
  },
  unmounted() {
    this.saveState();
  },
  methods: {
    async loadNodes() {
      let nodes = {};

      this.loadingNodes = true;
      try {
        const list = await this.$options.client.getNodes(this.island.id);
        list.items.forEach((node) => {
          nodes[node.id] = node;
        });
      } catch (error) {
        this.errorMessage = "Не удалось загрузить узлы карты.";
      } finally {
        this.loadingNodes = false;
      }

      return nodes;
    },
    initUserNodes(nodes) {
      let resultNodes = {};
      const ids = this.$options.userNodesIds[this.island.id]
        ? this.$options.userNodesIds[this.island.id]
        : [];

      ids.forEach((id) => {
        const node = nodes[id];
        if (node && canSelectNode(node)) {
          resultNodes[id] = node;
        }
      });

      return resultNodes;
    },
    /**
     * @param {Object} nodes
     */
    calculateItems(nodes) {
      this.calculatingItems = true;

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
            humanQuantity: this.getHumanQunatity(item.quantity),
            emeraldCost:
              item.emeraldCost !== null
                ? item.emeraldCost * item.quantity
                : null,
            node,
            item,
          });
        });
      }

      this.calculatingItems = false;

      return items;
    },
    /**
     * @param {Boolean} inc
     */
    onChangeScale(value) {
      this.scale += value;

      if (this.scale > MAX_SCALE) {
        this.scale = MAX_SCALE;
      } else if (this.scale < MIN_SCALE) {
        this.scale = MIN_SCALE;
      }
    },
    onResetScale() {
      this.scale = 1;
    },
    onChangeTranslate(dx, dy) {
      if (dx !== 0) {
        this.translateX += dx;
      }
      if (dy !== 0) {
        this.translateY += dy;
      }
    },
    onResetTranslate() {
      this.translateX = 0;
      this.translateY = 0;
    },
    onChangeOnlyImage() {
      this.isOnlyImage = !this.isOnlyImage;
    },
    onChangeIsShowNoModerate() {
      this.isShowNoModerate = !this.isShowNoModerate;
    },
    onChangeNode(node) {
      if (!this.nodes[node.id]) {
        throw new Error("Узел не найден. Обратитесь к администраторам.");
      }
      this.nodes[node.id] = node;
    },
    onSelectNode(id, isRemove) {
      if (isRemove) {
        delete this.userNodes[id];
      } else {
        if (!this.nodes[id]) {
          throw new Error("Узел не найден. Обратитесь к администраторам.");
        }
        this.userNodes[id] = this.nodes[id];
      }
    },
    onResetUserNodes() {
      this.userNodes = {};
    },
    getHumanQunatity(quantity) {
      // max 4 chars

      if (quantity >= 1000000) {
        if (quantity % 100000 === 0) {
          return quantity / 1000000 + "M";
        }
        return Math.floor(quantity / 1000000) + "M";
      }
      if (quantity >= 1000) {
        if (quantity % 100 === 0) {
          return quantity / 1000 + "K";
        }
        return Math.floor(quantity / 1000) + "K";
      }

      return quantity;
    },
    loadState() {
      let state;

      try {
        state = JSON.parse(localStorage.getItem(this.componentId));
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
      if (!state.userNodesIds || typeof state.userNodesIds !== "object") {
        state.userNodesIds = {};
      }
      if (!state.isOnlyImage) {
        state.isOnlyImage = false;
      }
      if (state.isShowNoModerate === undefined) {
        state.isShowNoModerate = true;
      }

      this.scale = state.scale;
      this.translateX = state.translateX;
      this.translateY = state.translateY;
      this.filter.itemName = state.filter.itemName;
      this.isOnlyImage = state.isOnlyImage;
      this.isShowNoModerate = state.isShowNoModerate;

      this.$options.userNodesIds = state.userNodesIds;
    },
    saveState() {
      let userNodesIds = this.$options.userNodesIds;

      userNodesIds[this.island.id] = Object.keys(this.userNodes);

      const state = {
        scale: this.scale,
        translateX: this.translateX,
        translateY: this.translateY,
        filter: this.filter,
        isOnlyImage: this.isOnlyImage,
        isShowNoModerate: this.isShowNoModerate,
        userNodesIds,
      };
      localStorage.setItem(this.componentId, JSON.stringify(state));
    },
  },
};
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
