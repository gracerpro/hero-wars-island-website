<template>
  <div>
    <button type="button" @click="onClick">{{ counter }}</button>
  </div>
</template>
<script setup>
import { ref } from "vue";
const counter = ref(0);

const onClick = () => {
  ++counter.value;
}
</script>
