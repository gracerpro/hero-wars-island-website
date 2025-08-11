<script setup lang="ts">
interface Props {
  inputId: string
}

defineProps<Props>()

const [modelValue, modifiers] = defineModel<string>({
  default: '',
  set(value: string) {
    if (modifiers.trim) {
      value = value.trim()
    }

    return value
  }
})
</script>

<template>
  <div class="input-group">
    <input
      :id="inputId"
      v-model="modelValue"
      type="text"
      class="form-control"
    />
    <span class="input-group-text">
      <button
        type="button"
        class="btn-close"
        aria-label="Close"
        :disabled="modelValue === ''"
        @click="modelValue = ''"
      ></button>
    </span>
  </div>
</template>
