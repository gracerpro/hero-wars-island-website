<template>
  <div class="container">
    <h1>500 {{ t("common.internalServerError") }}</h1>
    <p>
      <a href="/">{{ t("common.goToHome") }}</a>
    </p>
  </div>
</template>
<script setup>
import { setMetaInfo } from "@/services/page-meta";
import { useSSRContext } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const title = t("common.internalServerError");

let ssrContext;

if (import.meta.env.SSR) {
  ssrContext = useSSRContext();
}

setMetaInfo({
  title,
  description: title,
  keywords: `500, ${title}`,
}, ssrContext);
</script>
