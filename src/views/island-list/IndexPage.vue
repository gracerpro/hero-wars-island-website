<script setup lang="ts">
import { useIslands } from '@/use/use-islands'
import RowLoading from '@/components/RowLoading.vue'
import { useI18n } from 'vue-i18n'
import { createI18nRouteTo } from '@/i18n/translation'
import { formatDate } from '@/helpers/formatter'
import { getRegionTitle } from '../island/island'
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const { t } = useI18n()
const route = useRoute()

const { islands, isLoading, errorMessage, load, loadAppend, pagination, totalCount, visibleCount } =
  useIslands()
isLoading.value = true
pagination.pageSize = 10

watch(
  () => route.params.locale,
  () => load()
)

load()
</script>

<template>
  <div class="container app-container">
    <h1>{{ t('common.islandsHistory') }}</h1>

    <div
      v-for="island in islands"
      :key="island.id"
      class="item"
    >
      <router-link :to="createI18nRouteTo({ name: 'island', params: { id: island.id } })">{{
        island.name
      }}</router-link>
      <div>От {{ formatDate(island.eventStartAt) }} до {{ formatDate(island.eventEndAt) }}</div>
      <div>
        <span
          v-for="region in island.regions"
          :key="region.number"
          :class="['badge me-2', region.isVisible ? 'text-bg-secondary' : 'bg-secondary-subtle']"
          :title="getRegionTitle(region)"
          >{{ region.number }}</span
        >
      </div>
    </div>

    <row-loading v-if="isLoading" />
    <div
      v-else-if="errorMessage"
      class="alert alert-danger"
    >
      {{ errorMessage }}
    </div>
    <div
      v-else-if="!totalCount"
      class="alert alert-info"
    >
      {{ t('common.noData') }}
    </div>
    <div
      v-else-if="visibleCount < totalCount"
      class="text-center"
    >
      <button
        type="button"
        class="btn btn-link"
        :disabled="isLoading"
        @click="loadAppend()"
      >
        {{ t('common.showMore') }}
      </button>
    </div>
  </div>
</template>

<style lang="css">
.item {
  margin-bottom: 10px;
}
.item:last-child {
  margin-bottom: 0;
}
</style>
