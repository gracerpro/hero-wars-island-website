import { flushPromises, shallowMount } from '@vue/test-utils'
import TheHome from '../../src/views/TheHome.vue'
import { describe, it, expect, vi } from 'vitest'
import Island from '@/api/Island'
import News from '@/api/News'

const responseIslands = {
  items: [
    {
      id: 1,
      name: "First island",
      eventStartAt: "2000-01-01 01:00:00",
      eventEndAt: "2000-02-01 12:00:00",
      nodesLastUpdatedAt: "2000-01-15 00:00:00",
    },
    {
      id: 1,
      name: "Second island",
      eventStartAt: "2000-02-01 01:00:00",
      eventEndAt: "2000-03-01 12:00:00",
      nodesLastUpdatedAt: "2000-02-15 00:00:00",
    },
    {
      id: 1,
      name: "Third island",
      eventStartAt: "2000-03-01 01:00:00",
      eventEndAt: "2000-04-01 12:00:00",
      nodesLastUpdatedAt: "2000-03-15 00:00:00",
    },
  ],
  totalCount: 3,
}

const responseNews = {
  items: [
    {
      id: 1,
      slug: "one",
      createdAt: new Date("2024-01-01 00:00:01"),
      updatedAt: new Date("2024-01-01 00:00:01"),
      name: "One",
      snippet: "<p>One</p>"
    },
    {
      id: 2,
      slug: "two",
      createdAt: new Date("2024-01-02 00:00:02"),
      updatedAt: new Date("2024-01-02 00:00:02"),
      name: "Two",
      snippet: "<p>Two</p>"
    },
    {
      id: 3,
      slug: "three",
      createdAt: new Date("2024-01-03 00:00:03"),
      updatedAt: new Date("2024-01-03 00:00:03"),
      name: "Three",
      snippet: "<p>Three</p>"
    },
  ],
  totalCount: 10
}

const responseEmptyList = {
  items: [],
  totalCount: 0
}

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
