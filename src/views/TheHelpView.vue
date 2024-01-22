<template>
  <div class="container">
    <h1>{{ t("page.help.helpToProject") }}</h1>

    <p>{{ t("page.help.paragraph1") }}</p>
    <ul>
      <li>
        {{ t("page.help.help1") }}
        <a
          href="https://github.com/gracerpro/hero-wars-island-website"
          target="_blank"
        >
          https://github.com/gracerpro/hero-wars-island-website
        </a>
      </li>
      <li>{{ t("page.help.help2") }}</li>
      <li>{{ t("page.help.help3") }}</li>
      <li>{{ t("page.help.help4") }}</li>
    </ul>

    <h2>TODO</h2>
    <ul>
      <li>{{ t("page.help.todo1") }}</li>
      <li>{{ t("page.help.todo2") }}</li>
    </ul>
  </div>
</template>
<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
