<template>
  <div class="container">
    <div v-if="loading">
      <div class="placeholder-glow">
        <span class="placeholder col-3"></span>
      </div>
      <div class="placeholder-glow">
        <span class="placeholder col-1"></span>
      </div>
      <row-loading  />
    </div>
    <div v-else>
      <h1>{{ oneNews.name }}</h1>
      <div class="fst-italic">{{ fromCurrentDate(oneNews.createdAt) }}</div>

      <div v-html="oneNews.content" class="mt-4"></div>
    </div>
  </div>
</template>
<script setup>
import HeroClient from "@/api/HeroClient";
import RowLoading from "@/components/RowLoading.vue";
import { ref } from "vue";
import { useRoute } from "vue-router";
import { fromCurrentDate } from "@/helpers/formatter";
import HttpError from "@/exceptions/HttpError";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();

const slug = route.params.slug;
console.log(slug)

const client = new HeroClient();

const errorMessage = ref("");
const loading = ref(true);
const oneNews = ref({
  id: null,
  createdAt: null,
  updatedAt: null,
  slug: "",
  name: "",
  content: "",
})

try {
  loadOneNews()
} catch(error) {
  if (error instanceof HttpError && error.statusCode === 404) {
    errorMessage.value = t("common.pageNotFound");
  } else {
    throw error
  }
}

function loadOneNews() {
  client.news
    .get(slug)
    .then((responseOneNews) => {
      oneNews.value = responseOneNews
    })
    .finally(() => (loading.value = false));
}
</script>