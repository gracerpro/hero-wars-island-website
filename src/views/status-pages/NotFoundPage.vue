<template>
  <div class="container">
    <h1>Страница не найдена</h1>

    <p v-if="returnUrl">
      Была попытка перейти по адресу <code>{{ returnUrl }}</code
      >.
    </p>
  </div>
</template>
<script setup>
import { setMetaInfo } from "@/services/page-meta";
import { computed } from "vue";

setMetaInfo({
  title: "Страница не найдена",
  description: "Страница не найдена",
  keywords: "404, страница не найдена",
});

const returnUrl = computed(() => this.$route.query.returnUrl);
</script>
