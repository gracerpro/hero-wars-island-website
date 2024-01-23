<template>
  <form role="language">
    <button
      v-for="language in languages"
      :key="language.locale"
      :title="language.label"
      :class="[
        'btn ms-2',
        language.locale === currentLocale
          ? 'btn-success fw-bold'
          : 'btn-outline-success',
      ]"
      @click="onChangeLanguage(language.locale)"
      type="button"
    >
      {{ language.locale }}
    </button>
  </form>
</template>
<script setup>
import {
  setLanguage,
  getLocalesLabels,
  getCurrentLocale,
} from "@/i18n/translation";
import { computed } from "vue";

const currentLocale = computed(() => getCurrentLocale());
const languages = computed(() => getLocalesLabels());

const onChangeLanguage = async (locale) => {
  if (currentLocale.value === locale) {
    return;
  }

  await setLanguage(locale);
};
</script>
