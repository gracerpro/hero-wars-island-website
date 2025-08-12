<script setup lang="ts">
import { setLanguage, getLocalesLabels, getCurrentLocale } from '@/i18n/translation'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { isShowLocaleInRoute } from '@/i18n/translation'
import { resetCache } from '@/services/api/island-node'

const router = useRouter()

const currentLocale = computed(() => getCurrentLocale())
const languages = computed(() => getLocalesLabels())

const onChangeLanguage = async (locale: string) => {
  if (currentLocale.value === locale) {
    return
  }

  await setLanguage(locale)

  resetCache()

  let routeLocale = locale
  if (!isShowLocaleInRoute(locale)) {
    routeLocale = ''
  }
  await router.replace({ params: { locale: routeLocale } })
}
</script>

<template>
  <form role="language">
    <button
      v-for="(language, index) in languages"
      :key="language.locale"
      :title="language.label"
      :class="[
        'btn',
        index > 0 ? 'ms-3' : '',
        language.locale === currentLocale ? 'btn-primary fw-bold' : 'btn-outline-primary',
      ]"
      type="button"
      @click="onChangeLanguage(language.locale)"
    >
      {{ language.locale }}
    </button>
  </form>
</template>
