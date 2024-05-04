<template>
<div>
  <h2 class="mt-3">Обратная связь</h2>

  <row-loading v-if="loading" />
  <div v-else-if="errorMessage" class="alert alert-danger">
    {{ errorMessage }}
  </div>
  <div v-else v-for="item in feedbackItems" :key="item.id" class="mb-3">
    <h5>{{ item.subject }}</h5>
    <div>{{ item.subject }}</div>
    <div v-if="item.answer">
      <span class="badge text-bg-secondary">{{ t("common.administratorAnswer") }}</span>
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

const { t } = useI18n();
const client = new HeroClient();

const feedbackItems = ref([]);
const feedbackTotalCount = ref(0);
const loading = ref(true);
const errorMessage = ref("");
const pageSize = 5;
const pageNumber = ref(1);

const hasMoreItems = computed(() => {
  return pageNumber.value * pageSize < feedbackTotalCount.value
})

loadFeedbackItems()

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