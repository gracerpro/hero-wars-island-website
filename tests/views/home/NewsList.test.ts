import { flushPromises, shallowMount } from '@vue/test-utils'
import { responseNews } from '../../data/news'
import { NewsApi } from '@/api/NewsApi'
import NewsList from '@/views/home/NewsList.vue'
import { expect, it, vi } from 'vitest'

it('load news', async () => {
  const getNewsList = vi.spyOn(NewsApi.prototype, 'getList')
  getNewsList.mockResolvedValue(responseNews)

  const wrapper = shallowMount(NewsList)

  await wrapper.vm.$nextTick()
  await flushPromises()

  expect(getNewsList).toBeCalled()
  expect(wrapper.vm.news).toHaveLength(3)
})
