import { shallowMount } from '@vue/test-utils'
import TheContact from '../../src/views/TheContact.vue'
import { describe, it, expect } from 'vitest'

describe('The about page', () => {
  it("mount component", async () => {
    expect(TheContact).toBeTruthy()

    const wrapper = shallowMount(TheContact)

    const h1 = await wrapper.get('h1');
    expect(h1.text()).toBe("Contacts")
  })
})
