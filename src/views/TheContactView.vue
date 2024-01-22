<template>
  <div class="container">
    <h1>Контакты</h1>
    <p>
      Если вы имеете интересные идеи или вопросы, пожалуйста, заполните
      следующие поля на форме для связи с нами. Спасибо!
    </p>
    <p>
      Если что то не работает то, возможно, волшебное обновление страницы
      поможет, Ctrl+F5.
    </p>
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

setMetaInfo({
  title: "Контакты и обратная связь",
  description: "Оставить обратную связь, связаться с администратором",
  keywords: "контакты, связаться с автором, связь, обратная связь",
});
</script>
