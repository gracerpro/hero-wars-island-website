<template>
  <div>
    <loading-map v-if="loading" />
    <div v-else>
      <map-toolbar
        @reset-scale="onResetScale"
        @reset-translate="onResetTranslate"
        @change-scale="onChangeScale"
        @change-translate="onChangeTranslate"
      />
      <map-container
        :scale="scale"
        :translate-x="translateX"
        :translate-y="translateY"
        :items="visibleItems"
        :input-nodes="nodes"
        @change-translate="onChangeTranslate"
        @change-scale="onChangeScale"
        @change-node="onChangeNode"
      />
      <div class="row mt-3">
        <div class="col-lg-6">
          <div>
            <label for="table__itemName" class="form-label">Предмет</label>
            <input
              v-model.trim="filter.itemName"
              id="table__itemName"
              class="form-control"
              @input="onInputItemName"
            />
            <div class="form-text fw-normal">
              Нужно ввести от {{ minCharsCount }} символов
            </div>
          </div>

          <table class="table table-striped table-hover table-sm">
            <thead>
              <tr>
                <th>Предмет</th>
                <th>Количество</th>
                <th>Стоимость в изумрудах</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!visibleItems.length">
                <td colspan="4">Нет данных.</td>
              </tr>
              <tr v-else v-for="item in visibleItems" :key="item.uniqueId">
                <td>{{ item.item.name }}</td>
                <td class="text-end">{{ item.humanQuantity }}</td>
                <td class="text-end">{{ item.emeraldCost }}</td>
              </tr>
            </tbody>
          </table>
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

const MAX_SCALE = 3;
const MIN_SCALE = 0.3;

export default {
  client: new HeroClient(),

  name: "IslandMap",
  props: {
    island: { type: Object, required: true },
    parentPageId: { type: String, required: true },
  },
  components: { LoadingMap, MapToolbar, MapContainer },
  data: function () {
    return {
      loaded: false,
      loadingNodes: true,
      loadingItems: false,

      nodes: [],
      items: [],

      scale: 1,
      translateX: 0,
      translateY: 0,

      filter: {
        itemName: "",
      },
    };
  },
  computed: {
    loading() {
      return this.loadingNodes || this.loadingItems || !this.loaded;
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
          item.item.name.includes(this.filter.itemName)
        );
      }

      return this.items;
    },
  },
  created() {
    this.loadState();
  },
  mounted() {
    this.loadNodes().then((nodes) => {
      this.nodes = nodes;
      this.items = this.calculateItems(nodes);
      this.loaded = true;
    });
  },
  unmounted() {
    this.saveState();
  },
  methods: {
    async loadNodes() {
      let nodes = [];

      this.loadingNodes = true;
      try {
        const list = await this.$options.client.getNodes(this.island.id);
        nodes = list.items;
      } finally {
        this.loadingNodes = false;
      }

      return nodes;
    },
    calculateItems(nodes) {
      this.loadingItems = true;

      let items = [];

      nodes.forEach((node) => {
        const itemCount = node?.items.length;
        if (!itemCount) {
          return;
        }

        node.items.forEach((item, index) => {
          items.push({
            uniqueId: node.mx + "_" + node.my + "_" + item.id,
            iconUrl: item.iconUrl,
            humanQuantity: this.getHumanQunatity(item.quantity),
            emeraldCost:
              item.emeraldCost !== null
                ? item.emeraldCost * item.quantity
                : null,
            nodeIndex: index,
            node,
            item,
          });
        });
      });

      this.loadingItems = false;

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
    onChangeNode(node) {
      const index = this.nodes.findIndex((item) => item.id === node.id);
      if (index >= 0) {
        this.nodes[index] = node;
      }
    },
    onInputItemName() {
      if (this.filter.itemName.length < this.minCharsCount) {
        return;
      }
    },
    getHumanQunatity(quantity) {
      if (quantity > 1000000) {
        return Math.floor(quantity / 1000000) + "M";
      }
      if (quantity > 1000) {
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

      this.scale = state.scale;
      this.translateX = state.translateX;
      this.translateY = state.translateY;
      this.filter.itemName = state.filter.itemName;
    },
    saveState() {
      const state = {
        scale: this.scale,
        translateX: this.translateX,
        translateY: this.translateY,
        filter: this.filter,
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
