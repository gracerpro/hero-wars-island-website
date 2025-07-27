<script setup lang="ts">
import RowLoading from "@/components/RowLoading.vue";
</script>

<template>
  <div>
    <div class="map-svg d-flex justify-content-center align-items-center">
      <row-loading />
    </div>
    <div class="placeholder-glow my-4">
      <span class="placeholder placeholder-lg col-12"></span>
    </div>
    <div class="row">
      <div class="col-lg-6">
        <h3>Ресурсы на карте</h3>
        <div class="placeholder-glow">
          <span class="placeholder placeholder-lg col-4"></span>
        </div>
      </div>
      <div class="col-lg-6">
        <h3>Выбранные ресурсы</h3>
        <div class="placeholder-glow">
          <span class="placeholder placeholder-lg col-4"></span>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-6">
        <h3>Сгруппированные данные</h3>
        <div class="placeholder-glow">
          <span class="placeholder placeholder-lg col-4"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-svg {
  height: 600px;
  outline: 1px solid #dddddd;
}
</style>
