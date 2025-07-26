<script setup lang="ts">
import { setMetaInfo } from "@/services/page-meta";
import { useSSRContext } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const title = t("common.pageNotFound");
const ssrContext = import.meta.env.SSR ? useSSRContext() : undefined;

setMetaInfo(
  {
    title,
    description: title,
    keywords: `404, ${title}`,
  },
  ssrContext
);
</script>

<template>
  <div class="container">
    <h1>404 {{ t("common.pageNotFound") }}</h1>
    <p>{{ t("common.movedPageMayBe") }}</p>
    <p>
      <a href="/">{{ t("common.goToHome") }}</a>
    </p>
  </div>
</template>
