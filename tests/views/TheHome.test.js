import { flushPromises, shallowMount } from '@vue/test-utils'
import TheHome from '../../src/views/TheHome.vue'
import { describe, it, expect, vi } from 'vitest'
import Island from '@/api/Island'

let responseJson = {
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

describe('The home page', () => {
  it("mount component", async () => {
    expect(TheHome).toBeTruthy()

    const wrapper = shallowMount(TheHome)

    const h1 = await wrapper.get('h1');
    expect(h1.text()).toBe("Adventures islands - Hero Wars Dominion Era")
  })

  it("load islands", async () => {
    const getList = vi.spyOn(Island.prototype, "getList");
    getList.mockResolvedValueOnce(responseJson)

    const wrapper = shallowMount(TheHome)

    await wrapper.vm.$nextTick();
    await flushPromises();

    expect(getList).toBeCalled()
    expect(wrapper.vm.islands).toHaveLength(3)
    expect(wrapper.vm.errorMessage).toBe("")
    console.log(wrapper.html());

  //  const h1 = await wrapper.get('h1');
  //  expect(h1.text()).toBe("Adventures islands - Hero Wars Dominion Era")
  })
})
