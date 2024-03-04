<template>
  <div class="heightable">
    <table class="table table-striped table-hover table-sm">
      <thead>
        <tr>
          <th></th>
          <th>{{ t("common.resource") }}</th>
          <th>{{ t("common.quantity") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in groupItems"
          :key="item.id"
        >
          <td>
            <img
              v-if="item.item.iconUrl"
              :src="item.item.iconUrl"
              :width="item.item.iconWidth"
              :height="item.item.iconHeight"
              class="item-icon"
            />
          </td>
          <td>{{ getItemName(item) }}</td>
          <td class="text-end">{{ item.quantity }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import { useI18n } from "vue-i18n";
import { computed } from "vue";

const { t } = useI18n();

const props = defineProps({
  items: { type: Object, required: true },
});

const groupItems = computed(() => {
  let map = {};

  props.items.forEach(({ item }) => {
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

  return arr;
});

function getItemName(item) {
  return item.item.name ? item.item.name : t("common.noName");
}
</script>
<style>
.item-icon {
  width: 24px;
  height: 24px;
}
.heightable {
  max-height: 90vh;
  overflow: auto;
}
</style>
