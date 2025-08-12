<script setup lang="ts">
import { setTheme, THEME_DARK, THEME_LIGHT } from '@/core/theme'
import { useMainStore } from '@/store/main'
import { computed } from 'vue'

const store = useMainStore()

const theme = computed(() => store.theme)

const isDark = computed({
  get: () => theme.value === THEME_DARK,
  set: (newValue) => store.updateTheme(newValue ? THEME_DARK : THEME_LIGHT),
})

function onChange() {
  setTheme(isDark.value ? THEME_DARK : THEME_LIGHT)
}
</script>
<template>
  <div class="form-check form-switch">
    <input
      v-model="isDark"
      class="form-check-input"
      type="checkbox"
      @change="onChange"
    />
  </div>
</template>
