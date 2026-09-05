import axios, { type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { userStore } from '@/stores/userStore'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 15000
})

http.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status
    const message = status === 401
      ? '登录过期，请重新登录'
      : error.response?.data?.error_msg || (error.response ? '请求失败' : '无法连接服务器')
    ElMessage({ message, type: 'error', showClose: true, duration: 3000 })
    if (status === 401) userStore().logout()
    return Promise.reject(error)
  }
)

function send(url: string, method: string, params: object | undefined, timeout: number, responseType?: 'blob') {
  const token = userStore().token
  const options: AxiosRequestConfig = {
    url, method, timeout, responseType,
    headers: token ? { Authorization: 'Bearer ' + token } : {}
  }
  if (['get', 'delete'].includes(method.toLowerCase())) options.params = params
  else options.data = params
  return http.request(options)
}

export function request(url: string, method: string, params: object = {}, timeout = 15000) {
  return send(url, method, params, timeout)
}

export function fileRequest(url: string, method: string, params: object = {}, timeout = 15000) {
  return send(url, method, params, timeout, method.toLowerCase() === 'get' ? 'blob' : undefined)
}
