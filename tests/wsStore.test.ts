import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { EventEmitter } from 'node:events'
import { wsStore } from '@/stores/wsStore'

const { sockets } = vi.hoisted(() => ({ sockets: [] as any[] }))
vi.mock('roslib', () => ({ default: { Ros: class extends EventEmitter {
  constructor() { super(); sockets.push(this) }
  connect = vi.fn()
  close = vi.fn(() => this.emit('close'))
} } }))
vi.mock('element-plus', () => ({ ElNotification: vi.fn() }))

beforeEach(() => { setActivePinia(createPinia()); sockets.length = 0; vi.useFakeTimers() })
afterEach(() => vi.useRealTimers())

it('deduplicates pending connections and reports only confirmed connections', async () => {
  const store = wsStore()
  const first = store.connect(), second = store.connect()
  expect(sockets).toHaveLength(1)
  expect(store.isConnected).toBe(false)
  sockets[0].emit('connection')
  await Promise.all([first, second])
  expect(store.isConnected).toBe(true)
  store.disconnect()
})

it('ignores events from a replaced connection', async () => {
  const store = wsStore()
  const first = store.connect()
  sockets[0].emit('connection')
  await first
  store.disconnect()
  const second = store.connect()
  sockets[1].emit('connection')
  await second
  sockets[0].emit('close')
  expect(store.isConnected).toBe(true)
  store.disconnect()
})

it('times out a connection attempt and allows retry', async () => {
  const store = wsStore()
  const failed = expect(store.connect()).rejects.toThrow('超时')
  await vi.advanceTimersByTimeAsync(5000)
  await failed
  expect(store.isConnecting).toBe(false)
  const retry = store.connect()
  sockets[1].emit('connection')
  await retry
  expect(store.isConnected).toBe(true)
  store.disconnect()
})
