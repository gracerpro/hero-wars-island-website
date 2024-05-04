<template>
<div>
  <h2 class="mt-3">{{ t("common.feedback") }}</h2>

  <row-loading v-if="loading" />
  <div v-else-if="errorMessage" class="alert alert-danger">
    {{ errorMessage }}
  </div>
  <div v-else v-for="item in feedbackItems" :key="item.id" class="mb-4">
    <h5>{{ item.subject }}</h5>
    <div>
      <span class="fst-italic">{{ fromCurrentDate(item.createdAt) }}</span>&nbsp;
      <span :class="['badge', getStatusClass(item.status)]">{{ getStatusName(t, item.status) }}</span>
    </div>
    <div class="mt-2">{{ item.message }}</div>
    <div v-if="item.answer">
      <span class="text-danger-emphasis">{{ t("common.administratorAnswer") }}:</span>
      {{ item.answer }}
    </div>
  </div>
  <div v-if="hasMoreItems">
    <button class="btn btn-default">{{ t("common.showMore") }}</button>
  </div>
</div>
</template>
<script setup>
import { useI18n } from "vue-i18n";
import { ref, computed } from "vue";
import RowLoading from "@/components/RowLoading.vue"
import HeroClient from "@/api/HeroClient";
import { fromCurrentDate } from "@/helpers/formatter";
import { STATUS_CREATED, STATUS_ABORT, STATUS_CLOSED, STATUS_QUEUE, getStatusName } from "@/api/Feedback"

const { t } = useI18n();
const client = new HeroClient();

const feedbackItems = ref([]);
const feedbackTotalCount = ref(0);
const loading = ref(true);
const errorMessage = ref("");
const pageSize = 2;
const pageNumber = ref(1);

const hasMoreItems = computed(() => pageNumber.value * pageSize < feedbackTotalCount.value);

loadFeedbackItems()

function getStatusClass(status) {
  let classes = {
    [STATUS_CREATED]: "text-bg-primary",
    [STATUS_ABORT]: "text-bg-danger",
    [STATUS_CLOSED]: "text-bg-success",
    [STATUS_QUEUE]: "text-bg-secondary",
  }

  return classes[status] ? classes[status] : "text-bg-info";
}

function loadFeedbackItems() {
  loading.value = true;
  client.feedback
    .getList(5)
    .then((list) => {
      console.log("loaded...", list)
      feedbackItems.value = list.items;
      feedbackTotalCount.value = list.totalCount;
    })
    .catch(() => {
      errorMessage.value = t("common.loadingFailDeveloperShow");
    })
    .finally(() => (loading.value = false));
}
</script>