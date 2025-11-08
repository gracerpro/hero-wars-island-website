import { shallowMount } from '@vue/test-utils'
import IndexPage from '../../../src/views/home/IndexPage.vue'
import { describe, it, expect, vi } from 'vitest'
import { IslandApi } from '@/api/IslandApi'
import { NewsApi } from '@/api/NewsApi'
import { responseEmptyList } from '../../data/common'

describe('The home page', () => {
  it('mount component', async () => {
    const getIslandList = vi.spyOn(IslandApi.prototype, 'getList')
    getIslandList.mockResolvedValue(responseEmptyList)
    const getNewsList = vi.spyOn(NewsApi.prototype, 'getList')
    getNewsList.mockResolvedValue(responseEmptyList)

    expect(IndexPage).toBeTruthy()

    const wrapper = shallowMount(IndexPage)

    const h1 = wrapper.get('h1')
    expect(h1.text()).toBe('Adventures islands - Hero Wars Dominion Era')
  })
})
