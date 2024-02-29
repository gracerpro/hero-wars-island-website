<template>
  <div class="container">
    <h1>{{ t("common.about") }}</h1>
    <p>{{ t("page.about.paragraph1") }}</p>
    <p>{{ t("page.about.reasons") }}</p>
    <ol>
      <li>{{ t("page.about.reason1") }}</li>
      <li>{{ t("page.about.reason2") }}</li>
    </ol>
    <p>
      <router-link :to="createI18nRouteTo({ name: 'contact' })">{{
        t("page.about.iWillAcceptAnyFeedback")
      }}</router-link>
      {{ t("page.about.feedbackQuestions") }}
    </p>
    <p>
      {{ t("page.about.coolHelpProject") }}
      <router-link :to="createI18nRouteTo({ name: 'help' })">{{
        t("page.about.coolHelpProjectLink")
      }}</router-link>
    </p>
    <p :title="t('common.version')"><span class="badge text-bg-info">{{ version }}</span></p>
  </div>
</template>
<script setup>
import { setMetaInfo } from "@/services/page-meta";
import { useI18n } from "vue-i18n";
import { createI18nRouteTo } from "@/i18n/translation";
import { useSSRContext } from "vue";

const { t } = useI18n();
const ssrContext = import.meta.env.SSR ? useSSRContext() : null;
const version = import.meta.env.VITE_VERSION;

setMetaInfo({
  title: t("seo.about.title") + " - " + t("common.projectName"),
  description: t("seo.about.description"),
  keywords: t("seo.about.keywords"),
}, ssrContext);
</script>
