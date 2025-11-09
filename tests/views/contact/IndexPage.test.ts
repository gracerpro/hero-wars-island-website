import { shallowMount } from '@vue/test-utils'
import IndexPage from '../../../src/views/contact/IndexPage.vue'
import { describe, it, expect } from 'vitest'

describe('The about page', () => {
  it('mount component', async () => {
    expect(IndexPage).toBeTruthy()

    const wrapper = shallowMount(IndexPage)

    const h1 = wrapper.get('h1')
    expect(h1.text()).toBe('Contacts')
  })
})
