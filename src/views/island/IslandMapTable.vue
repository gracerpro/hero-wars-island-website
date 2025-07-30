<script>
const EVENT_UPDATE_IS_SHOW_BLOCK = "update:isShowBlock";
</script>
<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { ViewReward } from "./map";

interface Props {
  header: string,
  isShowBlock: boolean,
  rewards: Array<ViewReward>,
  visibleRewardsCount: number,
}

defineProps<Props>();

const emit = defineEmits<{
  [EVENT_UPDATE_IS_SHOW_BLOCK]: [value: boolean],
}>();

const { t } = useI18n();

const getItemName = (item: ViewReward) => {
  return item.item.name.length > 0 ? item.item.name : t("common.noName");
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
      class="heightable pe-2"
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
            v-for="reward in rewards"
            v-else
            :key="reward.uniqueId"
          >
            <td>
              <img
                v-if="reward.item.iconUrl && reward.item.iconWidth && reward.item.iconHeight"
                :src="reward.item.iconUrl"
                :width="reward.item.iconWidth"
                :height="reward.item.iconHeight"
                class="icon"
              />
            </td>
            <td>{{ getItemName(reward) }}</td>
            <td class="text-end">{{ reward.humanQuantity }}</td>
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
