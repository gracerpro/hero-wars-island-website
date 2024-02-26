<template>
  <div class="container">
    <h1>{{ t("common.contacts") }}</h1>
    <p>{{ t("page.contact.fillFieldsForContact") }}</p>
    <p>{{ t("page.contact.ctrlF5") }}</p>
    <div class="row">
      <div class="col-lg-8 offset-lg-2 border border-primary rounded-3">
        <contact-form />
      </div>
    </div>
  </div>
</template>
<script setup>
import { setMetaInfo } from "@/services/page-meta";
import ContactForm from "./contact/ContactForm.vue";
import { useI18n } from "vue-i18n";
import { useSSRContext } from "vue";

const { t } = useI18n();

let ssrContext;

if (import.meta.env.SSR) {
  ssrContext = useSSRContext();
}

setMetaInfo({
  title: t("seo.contact.title") + " - " + t("common.projectName"),
  description: t("seo.contact.description"),
  keywords: t("seo.contact.keywords"),
}, ssrContext);
</script>
