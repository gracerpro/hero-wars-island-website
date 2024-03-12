import { shallowMount } from '@vue/test-utils'
import TheInternalServerError from '../../../src/views/status-pages/TheInternalServerError.vue'
import { describe, it, expect } from 'vitest'

describe('The about page', () => {
  it("mount component", async () => {
    expect(TheInternalServerError).toBeTruthy()

    const wrapper = shallowMount(TheInternalServerError)

    const h1 = await wrapper.get('h1');
    expect(h1.text()).toBe("500 An internal server error has occurred")
  })
})
