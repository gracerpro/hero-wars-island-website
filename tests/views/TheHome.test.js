import { shallowMount } from '@vue/test-utils'
import TheHome from '../../src/views/TheHome.vue'
import { describe, it, expect } from 'vitest'

/*
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
};*/

describe('The home page', () => {
  it("mount component", async () => {
    expect(TheHome).toBeTruthy()

    const wrapper = shallowMount(TheHome, {
      props: {}
    })

    const h1 = await wrapper.get('h1');
    expect(h1.text()).toBe("Adventures islands - Hero Wars Dominion Era")
  })
})
