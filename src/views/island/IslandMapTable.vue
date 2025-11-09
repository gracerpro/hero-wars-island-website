<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { type ViewReward } from './map'
import { computed, ref } from 'vue'

interface Props {
  header: string
  rewards: ViewReward[]
  visibleRewardsCount: number
}

const props = defineProps<Props>()

const isShowBlock = defineModel<boolean>('isShowBlock', { required: true })

const { t } = useI18n()

type Sort = 'asc' | 'desc' | null

const nameSort = ref<Sort>('asc')

const getItemName = (item: ViewReward) => {
  return item.item.name.length > 0 ? item.item.name : t('common.noName')
}
const nameSortLabel = computed(() => {
  if (nameSort.value === null) {
    return '&varr;'
  }

  return nameSort.value === 'asc' ? '&darr;' : '&uarr;'
})

const sortRewards = computed<ViewReward[]>(() => {
  if (nameSort.value === null) {
    return props.rewards
  }

  const result = [...props.rewards]

  if (nameSort.value === 'asc') {
    result.sort((a, b) => {
      return a.item.name.localeCompare(b.item.name)
    })
  } else {
    result.sort((a, b) => {
      return -1 * a.item.name.localeCompare(b.item.name)
    })
  }

  return result
})

function toggleSort() {
  if (nameSort.value === null) {
    nameSort.value = 'asc'
  } else if (nameSort.value === 'asc') {
    nameSort.value = 'desc'
  } else {
    nameSort.value = null
  }
}
</script>

<template>
  <div>
    <h3>{{ header }}</h3>
    <a
      href="#"
      @click.prevent="isShowBlock = !isShowBlock"
    >
      {{ t(isShowBlock ? 'common.hide' : 'common.show') }}
    </a>
    <span class="badge text-bg-secondary ms-2">{{ visibleRewardsCount }}</span>
    <div
      v-if="isShowBlock"
      class="heightable pe-2 mt-2"
    >
      <table class="table table-striped table-hover table-sm">
        <thead>
          <tr>
            <th></th>
            <th
              class="sortable"
              @click="toggleSort"
            >
              {{ t('common.resource') }}
              <span
                class="sort-label"
                v-html="nameSortLabel"
              ></span>
            </th>
            <th>{{ t('common.quantity') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!sortRewards.length">
            <td colspan="3">{{ t('common.noData') }}</td>
          </tr>
          <tr
            v-for="reward in sortRewards"
            v-else
            :key="reward.uniqueId"
          >
            <td>
              <img
                v-if="reward.item.iconUrl && reward.item.iconWidth && reward.item.iconHeight"
                :src="reward.item.iconUrl"
                :width="reward.item.iconWidth"
                :height="reward.item.iconHeight"
                class="icon"
              />
            </td>
            <td>{{ getItemName(reward) }}</td>
            <td class="text-end">{{ reward.humanQuantity }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.icon {
  width: 24px;
  height: 24px;
}
.heightable {
  max-height: 90vh;
  overflow: auto;
}
.sortable {
  cursor: pointer;
}
.sort-label {
  font-size: 1.6em;
}
</style>
