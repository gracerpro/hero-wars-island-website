<script setup>
import { setTheme, THEME_DARK, THEME_LIGHT } from "@/core/theme";
import { UPDATE_THEME_MUTATION } from "@/store/mutation-types";
import { computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const theme = computed(() => store.state.theme);

const isDark = computed({
  get: () => theme.value === THEME_DARK,
  set: (newValue) => store.commit(UPDATE_THEME_MUTATION, newValue ? THEME_DARK : THEME_LIGHT),
});

function onChange() {
  setTheme(isDark.value ? THEME_DARK : THEME_LIGHT);
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
