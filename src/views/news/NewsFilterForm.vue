<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { EVENT_FIND, EVENT_UPDATE_NAME, filterNameMinCharsCount } from "./news";

interface Props {
  loading: boolean,
  name: string,
}

defineProps<Props>()

const emit = defineEmits<{
  find: [],
  "update:name": [value: string],
}>();

const { t } = useI18n();

function onClearName() {
  emit(EVENT_UPDATE_NAME, "");
  emit(EVENT_FIND);
}
</script>

<template>
  <form
    class="row mb-2"
    @submit.prevent="emit(EVENT_FIND)"
  >
    <div class="col-md-6 mb-3">
      <div class="input-group">
        <input
          id="filter__name"
          :value="name"
          class="form-control"
          :placeholder="t('common.name')"
          @input="emit(EVENT_UPDATE_NAME, ($event.target as HTMLInputElement).value.trim())"
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
        {{ t("common.needEnterAtLeastCharacters", { n: filterNameMinCharsCount }) }}
      </div>
    </div>
    <div class="col-md-2 mb-3">
      <button
        type="submit"
        :disabled="loading"
        class="btn btn-primary"
      >
        {{ t("common.find") }}
      </button>
    </div>
  </form>
</template>
