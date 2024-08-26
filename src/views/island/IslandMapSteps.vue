<template>
  <div>
    <div class="float-end">
      <router-link :to="createI18nRouteTo({ name: 'contact' })">{{
        t("common.haveErrosOrProposal")
      }}</router-link
      ><br />
      <label class="mt-2">
        <input
          type="checkbox"
          :checked="isSelectAnyNode"
          @change="onChangeIsSelectAnyNode"
        />
        {{ t("common.selectAnyNodeQuestion") }}
      </label>
    </div>
    <div>
      {{ t("page.island.myExplorersMoves") }}
    </div>
    <div class="mt-2">
      <span class="fs-4 me-2 align-middle">
        <b>{{ userNodesCount }}</b> / {{ totalNodesCount }}
      </span>
      <button
        type="button"
        :class="['btn btn-secondary align-middle', userNodesCount > 0 ? '' : 'disabled']"
        @click="emit(EVENT_RESET_USER_NODES)"
      >
        {{ t("common.reset") }}
      </button>
    </div>
    <div class="mt-2">
      <label
        v-for="mode in selectModes"
        :key="mode.value"
        class="me-2"
      >
        <input
          type="radio"
          :value="mode.value"
          :checked="selectMode === mode.value"
          @change="onChangeSelectMode"
        />
        {{ mode.label }}
      </label>
    </div>
    <div class="fst-italic text-secondary small">{{ selectModeHint }}</div>
  </div>
</template>
<script setup>
import { createI18nRouteTo } from "@/i18n/translation";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { SELECT_MODE_GOING, SELECT_MODE_PLAN } from "./select-mode";

const EVENT_UPDATE_IS_SELECT_ANY_NODE = "update:is-select-any-node"
const EVENT_RESET_USER_NODES = "reset-user-nodes"
const EVENT_UPDATE_SELECT_MODE = "update:select-mode"

const { t } = useI18n();

const props = defineProps({
  selectMode: { type: String, required: true },
  isSelectAnyNode: { type: Boolean, required: true },
  userNodesCount: { type: Number, required: true },
  totalNodesCount: { type: Number, required: true },
})

const emit = defineEmits([
  EVENT_UPDATE_IS_SELECT_ANY_NODE,
  EVENT_RESET_USER_NODES,
  EVENT_UPDATE_SELECT_MODE,
])

const selectModes = computed(() => {
  return [
    { value: SELECT_MODE_PLAN, label: t("page.island.planning") },
    { value: SELECT_MODE_GOING, label: t("page.island.going") },
  ];
});
const selectModeHint = computed(() => {
  return props.selectMode === SELECT_MODE_PLAN
    ? t("page.island.canSelectAnyNode")
    : t("page.island.canSelectOnlyPlannedNode");
});

function onChangeIsSelectAnyNode(event) {
  emit(EVENT_UPDATE_IS_SELECT_ANY_NODE, event.target.checked)
}

function onChangeSelectMode(event) {
  emit(EVENT_UPDATE_SELECT_MODE, event.target.value)
}
</script>