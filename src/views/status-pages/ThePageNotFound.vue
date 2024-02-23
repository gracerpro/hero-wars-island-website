<template>
  <div class="container">
    <h1>404 {{ t("common.pageNotFound") }}</h1>
    <p>{{ t("common.movedPageMayBe") }}</p>
    <p>
      <a href="/">{{ t("common.goToHome") }}</a>
    </p>
  </div>
</template>
<script setup>
import { setMetaInfo } from "@/services/page-meta";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const notFound = t("common.pageNotFound");

setMetaInfo({
  title: notFound,
  description: notFound,
  keywords: "404, " + notFound,
});
</script>
