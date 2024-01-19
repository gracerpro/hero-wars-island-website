<template>
  <div class="container">
    <h1>404 Страница не найдена</h1>
    <p>Возможно, страница была перемещена.</p>
    <p><a href="/">Перейти на главную</a></p>
  </div>
</template>
<script setup>
import { setMetaInfo } from "@/services/page-meta";

setMetaInfo({
  title: "Страница не найдена",
  description: "Страница не найдена",
  keywords: "404, страница не найдена",
});

window.location.reload();
</script>
