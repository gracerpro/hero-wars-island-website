<template>
  <div class="container">
    <h1>...</h1>

    <div>TODO</div>
  </div>
</template>
<script setup>
import { useRoute } from "vue-router";

const route = useRoute();

const slug = route.params.slug;
console.log(slug)

</script>