<script setup lang="ts">
import HelpDialog from './IslandMapHelpDialog.vue'
import IslandMapToolbarRegions from './IslandMapToolbarRegions.vue'
import IslandMapToolbarActions from './IslandMapToolbarActions.vue'
import { shallowRef, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import type { Region } from '@/api/IslandApi'
import type { ComponentExposed } from 'vue-component-type-helpers'

interface Props {
  loading: boolean
  translateX: number
  translateY: number
  regions: Array<Region>
}

const { t } = useI18n()

defineProps<Props>()

const emit = defineEmits<{
  reset: []
  'change-translate': [x: number | null, y: number | null]
  'change-scale': [value: number]
  'fullscreen-on': []
  'begin-download': []
  'reload-map': []
}>()

const isShowQuantity = defineModel<boolean>('isShowQuantity', { required: true })
const regionNumbers = defineModel<Array<number>>('regionNumbers', { required: true })

const helpDialogRef = useTemplateRef<ComponentExposed<typeof HelpDialog>>('helpDialogRef')
const helpDialogComponent = shallowRef<typeof HelpDialog | null>(null)

const isShowReloadMap = computed(() => {
  return import.meta.env.MODE === 'development'
})

function onHelpClick() {
  helpDialogComponent.value = HelpDialog
}

function onMountedHelpDialog() {
  helpDialogRef.value?.show().finally(() => {
    helpDialogComponent.value = null
  })
}
</script>

<template>
  <div
    class="btn-toolbar"
    role="toolbar"
  >
    <island-map-toolbar-regions
      v-if="regions && regions.length > 1"
      v-model:region-numbers="regionNumbers"
      :regions="regions"
      :loading="loading"
    />
    <island-map-toolbar-actions
      :loading="loading"
      :translate-x="translateX"
      :translate-y="translateY"
      @change-translate="(dx: number | null, dy: number | null) => emit('change-translate', dx, dy)"
      @change-scale="(value: number) => emit('change-scale', value)"
      @reset="emit('reset')"
    />

    <div
      class="btn-group mb-3 me-3"
      role="group"
    >
      <button
        type="button"
        :disabled="loading"
        :title="t('page.island.isShowQuantity')"
        :class="['btn toolbar-button', isShowQuantity ? 'btn-secondary' : 'btn-outline-secondary']"
        @click="isShowQuantity = !isShowQuantity"
      >
        N
      </button>
    </div>
    <div
      class="btn-group mb-3 me-3"
      role="group"
    >
      <button
        type="button"
        class="btn btn-secondary toolbar-button download-btn"
        :disabled="loading"
        :title="t('common.download')"
        @click="emit('begin-download')"
      >
        <span class="hero-icon hero-download align-middle" />
      </button>
    </div>
    <div
      class="btn-group mb-3 me-3"
      role="group"
    >
      <button
        type="button"
        class="btn btn-secondary toolbar-button fullscreen-btn"
        :disabled="loading"
        :title="t('common.fullscreenMode')"
        @click="emit('fullscreen-on')"
      >
        <span class="fullscreen-icon"></span>
      </button>
    </div>
    <div
      class="btn-group mb-3 toolbar-button me-3"
      role="group"
    >
      <button
        type="button"
        class="btn btn-secondary"
        :title="t('common.help')"
        @click="onHelpClick"
      >
        ?
      </button>
    </div>
    <div
      v-if="isShowReloadMap"
      class="btn-group mb-3 toolbar-button"
      role="group"
    >
      <button
        type="button"
        class="btn btn-secondary"
        title="Reload"
        :disabled="loading"
        @click="emit('reload-map')"
      >
        L
      </button>
    </div>

    <component
      :is="helpDialogComponent"
      ref="helpDialogRef"
      @vue:mounted="onMountedHelpDialog"
    />
  </div>
</template>

<style scoped>
.-left-toolbar {
  width: 40px;
  float: left;
}
.download-btn {
  padding: 4px;
}
.fullscreen-btn {
  padding: 5px;
  line-height: 10px;
}
.fullscreen-icon {
  border: 3px solid #fff;
  display: inline-block;
  width: 100%;
  height: 20px;
}
</style>
<style>
.toolbar-button {
  min-width: 3em;
}
</style>
