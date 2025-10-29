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

  function load(pagination: Pagination) {
    isLoading.value = true
    client.island
      .getList(pagination.pageSize, pagination.pageNumber ?? 1)
      .then((list) => {
        islands.value = list.items
      })
      .catch((error) => {
        console.error(error)
        errorMessage.value = t('common.loadingFailDeveloperShow')
      })
      .finally(() => (isLoading.value = false))
  }

  return {
    isLoading,
    load,
    errorMessage,
    islands,
  }
}
