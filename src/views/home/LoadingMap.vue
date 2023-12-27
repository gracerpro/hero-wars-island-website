<template>
  <div>
    <div class="text-center map">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-6">
        <div class="placeholder-glow">
          <span class="placeholder col-6"></span>
        </div>
        <div v-for="i in 10" :key="i" class="placeholder-glow">
          <span class="placeholder col-12"></span>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="placeholder-glow">
          <span class="placeholder col-6"></span>
        </div>
        <div v-for="i in 5" :key="i" class="placeholder-glow">
          <span class="placeholder col-12"></span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "LoadingMap",
};
</script>
<style scoped>
.map {
  padding: 100px;
}
</style>
