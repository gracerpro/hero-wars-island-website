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
import { useRoute } from "vue-router";

setMetaInfo({
  title: "Страница не найдена",
  description: "Страница не найдена",
  keywords: "404, страница не найдена",
});

const route = useRoute();
const returnUrl = computed(() => route.query.returnUrl);
</script>
