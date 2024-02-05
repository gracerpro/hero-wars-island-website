<template>
  <table class="table table-striped table-hover table-sm mt-3">
    <thead>
      <tr>
        <th></th>
        <th>{{ t("common.resource") }}</th>
        <th>{{ t("common.quantity") }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="!items.length">
        <td colspan="3">{{ t("common.noData") }}</td>
      </tr>
      <tr v-else v-for="item in items" :key="item.uniqueId">
        <td>
          <img
            v-if="item.item.iconUrl"
            :src="item.item.iconUrl"
            :width="item.item.iconWidth"
            :height="item.item.iconHeight"
            class="icon"
          />
        </td>
        <td>{{ getItemName(item) }}</td>
        <td class="text-end">{{ item.humanQuantity }}</td>
      </tr>
    </tbody>
  </table>
</template>
<script setup>
import { useI18n } from "vue-i18n";

defineProps({
  items: { type: Array, required: true },
});
const { t } = useI18n();

const getItemName = (item) => {
  return item.item.name ? item.item.name : t("common.noName");
};
</script>
<style scoped>
.icon {
  width: 24px;
  height: 24px;
}
</style>
