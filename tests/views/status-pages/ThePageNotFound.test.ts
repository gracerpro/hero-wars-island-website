import { shallowMount } from '@vue/test-utils'
import ThePageNotFound from '../../../src/views/status-pages/ThePageNotFound.vue'
import { describe, it, expect } from 'vitest'

describe('The about page', () => {
  it('mount component', () => {
    expect(ThePageNotFound).toBeTruthy()

    const wrapper = shallowMount(ThePageNotFound)

    const h1 = wrapper.get('h1')
    expect(h1.text()).toBe('404 Page not found')
  })
})
