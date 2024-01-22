<template>
  <div class="container">
    <h1>{{ t("page.contact.contacts") }}</h1>
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
import ContactForm from "./ContactForm.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

setMetaInfo({
  title: t("page.contact.contacts"),
  description: "Оставить обратную связь, связаться с администратором",
  keywords: "контакты, связаться с автором, связь, обратная связь",
});
</script>
