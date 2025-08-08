import { shallowMount } from '@vue/test-utils'
import TheAbout from '../../src/views/TheAbout.vue'
import { describe, it, expect } from 'vitest'

describe('The about page', () => {
  it("mount component", async () => {
    expect(TheAbout).toBeTruthy()

    const wrapper = shallowMount(TheAbout)

    const h1 = await wrapper.get('h1');
    expect(h1.text()).toBe("About")
  })
})
