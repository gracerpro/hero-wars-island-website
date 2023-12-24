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

const EVENT_RESET_TRANSLATE = "reset-translate";
const EVENT_CHANGE_TRANSLATE = "change-translate";
const EVENT_RESET_SCALE = "reset-scale";
const EVENT_CHANGE_SCALE = "change-scale";

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
      this.$emit(EVENT_CHANGE_TRANSLATE, dx, dy);
    },
    onResetScale() {
      this.$emit(EVENT_RESET_SCALE);
    },
    onChangeScale(inc) {
      this.$emit(EVENT_CHANGE_SCALE, inc);
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
