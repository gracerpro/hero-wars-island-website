<template>
  <div class="btn-toolbar -left-toolbar" role="toolbar">
    <div class="btn-group-vertical w-100 mb-2" role="group">
      <button
        type="button"
        class="btn btn-secondary"
        :title="t('common.zoomOut')"
        @click="onChangeScale(true)"
      >
        -
      </button>
      <button
        type="button"
        class="btn btn-secondary"
        :title="t('common.zoomIn')"
        @click="onChangeScale(false)"
      >
        +
      </button>
      <button
        type="button"
        class="btn btn-secondary"
        :title="t('common.reset')"
        @click="onResetScale()"
      >
        0
      </button>
    </div>
    <div class="btn-group-vertical w-100 mb-2" role="group">
      <button
        type="button"
        class="btn btn-secondary"
        @click="onChangeTranslate(-1, 0)"
      >
        &larr;
      </button>
      <button
        type="button"
        class="btn btn-secondary"
        @click="onChangeTranslate(1, 0)"
      >
        &rarr;
      </button>
      <button
        type="button"
        class="btn btn-secondary"
        @click="onChangeTranslate(0, -1)"
      >
        &uarr;
      </button>
      <button
        type="button"
        class="btn btn-secondary"
        @click="onChangeTranslate(0, 1)"
      >
        &darr;
      </button>
      <button
        type="button"
        class="btn btn-secondary"
        :title="t('common.reset')"
        @click="onResetTranslate()"
      >
        0
      </button>
    </div>
    <div class="btn-group-vertical w-100 mb-2" role="group">
      <button
        type="button"
        :title="t('page.island.showOnlyIconWithoutQuantity')"
        :class="[
          'btn',
          isOnlyImage ? 'btn-secondary' : 'btn-outline-secondary',
        ]"
        @click="onChangeOnlyImage"
      >
        Im
      </button>
      <button
        type="button"
        :title="t('page.island.showEditNodes')"
        :class="[
          'btn',
          isShowNoModerate ? 'btn-secondary' : 'btn-outline-secondary',
        ]"
        @click="onChangeIsShowNoModerate"
      >
        ?
      </button>
    </div>
    <div class="btn-group-vertical w-100" role="group">
      <button
        type="button"
        class="btn btn-secondary"
        @click="onHelpClick"
        :title="t('common.help')"
      >
        h
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
const EVENT_RESET_TRANSLATE = "reset-translate";
const EVENT_RESET_SCALE = "reset-scale";
const EVENT_CHANGE_ONLY_IMAGE = "update:is-only-image";
const EVENT_CHANGE_IS_SHOW_NO_MODERATE = "update:is-show-no-moderate";
</script>
<script setup>
import HelpDialog from "./HelpDialog.vue";
import { ref } from "vue";
import {
  TRANSLATE_X,
  TRANSLATE_Y,
  EVENT_CHANGE_TRANSLATE,
  DELTA_SCALE,
  EVENT_CHANGE_SCALE,
} from "@/services/island-map";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps({
  isOnlyImage: { type: Boolean, required: true },
  isShowNoModerate: { type: Boolean, required: true },
});

const emit = defineEmits([
  EVENT_RESET_TRANSLATE,
  EVENT_CHANGE_TRANSLATE,
  EVENT_RESET_SCALE,
  EVENT_CHANGE_SCALE,
  EVENT_CHANGE_ONLY_IMAGE,
  EVENT_CHANGE_IS_SHOW_NO_MODERATE,
]);

const helpDialog = ref(null);
const helpDialogComponent = ref(null);

const onResetTranslate = () => {
  emit(EVENT_RESET_TRANSLATE);
};
const onChangeTranslate = (dx, dy) => {
  let x = 0,
    y = 0;

  if (dx !== 0) {
    x = 5 * dx * TRANSLATE_X;
  }
  if (dy !== 0) {
    y = 5 * dy * TRANSLATE_Y;
  }

  emit(EVENT_CHANGE_TRANSLATE, x, y);
};
const onResetScale = () => {
  emit(EVENT_RESET_SCALE);
};
const onChangeScale = (inc) => {
  emit(EVENT_CHANGE_SCALE, 2 * (inc ? DELTA_SCALE : -DELTA_SCALE));
};
const onHelpClick = () => {
  helpDialogComponent.value = HelpDialog;
};
const onChangeOnlyImage = () => {
  emit(EVENT_CHANGE_ONLY_IMAGE);
};
const onChangeIsShowNoModerate = () => {
  emit(EVENT_CHANGE_IS_SHOW_NO_MODERATE);
};
const onMountedHelpDialog = () => {
  helpDialog.value.show().finally(() => {
    helpDialogComponent.value = null;
  });
};
</script>
