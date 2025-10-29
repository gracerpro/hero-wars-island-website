import HeroClient from '@/api/HeroClient'
import type { NewsFilter, OneNews } from '@/api/NewsApi'
import type { Pagination } from '@/core/pagination'
import { ref } from 'vue'

export interface Filter {
  name: string
}

export interface InitParams {
  isLoading: boolean
}

const client = new HeroClient()

export function useNews() {
  const news = ref<Array<OneNews>>([])
  const isLoading = ref(false)
  const totalCount = ref(0)
  const visibleCount = ref(0)
  const pagination: Pagination = { pageSize: 10, pageNumber: 1 }
  const filter = ref<Filter>({
    name: '',
  })

  const filterNameMinCharsCount = 3

  function load() {
    isLoading.value = true
    client.news
      .getList(pagination.pageSize, pagination.pageNumber ?? 1)
      .then((list) => {
        news.value = list.items
        totalCount.value = list.totalCount
        visibleCount.value = list.items.length
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => (isLoading.value = false))
  }

  function loadAppend() {
    if (pagination.pageNumber === undefined) {
      pagination.pageNumber = 1
    } else {
      pagination.pageNumber++
    }

    const requestFilter: NewsFilter = {}

    if (filter.value.name.length >= filterNameMinCharsCount) {
      requestFilter.name = filter.value.name
    }

    isLoading.value = true
    client.news
      .getList(pagination.pageSize, pagination.pageNumber ?? 1, requestFilter)
      .then((list) => {
        list.items.forEach((oneNews) => {
          news.value.push(oneNews)
        })
        totalCount.value = list.totalCount

        visibleCount.value += list.items.length
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => (isLoading.value = false))
  }

  function reset() {
    pagination.pageNumber = 1
    news.value = []
    visibleCount.value = 0
    totalCount.value = 0

    load()
  }

  return {
    news,
    isLoading,
    totalCount,
    visibleCount,
    load,
    loadAppend,
    reset,
    pagination,
    filter,
    filterNameMinCharsCount,
  }
}
