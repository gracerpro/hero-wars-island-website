<script setup lang="ts">
import { useIslands } from '@/use/use-islands'
import { onMounted, watch } from 'vue'
import { createI18nRouteTo } from '@/i18n/translation'
import { fromCurrentDate } from '@/helpers/formatter'
import type { Island } from '@/api/IslandApi'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getRegionTitle } from '../island-view/island'

const { islands, isLoading, errorMessage, pagination: islandsPagination, load } = useIslands()
isLoading.value = true
islandsPagination.pageSize = 5

const now = new Date()
const route = useRoute()
const { t, locale } = useI18n()

onMounted(() => load())

watch(
  () => route.params.locale,
  () => load()
)

function isActual(island: Island) {
  return island.eventEndAt > now
}

function getIslandHint(island: Island) {
  let result = ''

  if (island.eventEndAt < now) {
    result = t('page.home.fromToDates', {
      dateFrom: fromCurrentDate(island.eventStartAt, locale.value),
      dateTo: fromCurrentDate(island.eventEndAt, locale.value),
    })
  } else {
    const toEndHours = (island.eventEndAt.getTime() - now.getTime()) / 1000 / 60 / 60

    if (toEndHours >= 24) {
      result = t('page.home.toDateDaysCount', {
        toDate: fromCurrentDate(island.eventEndAt, locale.value),
        daysCount: Math.ceil(toEndHours / 24),
      })
    } else if (toEndHours < 1) {
      const toEndMinutes = ((island.eventEndAt.getTime() - now.getTime()) / 1000 / 60) % 60
      result = t('page.home.toDateMinutesCount', {
        toDate: fromCurrentDate(island.eventEndAt, locale.value),
        minutesCount: Math.ceil(toEndMinutes),
      })
    } else {
      result = t('page.home.toDateHoursCount', {
        toDate: fromCurrentDate(island.eventEndAt, locale.value),
        hoursCount: Math.ceil(toEndHours),
      })
    }
  }

  return result
}

defineExpose({
  islands,
  errorMessage,
})
</script>

<template>
  <div>
    <div v-if="isLoading">
      <ul>
        <li>
          <div><span class="placeholder col-5"></span></div>
          <span class="placeholder col-1 ms-2"></span>
          <span class="placeholder col-1 ms-2"></span>
        </li>
        <li>
          <div><span class="placeholder col-5"></span></div>
          <span class="placeholder col-1 ms-2"></span>
          <span class="placeholder col-1 ms-2"></span>
        </li>
        <li>
          <div><span class="placeholder col-5"></span></div>
          <span class="placeholder col-1 ms-2"></span>
          <span class="placeholder col-1 ms-2"></span>
        </li>
      </ul>
    </div>
    <div
      v-else-if="errorMessage"
      class="alert alert-danger"
    >
      {{ errorMessage }}
    </div>
    <div
      v-else-if="!islands.length"
      class="alert alert-warning"
    >
      {{ t('page.home.notFound') }}
    </div>
    <ul v-else>
      <li
        v-for="island in islands"
        :key="island.id"
      >
        <router-link
          :to="createI18nRouteTo({ name: 'island', params: { id: island.id } })"
          :class="[isActual(island) ? '' : 'text-secondary']"
          >{{ island.name + ' ' + getIslandHint(island) }}</router-link
        >
        <span
          v-if="isActual(island)"
          class="badge text-bg-primary ms-2"
          >{{ t('page.home.actual') }}</span
        >
        <br />
        <span
          v-for="region in island.regions"
          :key="region.number"
          :class="['badge me-2', region.isVisible ? 'text-bg-secondary' : 'bg-secondary-subtle']"
          :title="getRegionTitle(region)"
          >{{ region.number }}</span
        >
      </li>
    </ul>
  </div>
</template>
