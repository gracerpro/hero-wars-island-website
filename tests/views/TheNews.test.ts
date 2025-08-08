import { flushPromises, shallowMount } from '@vue/test-utils'
import TheNews from '../../src/views/TheNews.vue'
import { describe, it, expect, vi } from 'vitest'
import { NewsApi } from '@/api/NewsApi'
import { responseNews } from "../data/news"
import { responseEmptyList } from "../data/common"

describe('The news page', () => {
  it("mount component", async () => {
    const getList = vi.spyOn(NewsApi.prototype, "getList");
    getList.mockResolvedValue(responseEmptyList)

    expect(TheNews).toBeTruthy()

    const wrapper = shallowMount(TheNews)
    const h1 = wrapper.get("h1");

    expect(h1.text()).toBe("News")
  })

  it("empty list", async () => {
    const getList = vi.spyOn(NewsApi.prototype, "getList");
    getList.mockResolvedValue(responseEmptyList)

    const wrapper = shallowMount(TheNews)

    await wrapper.vm.$nextTick();
    await flushPromises();

    expect(wrapper.vm.news).toHaveLength(0)

    const alertInfo = wrapper.get(".alert.alert-info")
    expect(alertInfo.text()).toBe("No data")
  })

  it("not empty list", async () => {
    const getList = vi.spyOn(NewsApi.prototype, "getList");
    getList.mockResolvedValue(responseNews)

    const wrapper = shallowMount(TheNews)

    await wrapper.vm.$nextTick();
    await flushPromises();

    expect(getList).toBeCalled()
    expect(wrapper.vm.news).toHaveLength(3)
  })
})
