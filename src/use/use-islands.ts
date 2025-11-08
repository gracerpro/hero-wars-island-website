import HeroClient from '@/api/HeroClient'
import type { Island } from '@/api/IslandApi'
import type { Pagination } from '@/core/pagination'
import { useI18n } from '@/i18n'
import { ref } from 'vue'

const client = new HeroClient()
const { t } = useI18n()

export function useIslands() {
  const isLoading = ref(false)
  const islands = ref<Island[]>([])
  const errorMessage = ref('')
  const totalCount = ref(0)
  const visibleCount = ref(0)
  const pagination: Pagination = { pageSize: 10, pageNumber: 1 }

  function load() {
    isLoading.value = true
    client.island
      .getList(pagination.pageSize, pagination.pageNumber ?? 1)
      .then((list) => {
        islands.value = list.items
        totalCount.value = list.totalCount
        visibleCount.value = list.items.length
      })
      .catch((error) => {
        console.error(error)
        errorMessage.value = t('common.loadingFailDeveloperShow')
      })
      .finally(() => (isLoading.value = false))
  }

  function loadAppend() {
    if (pagination.pageNumber === undefined) {
      pagination.pageNumber = 1
    } else {
      pagination.pageNumber++
    }

    isLoading.value = true
    client.island
      .getList(pagination.pageSize, pagination.pageNumber ?? 1)
      .then((list) => {
        list.items.forEach((island) => {
          islands.value.push(island)
        })
        totalCount.value = list.totalCount
        visibleCount.value += list.items.length
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => (isLoading.value = false))
  }

  return {
    isLoading,
    load,
    loadAppend,
    errorMessage,
    islands,
    pagination,
    totalCount,
    visibleCount,
  }
}
