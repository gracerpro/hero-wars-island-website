<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { filterNameMinCharsCount } from './news'

interface Props {
  loading: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  find: []
}>()

const name = defineModel<string>('name', { required: true })

const { t } = useI18n()

function onClearName() {
  name.value = ''
  emit('find')
}
</script>

<template>
  <form
    class="row mb-2"
    @submit.prevent="emit('find')"
  >
    <div class="col-md-6 mb-3">
      <div class="input-group">
        <input
          id="filter__name"
          v-model.trim="name"
          class="form-control"
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
      <div class="form-text">
        {{ t('common.needEnterAtLeastCharacters', { n: filterNameMinCharsCount }) }}
      </div>
    </div>
    <div class="col-md-2 mb-3">
      <button
        type="submit"
        :disabled="loading"
        class="btn btn-primary"
      >
        {{ t('common.find') }}
      </button>
    </div>
  </form>
</template>
