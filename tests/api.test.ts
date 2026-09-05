import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import { http, request, fileRequest } from '@/api/api'

vi.mock('element-plus', () => ({ ElMessage: vi.fn() }))
vi.mock('@/stores/userStore', () => ({ userStore: () => ({ token: 'test-token', logout: vi.fn() }) }))

beforeEach(() => {
  http.defaults.adapter = async config => ({ config, status: 200, statusText: 'OK', headers: {}, data: { success: true } })
})

describe('request lifetime', () => {
  it('shows one error after repeated normal and upload requests', async () => {
    for (let index = 0; index < 20; index++) {
      await request('/test', 'get')
      await fileRequest('/test', 'post', new FormData())
    }
    http.defaults.adapter = async config => {
      throw new AxiosError('failure', 'ERR_BAD_REQUEST', config, null, { config, status: 400, statusText: 'Bad request', headers: {}, data: { error_msg: 'bad input' } })
    }
    await expect(request('/test', 'get')).rejects.toThrow('failure')
    expect(ElMessage).toHaveBeenCalledTimes(1)
  })

  it('keeps timeouts local and includes the token', async () => {
    const configs: any[] = []
    http.defaults.adapter = async config => {
      configs.push(config)
      return { config, status: 200, statusText: 'OK', headers: {}, data: {} }
    }
    await Promise.all([request('/slow', 'get', {}, 9000), request('/fast', 'get', {}, 1000)])
    expect(configs.map(config => config.timeout)).toEqual([9000, 1000])
    expect(configs[0].headers.Authorization).toBe('Bearer test-token')
    expect(http.defaults.timeout).toBe(15000)
  })
})
