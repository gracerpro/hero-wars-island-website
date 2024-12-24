<template>
  <div
    class="btn-toolbar -left-toolbar"
    role="toolbar"
  >
    <div
      class="btn-group-vertical w-100"
      role="group"
    >
      <button
        type="button"
        class="btn btn-secondary"
        :disabled="loading"
        :title="t('common.zoomOut')"
        @click="onChangeScale(1, $event)"
      >
        -
      </button>
      <button
        type="button"
        class="btn btn-secondary"
        :disabled="loading"
        :title="t('common.zoomIn')"
        @click="onChangeScale(-1, $event)"
      >
        +
      </button>
      <button
        type="button"
        class="btn btn-secondary"
        :disabled="loading"
        @click="onChangeTranslate(-1, 0, $event)"
      >
        &larr;
      </button>
      <button
        type="button"
        class="btn btn-secondary"
        :disabled="loading"
        @click="onChangeTranslate(1, 0, $event)"
      >
        &rarr;
      </button>
      <button
        type="button"
        class="btn btn-secondary"
        :disabled="loading"
        @click="onChangeTranslate(0, -1, $event)"
      >
        &uarr;
      </button>
      <button
        type="button"
        class="btn btn-secondary"
        :disabled="loading"
        @click="onChangeTranslate(0, 1, $event)"
      >
        &darr;
      </button>
      <button
        type="button"
        class="btn btn-secondary"
        :title="t('common.reset')"
        :disabled="loading"
        @click="emit(EVENT_RESET)"
      >
        0
      </button>
    </div>
    <div
      class="btn-group-vertical w-100 mt-2"
      role="group"
    >
      <button
        type="button"
        :disabled="loading"
        :title="t('page.island.isShowQuantity')"
        :class="['btn', isShowQuantity ? 'btn-secondary' : 'btn-outline-secondary']"
        @click="onChangeIsShowQuantity"
      >
        N
      </button>
    </div>
    <div
      class="btn-group-vertical w-100 mt-2"
      role="group"
    >
      <button
        type="button"
        class="btn btn-secondary download-btn"
        :disabled="loading"
        :title="t('common.download')"
        @click="emit(EVENT_BEGIN_DOWNLOAD)"
      >
        <span class="hero-icon hero-download align-middle" />
      </button>
    </div>
    <div
      class="btn-group-vertical w-100 mt-2"
      role="group"
    >
      <button
        type="button"
        class="btn btn-secondary fullscreen-btn"
        :disabled="loading"
        :title="t('common.fullscreenMode')"
        @click="emit(EVENT_FULLSCREEN_ON)"
      >
        <span class="fullscreen-icon"></span>
      </button>
    </div>
    <div
      class="btn-group-vertical w-100 mt-2"
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
      class="btn-group-vertical w-100 mt-2"
      role="group"
    >
      <button
        type="button"
        class="btn btn-secondary"
        title="Reload"
        :disabled="loading"
        @click="emit(EVENT_RELOAD_MAP)"
      >
        L
      </button>
    </div>

    <component
      :is="helpDialogComponent"
      ref="helpDialog"
      @vue:mounted="onMountedHelpDialog"
    />
  </div>
</template>
<script>
const EVENT_RESET = "reset";
const EVENT_CHANGE_IS_SHOW_QUANTITY = "update:is-show-quantity";
const EVENT_FULLSCREEN_ON = "fullscreen-on";
const EVENT_BEGIN_DOWNLOAD = "begin-download";
const EVENT_RELOAD_MAP = "reload-map";
</script>
<script setup>
import HelpDialog from "./IslandMapHelpDialog.vue";
import { ref, shallowRef } from "vue";
import {
  TRANSLATE_X,
  TRANSLATE_Y,
  EVENT_CHANGE_TRANSLATE,
  DELTA_SCALE,
  EVENT_CHANGE_SCALE,
} from "@/services/island-map";
import { useI18n } from "vue-i18n";
import { computed } from "vue";

const { t } = useI18n();

defineProps({
  isShowQuantity: { type: Boolean, required: true },
  loading: { type: Boolean, required: true },
});

const emit = defineEmits([
  EVENT_RESET,
  EVENT_CHANGE_TRANSLATE,
  EVENT_CHANGE_SCALE,
  EVENT_CHANGE_IS_SHOW_QUANTITY,
  EVENT_FULLSCREEN_ON,
  EVENT_BEGIN_DOWNLOAD,
  EVENT_RELOAD_MAP,
]);

const helpDialog = ref(null);
const helpDialogComponent = shallowRef(null);

const isShowReloadMap = computed(() => {
  console.log("dev", import.meta.env.DEV);
  console.log("mode", import.meta.env.MODE);

  return import.meta.env.DEV;
});

function onChangeTranslate(dx, dy, event) {
  let x = 0,
    y = 0;

  if (dx !== 0) {
    x = 5 * dx * TRANSLATE_X;
    if (event.ctrlKey) {
      x /= 10;
    } else if (event.shiftKey) {
      x /= 2;
    }
  }
  if (dy !== 0) {
    y = 5 * dy * TRANSLATE_Y;
    if (event.ctrlKey) {
      y /= 10;
    } else if (event.shiftKey) {
      y /= 2;
    }
  }

  emit(EVENT_CHANGE_TRANSLATE, x, y);
}

function onChangeScale(zoom, event) {
  let value = zoom * DELTA_SCALE;

  if (event.ctrlKey) {
    value /= 10;
  } else if (event.shiftKey) {
    value /= 2;
  }

  emit(EVENT_CHANGE_SCALE, value);
}

function onHelpClick() {
  helpDialogComponent.value = HelpDialog;
}

function onChangeIsShowQuantity() {
  emit(EVENT_CHANGE_IS_SHOW_QUANTITY);
}

function onMountedHelpDialog() {
  helpDialog.value.show().finally(() => {
    helpDialogComponent.value = null;
  });
}
</script>
<style scoped>
.-left-toolbar {
  width: 40px;
  float: left;
}
</style>
<style>
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
