import { shallowMount } from '@vue/test-utils'
import TheHelp from '../../src/views/TheHelp.vue'
import { describe, it, expect } from 'vitest'

describe('The about page', () => {
  it("mount component", async () => {
    expect(TheHelp).toBeTruthy()

    const wrapper = shallowMount(TheHelp)

    const h1 = await wrapper.get('h1');
    expect(h1.text()).toBe("Project's help")
  })
})
