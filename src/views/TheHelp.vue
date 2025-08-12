<script setup lang="ts">
import { getCurrentLocale, isShowLocaleInRoute } from '@/i18n/translation'
import { setMetaInfo } from '@/services/page-meta'
import { computed } from 'vue'
import { useSSRContext } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const ssrContext = import.meta.env.SSR ? useSSRContext() : undefined

const currentLocale = computed(() => {
  const locale = getCurrentLocale()

  return isShowLocaleInRoute(locale) ? locale : ''
})

setMetaInfo(
  {
    title: t('seo.help.title') + ' - ' + t('common.projectName'),
    description: t('seo.help.description'),
    keywords: t('seo.help.keywords'),
  },
  ssrContext
)
</script>

<template>
  <div class="container text-container">
    <h1>{{ t('page.help.helpToProject') }}</h1>

    <p>{{ t('page.help.paragraph1') }}</p>
    <ul>
      <li>
        {{ t('page.help.help1') }}<br />
        <ul>
          <li>
            <a
              href="https://github.com/gracerpro/hero-wars-island-website"
              target="_blank"
            >
              https://github.com/gracerpro/hero-wars-island-website</a
            ><br />
          </li>
          <li>
            <a :href="'/backend-api/index.html' + (currentLocale ? `?locale=${currentLocale}` : '')"
              >API</a
            >
          </li>
        </ul>
      </li>
      <li>{{ t('page.help.help2') }}</li>
      <li>{{ t('page.help.help3') }}</li>
      <li>{{ t('page.help.help4') }}</li>
      <li>{{ t('page.help.help5') }}</li>
    </ul>
  </div>
</template>
