import { expect, it, vi } from 'vitest'
import { responseIslands } from '../../data/island'
import { IslandApi } from '@/api/IslandApi'
import { flushPromises, shallowMount } from '@vue/test-utils'
import IslandList from '@/views/home/IslandList.vue'

it('load islands', async () => {
  const getIslandsList = vi.spyOn(IslandApi.prototype, 'getList')
  getIslandsList.mockResolvedValue(responseIslands)

  const wrapper = shallowMount(IslandList)

  await wrapper.vm.$nextTick()
  await flushPromises()

  expect(getIslandsList).toBeCalled()
  expect(wrapper.vm.islands).toHaveLength(3)
  expect(wrapper.vm.errorMessage).toBe('')
})
