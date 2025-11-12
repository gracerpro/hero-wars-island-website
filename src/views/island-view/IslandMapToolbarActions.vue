<script setup lang="ts">
/* global MouseEvent */

import { getDeltaScale, TRANSLATE_X, TRANSLATE_Y } from '@/services/island-map'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  loading: boolean
  translateX: number
  translateY: number
  scale: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  reset: []
  'change-scale': [delta: number]
  'change-translate': [x: number | null, y: number | null]
}>()

const { t } = useI18n()

const actionHint = computed(() => '\n' + t('page.island.toolbarActionCtrlHint'))

function onChangeScale(zoom: number, event: MouseEvent) {
  let value = zoom * getDeltaScale(props.scale)

  if (event.ctrlKey) {
    value /= 10
  } else if (event.shiftKey) {
    value /= 2
  }

  emit('change-scale', value)
}

function onChangeTranslate(xDirection: number, yDirection: number, event: MouseEvent) {
  let dx = 0,
    dy = 0

  if (xDirection !== 0) {
    dx = 5 * xDirection * TRANSLATE_X
    if (event.ctrlKey) {
      dx /= 10
    } else if (event.shiftKey) {
      dx /= 2
    }
  }
  if (yDirection !== 0) {
    dy = 5 * yDirection * TRANSLATE_Y
    if (event.ctrlKey) {
      dy /= 10
    } else if (event.shiftKey) {
      dy /= 2
    }
  }

  emit('change-translate', props.translateX + dx, props.translateY + dy)
}
</script>

<template>
  <div
    class="btn-group mb-3 me-3"
    role="group"
  >
    <button
      type="button"
      class="btn btn-secondary toolbar-button"
      :disabled="loading"
      :title="t('common.zoomOut') + actionHint"
      @click="onChangeScale(-1, $event)"
    >
      -
    </button>
    <button
      type="button"
      class="btn btn-secondary toolbar-button"
      :disabled="loading"
      :title="t('common.zoomIn') + actionHint"
      @click="onChangeScale(1, $event)"
    >
      +
    </button>
    <button
      type="button"
      class="btn btn-secondary toolbar-button"
      :title="t('page.island.translateLeft') + actionHint"
      :disabled="loading"
      @click="onChangeTranslate(-1, 0, $event)"
    >
      &larr;
    </button>
    <button
      type="button"
      class="btn btn-secondary toolbar-button"
      :title="t('page.island.translateRight') + actionHint"
      :disabled="loading"
      @click="onChangeTranslate(1, 0, $event)"
    >
      &rarr;
    </button>
    <button
      type="button"
      class="btn btn-secondary toolbar-button"
      :title="t('page.island.translateUp') + actionHint"
      :disabled="loading"
      @click="onChangeTranslate(0, -1, $event)"
    >
      &uarr;
    </button>
    <button
      type="button"
      class="btn btn-secondary toolbar-button"
      :title="t('page.island.translateDown') + actionHint"
      :disabled="loading"
      @click="onChangeTranslate(0, 1, $event)"
    >
      &darr;
    </button>
    <button
      type="button"
      class="btn btn-secondary toolbar-button"
      :title="t('common.reset')"
      :disabled="loading"
      @click="emit('reset')"
    >
      0
    </button>
  </div>
</template>
