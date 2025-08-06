<script setup lang="ts">
import HelpDialog from "./IslandMapHelpDialog.vue";
import IslandMapToolbarRegions from "./IslandMapToolbarRegions.vue";
import IslandMapToolbarActions from "./IslandMapToolbarActions.vue";
import { shallowRef, useTemplateRef } from "vue";
import { EVENT_CHANGE_TRANSLATE, EVENT_CHANGE_SCALE } from "@/services/island-map";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import type { Region } from "@/api/IslandApi";
import type { ComponentExposed } from "vue-component-type-helpers";
import { EVENT_BEGIN_DOWNLOAD, EVENT_FULLSCREEN_ON, EVENT_RELOAD_MAP, EVENT_RESET, EVENT_RESET_REGION_NUMBERS, EVENT_TOGGLE_IS_SHOW_QUANTITY, EVENT_UPDATE_REGION_NUMBERS } from "./toolbar";

interface Props {
  isShowQuantity: boolean,
  loading: boolean,
  translateX: number,
  translateY: number,
  regions: Array<Region>,
  regionNumbers: Array<number>,
}

const { t } = useI18n();

defineProps<Props>();

const emit = defineEmits<{
  reset: [],
  "change-translate": [x: number | null, y: number | null],
  "change-scale": [value: number],
  "update:is-show-quantity": [],
  "fullscreen-on": [],
  "begin-download": [],
  "reload-map": [],
  "update:region-numbers": [value: Array<number>],
  "reset-region-numbers": [],
}>();

const helpDialogRef = useTemplateRef<ComponentExposed<typeof HelpDialog>>("helpDialogRef");
const helpDialogComponent = shallowRef<typeof HelpDialog | null>(null);

const isShowReloadMap = computed(() => {
  return import.meta.env.MODE === "development";
});

function onHelpClick() {
  helpDialogComponent.value = HelpDialog;
}

function onMountedHelpDialog() {
  helpDialogRef.value?.show().finally(() => {
    helpDialogComponent.value = null;
  });
}
</script>

<template>
  <div
    class="btn-toolbar"
    role="toolbar"
  >
    <island-map-toolbar-regions
      v-if="regions && regions.length > 1"
      :regions="regions"
      :region-numbers="regionNumbers"
      :loading="loading"
      @update:region-numbers="(numbers: Array<number>) => emit(EVENT_UPDATE_REGION_NUMBERS, numbers)"
      @reset-region-numbers="emit(EVENT_RESET_REGION_NUMBERS)"
    />
    <island-map-toolbar-actions
      :loading="loading"
      :translate-x="translateX"
      :translate-y="translateY"
      @change-translate="(dx: number | null, dy: number | null) => emit(EVENT_CHANGE_TRANSLATE, dx, dy)"
      @change-scale="(value: number) => emit(EVENT_CHANGE_SCALE, value)"
      @reset="emit(EVENT_RESET)"
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
        @click="emit(EVENT_TOGGLE_IS_SHOW_QUANTITY)"
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
        @click="emit(EVENT_BEGIN_DOWNLOAD)"
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
        @click="emit(EVENT_FULLSCREEN_ON)"
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
        @click="emit(EVENT_RELOAD_MAP)"
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
