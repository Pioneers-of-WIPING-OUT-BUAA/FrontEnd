import { beforeEach, expect, it, vi } from 'vitest'
import { flushPromises, shallowMount } from '@vue/test-utils'
import NavigationCtrl from '@/components/Navigation/NavigationCtrl.vue'
import { navPatrolReq, navStopReq } from '@/api/nav'

vi.mock('@/api/nav', () => ({ navPatrolReq: vi.fn(), navStopReq: vi.fn() }))
vi.mock('@/stores/wsStore', () => ({ wsStore: () => ({ ws: {} }) }))
vi.mock('@/stores/kinectStore', () => ({ kinectStore: () => ({ setKinect: vi.fn() }) }))

const props = { path: [{ id: 1, x: 0, y: 0, theta: 0, name: 'first' }], loop: 0, mapInfo: { id: 1 }, name: 'test' }
const button = { template: '<button @click="$emit(\'click\')"><slot /></button>' }
function mount() {
  return shallowMount(NavigationCtrl, { props, global: {
    renderStubDefaultSlot: true,
    stubs: { 'el-button': button, 'el-row': true, 'el-col': true, 'el-card': true }
  } })
}

beforeEach(() => {
  vi.mocked(navPatrolReq).mockResolvedValue({ status: 200, data: { success: true } } as any)
  vi.mocked(navStopReq).mockResolvedValue({ status: 200, data: { success: true } } as any)
})

it('uses Axios success and keeps the stop action available', async () => {
  const wrapper = mount()
  await wrapper.find('button').trigger('click')
  await flushPromises()
  expect(wrapper.find('button').text()).toBe('退出')
  await wrapper.find('button').trigger('click')
  await flushPromises()
  expect(navStopReq).toHaveBeenCalledTimes(1)
  expect(wrapper.find('button').text()).toBe('开始')
  wrapper.unmount()
})

it('retains the active state when stopping fails', async () => {
  const wrapper = mount()
  await wrapper.find('button').trigger('click')
  await flushPromises()
  vi.mocked(navStopReq).mockRejectedValueOnce(new Error('offline'))
  await wrapper.find('button').trigger('click')
  await flushPromises()
  expect(wrapper.find('button').text()).toBe('退出')
  wrapper.unmount()
})

it('cancels a start that completes after the component has unmounted', async () => {
  let resolve: (value: any) => void = () => {}
  vi.mocked(navPatrolReq).mockReturnValue(new Promise(done => { resolve = done }))
  const wrapper = mount()
  await wrapper.find('button').trigger('click')
  wrapper.unmount()
  resolve({ status: 200, data: { success: true } })
  await flushPromises()
  expect(navStopReq).toHaveBeenCalledTimes(1)
})
