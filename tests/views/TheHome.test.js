import { flushPromises, shallowMount } from '@vue/test-utils'
import TheHome from '../../src/views/TheHome.vue'
import { describe, it, expect, vi } from 'vitest'
import { Island } from '@/api/Island'
import { News } from '@/api/News'
import { responseEmptyList } from "../data/common"
import { responseNews } from "../data/news"
import { responseIslands } from "../data/island"

describe('The home page', () => {
  it("mount component", async () => {
    const getIslandList = vi.spyOn(Island.prototype, "getList");
    getIslandList.mockResolvedValue(responseEmptyList)
    const getNewsList = vi.spyOn(News.prototype, "getList");
    getNewsList.mockResolvedValue(responseEmptyList)

    expect(TheHome).toBeTruthy()

    const wrapper = shallowMount(TheHome)

    const h1 = wrapper.get('h1');
    expect(h1.text()).toBe("Adventures islands - Hero Wars Dominion Era")
  })

  it("load islands", async () => {
    const getIslandsList = vi.spyOn(Island.prototype, "getList");
    getIslandsList.mockResolvedValue(responseIslands)

    const getNewsList = vi.spyOn(News.prototype, "getList");
    getNewsList.mockResolvedValue(responseEmptyList)

    const wrapper = shallowMount(TheHome)

    await wrapper.vm.$nextTick();
    await flushPromises();

    expect(getIslandsList).toBeCalled()
    expect(wrapper.vm.islands).toHaveLength(3)
    expect(wrapper.vm.errorMessage).toBe("")
  })

  it("load news", async () => {
    const getIslandList = vi.spyOn(Island.prototype, "getList");
    getIslandList.mockResolvedValue(responseEmptyList)

    const getNewsList = vi.spyOn(News.prototype, "getList");
    getNewsList.mockResolvedValue(responseNews)

    const wrapper = shallowMount(TheHome)

    await wrapper.vm.$nextTick();
    await flushPromises();

    expect(getNewsList).toBeCalled()
    expect(wrapper.vm.news).toHaveLength(3)
    expect(wrapper.vm.errorMessage).toBe("")
  })
})
