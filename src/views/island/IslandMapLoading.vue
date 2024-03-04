<template>
  <div>
    <div class="text-center map">
      <div
        class="spinner-border"
        role="status"
      >
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div class="row mb-4">
      <div
        class="col-lg-3"
        v-for="i in 2"
        :key="i"
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
        class="col-lg-6"
        v-for="i in 2"
        :key="i"
      >
        <div class="placeholder-glow text-end">
          <span class="placeholder col-3"></span>
          <span class="placeholder col-3 ms-2"></span>
          <span class="placeholder col-3 ms-2"></span>
        </div>
        <div
          v-for="i in 5"
          :key="i"
          class="placeholder-glow"
        >
          <span class="placeholder col-12"></span>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.map {
  padding: 100px;
}
</style>
