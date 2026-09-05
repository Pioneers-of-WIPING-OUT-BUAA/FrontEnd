import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import KinectDisplay from '@/components/rosBridge/KinectDisplay.vue'
import LogNotifyView from '@/views/LogNotifyView.vue'
import { wsStore } from '@/stores/wsStore'
import { logStore } from '@/stores/logStore'
import { logLatestReq } from '@/api/log'

const { topics } = vi.hoisted(() => ({ topics: [] as any[] }))
vi.mock('roslib', () => ({ default: { Topic: class {
  callback: any
  unsubscribe = vi.fn()
  constructor() { topics.push(this) }
  subscribe(callback: any) { this.callback = callback }
} } }))
vi.mock('element-plus', () => ({ ElNotification: vi.fn() }))
vi.mock('@/api/log', () => ({ logLatestReq: vi.fn() }))

beforeEach(() => { setActivePinia(createPinia()); topics.length = 0; vi.useFakeTimers() })
afterEach(() => vi.useRealTimers())

it('subscribes after connection and clears camera timers and subscriptions on unmount', async () => {
  const store = wsStore()
  const wrapper = shallowMount(KinectDisplay)
  expect(topics).toHaveLength(0)
  store.ws = {} as any
  await nextTick()
  expect(topics).toHaveLength(1)
  await vi.advanceTimersByTimeAsync(3000)
  expect(wrapper.text()).toContain('暂未收到摄像头画面')
  topics[0].callback({ data: 'test-image' })
  await nextTick()
  expect(wrapper.find('img').attributes('src')).toContain('test-image')
  wrapper.unmount()
  expect(topics[0].unsubscribe).toHaveBeenCalledTimes(1)
  expect(vi.getTimerCount()).toBe(0)
})

it('handles an empty latest log and stops polling on unmount', async () => {
  logStore().show = true
  vi.mocked(logLatestReq).mockResolvedValue({ data: { log: null } } as any)
  const wrapper = shallowMount(LogNotifyView)
  await vi.advanceTimersByTimeAsync(10000)
  expect(logLatestReq).toHaveBeenCalledTimes(1)
  wrapper.unmount()
  await vi.advanceTimersByTimeAsync(30000)
  expect(logLatestReq).toHaveBeenCalledTimes(1)
  expect(vi.getTimerCount()).toBe(0)
})
