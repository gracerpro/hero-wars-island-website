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
      <router-link to="/contact">{{
        t("page.about.iWillAcceptAnyFeedback")
      }}</router-link>
      {{ t("page.about.feedbackQuestions") }}
    </p>
    <p>
      {{ t("page.about.coolHelpProject") }}
      <router-link to="/help">{{
        t("page.about.coolHelpProjectLink")
      }}</router-link>
    </p>
  </div>
</template>
<script setup>
import { setMetaInfo } from "@/services/page-meta";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

setMetaInfo({
  title: t("seo.about.title") + " - " + t("common.projectName"),
  description: t("seo.about.description"),
  keywords: t("seo.about.keywords"),
});
</script>
