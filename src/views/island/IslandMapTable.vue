<script>
const EVENT_UPDATE_IS_SHOW_BLOCK = "update:isShowBlock";
</script>
<script setup>
import { useI18n } from "vue-i18n";

defineProps({
  header: { type: String, required: true },
  isShowBlock: { type: Boolean, required: true },
  rewards: { type: Array, required: true },
  visibleRewardsCount: { type: Number, required: true },
});
const emit = defineEmits([EVENT_UPDATE_IS_SHOW_BLOCK]);

const { t } = useI18n();

const getItemName = (item) => {
  return item.item.name ? item.item.name : t("common.noName");
};
</script>

<template>
  <div>
    <h3>{{ header }}</h3>
    <a
      href="#"
      @click.prevent="emit(EVENT_UPDATE_IS_SHOW_BLOCK, !isShowBlock)"
    >
      {{ t(isShowBlock ? "common.hide" : "common.show") }}
    </a>
    <span class="badge text-bg-secondary ms-2">{{ visibleRewardsCount }}</span>
    <div
      v-if="isShowBlock"
      class="heightable"
    >
      <table class="table table-striped table-hover table-sm">
        <thead>
          <tr>
            <th></th>
            <th>{{ t("common.resource") }}</th>
            <th>{{ t("common.quantity") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!rewards.length">
            <td colspan="3">{{ t("common.noData") }}</td>
          </tr>
          <tr
            v-for="item in rewards"
            v-else
            :key="item.uniqueId"
          >
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
    </div>
  </div>
</template>

<style scoped>
.icon {
  width: 24px;
  height: 24px;
}
.heightable {
  max-height: 90vh;
  overflow: auto;
}
</style>
