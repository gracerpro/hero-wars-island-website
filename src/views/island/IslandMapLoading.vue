<template>
  <div>
    <row-loading class="map" />
    <div class="row mb-4">
      <div
        v-for="i in 2"
        :key="i"
        class="col-lg-3"
      >
        <div class="placeholder-glow">
          <span class="placeholder col-6"></span>
        </div>
        <div class="placeholder-glow">
          <span class="placeholder placeholder-lg col-12"></span>
        </div>
      </div>
      <div class="col-lg-3">
        <div class="placeholder-glow">
          <span class="placeholder col-6"></span>
        </div>
        <div class="placeholder-glow">
          <span class="placeholder placeholder-lg col-6"></span>
        </div>
      </div>
    </div>
    <div class="row">
      <div
        v-for="i in 2"
        :key="i"
        class="col-lg-6"
      >
        <div class="placeholder-glow text-end">
          <span class="placeholder col-3"></span>
          <span class="placeholder col-3 ms-2"></span>
          <span class="placeholder col-3 ms-2"></span>
        </div>
        <div
          v-for="j in 5"
          :key="i + '-' + j"
          class="placeholder-glow"
        >
          <span class="placeholder col-12"></span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import RowLoading from "@/components/RowLoading.vue";
</script>
<style scoped>
.map {
  padding: 100px;
}
</style>
