<template>
  <div class="alert alert-warning">
    {{ t("page.island.planRenderMapMessage") }}
  </div>
</template>
<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
