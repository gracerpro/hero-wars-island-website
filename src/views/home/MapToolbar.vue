<template>
  <div class="btn-toolbar -left-toolbar" role="toolbar">
    <div class="btn-group-vertical w-100 mb-2" role="group">
      <button
        type="button"
        class="btn btn-secondary"
        title="Уменьшить"
        @click="onChangeScale(true)"
      >
        +
      </button>
      <button
        type="button"
        class="btn btn-secondary"
        title="Увеличить"
        @click="onChangeScale(false)"
      >
        -
      </button>
      <button
        type="button"
        class="btn btn-secondary"
        title="Сбросить"
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
        title="Сбросить"
        @click="onResetTranslate()"
      >
        0
      </button>
    </div>
    <div class="btn-group-vertical w-100" role="group">
      <button type="button" class="btn btn-secondary" @click="onHelpClick">
        ?
      </button>
    </div>

    <component
      :is="helpDialogComponent"
      ref="helpDialog"
      @mounted="onMountedHelpDialog"
    />
  </div>
</template>
<script>
import HelpDialog from "./HelpDialog.vue";
import { shallowRef } from "vue";
import {
  TRANSLATE_X,
  TRANSLATE_Y,
  EVENT_CHANGE_TRANSLATE,
  DELTA_SCALE,
  EVENT_CHANGE_SCALE,
} from "./map";

const EVENT_RESET_TRANSLATE = "reset-translate";
const EVENT_RESET_SCALE = "reset-scale";

export default {
  name: "MapToolbar",
  emits: [
    EVENT_RESET_TRANSLATE,
    EVENT_CHANGE_TRANSLATE,
    EVENT_RESET_SCALE,
    EVENT_CHANGE_SCALE,
  ],
  data: function () {
    return {
      helpDialogComponent: null,
    };
  },
  methods: {
    onResetTranslate() {
      this.$emit(EVENT_RESET_TRANSLATE);
    },
    onChangeTranslate(dx, dy) {
      let x = 0,
        y = 0;

      if (dx !== 0) {
        x = 5 * dx * TRANSLATE_X;
      }
      if (dy !== 0) {
        y = 5 * dy * TRANSLATE_Y;
      }

      this.$emit(EVENT_CHANGE_TRANSLATE, x, y);
    },
    onResetScale() {
      this.$emit(EVENT_RESET_SCALE);
    },
    onChangeScale(inc) {
      this.$emit(EVENT_CHANGE_SCALE, 2 * (inc ? DELTA_SCALE : -DELTA_SCALE));
    },
    onHelpClick() {
      this.helpDialogComponent = shallowRef(HelpDialog);
    },
    onMountedHelpDialog() {
      this.$refs.helpDialog.show().finally(() => {
        this.helpDialogComponent = null;
      });
    },
  },
};
</script>
