<template>
  <div class="container">
    <h1>{{ t("page.help.helpToProject") }}</h1>

    <p>{{ t("page.help.paragraph1") }}</p>
    <ul>
      <li>
        {{ t("page.help.help1") }}<br />
        <ul>
          <li>
            <a
              href="https://github.com/gracerpro/hero-wars-island-website"
              target="_blank"
            >
              https://github.com/gracerpro/hero-wars-island-website</a
            ><br />
          </li>
          <li>
            <a href="/backend-api/index.html">API</a>
          </li>
        </ul>
      </li>
      <li>{{ t("page.help.help2") }}</li>
      <li>{{ t("page.help.help3") }}</li>
      <li>{{ t("page.help.help4") }}</li>
    </ul>

    <h2>TODO</h2>
    <ul>
      <li>{{ t("page.help.todo1") }}</li>
      <li>{{ t("page.help.todo2") }}</li>
      <li>{{ t("page.help.todo3") }}</li>
    </ul>
  </div>
</template>
<script setup>
import { setMetaInfo } from "@/services/page-meta";
import { useSSRContext } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const ssrContext = import.meta.env.SSR ? useSSRContext() : null;

setMetaInfo({
  title: t("seo.help.title") + " - " + t("common.projectName"),
  description: t("seo.help.description"),
  keywords: t("seo.help.keywords"),
}, ssrContext);
</script>
