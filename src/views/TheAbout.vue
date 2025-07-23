<script setup lang="ts">
import { setMetaInfo } from "@/services/page-meta";
import { useI18n } from "vue-i18n";
import { createI18nRouteTo } from "@/i18n/translation";
import { onMounted, ref, useSSRContext } from "vue";
import { getHumanSize } from "@/helpers/formatter";
import { getIndexedDbSize, getLocalStorageSize } from "@/core/storage";

const { t } = useI18n();
const ssrContext = import.meta.env.SSR ? useSSRContext() : undefined;
const version = import.meta.env.VITE_VERSION;

setMetaInfo(
  {
    title: t("seo.about.title") + " - " + t("common.projectName"),
    description: t("seo.about.description"),
    keywords: t("seo.about.keywords"),
  },
  ssrContext
);

const localStorageSize = ref(0);
const indexedDbSize = ref(0);

if (!import.meta.env.SSR) {
  onMounted(() => {
    localStorageSize.value = getLocalStorageSize();
    getIndexedDbSize().then((size) => (indexedDbSize.value = size));
  });
}
</script>

<template>
  <div class="container text-container">
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
    <p :title="t('common.version')">
      <span class="badge text-bg-info">{{ version }}</span>
    </p>
    <hr />
    <p>
      {{ t("page.about.localStorageSize") }}
      <b>{{ localStorageSize > 0 ? getHumanSize(localStorageSize) : "_" }}</b>
    </p>
    <p>
      {{ t("page.about.dbSize") }}
      <b>{{ indexedDbSize > 0 ? getHumanSize(indexedDbSize) : "_" }}</b>
    </p>
  </div>
</template>
