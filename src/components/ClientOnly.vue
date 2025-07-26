<script setup lang="ts">
import { ref, onMounted } from "vue";

const isMounted = ref(false);

onMounted(() => (isMounted.value = true));
</script>

<template>
  <template v-if="isMounted"><slot /></template>
  <template v-else><slot name="placeholder" /></template>
</template>
