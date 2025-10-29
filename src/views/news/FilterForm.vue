<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import { useNews } from '@/use/use-news'

interface Props {
  loading: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  find: []
}>()

const { filterNameMinCharsCount } = useNews()

const name = defineModel<string>('name', {
  required: true,
  set: (value: string) => {
    form.value.name.isValid = value.length === 0 || value.length >= filterNameMinCharsCount
    form.value.name.message = form.value.name.isValid
      ? ''
      : t('common.needEnterAtLeastCharacters', { n: filterNameMinCharsCount })

    return value
  },
})

const { t } = useI18n()

const form = ref({
  name: {
    isValid: true,
    message: '',
  },
})

const isValid = computed(() => {
  return form.value.name.isValid
})

function onClearName() {
  name.value = ''
  onSubmit()
}

function onSubmit() {
  if (isValid.value) {
    emit('find')
  }
}
</script>

<template>
  <form
    class="row mb-2 needs-validation"
    @submit.prevent="onSubmit"
  >
    <div class="col-md-6 mb-3">
      <div class="input-group">
        <input
          id="filter__name"
          v-model.trim="name"
          class="form-control"
          :class="{ 'is-invalid': !form.name.isValid }"
          :placeholder="t('common.name')"
        />
        <button
          type="button"
          :disabled="name.length === 0"
          class="btn btn-outline-secondary"
          @click="onClearName"
        >
          X
        </button>
      </div>
      <div
        class="form-text"
        :class="{ 'is-invalid': !form.name.isValid }"
      >
        {{ t('common.needEnterAtLeastCharacters', { n: filterNameMinCharsCount }) }}
      </div>
    </div>
    <div class="col-md-2 mb-3">
      <button
        type="submit"
        :disabled="loading || !isValid"
        class="btn btn-primary"
      >
        {{ t('common.find') }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.is-invalid {
  color: var(--bs-form-invalid-color);
}
</style>
