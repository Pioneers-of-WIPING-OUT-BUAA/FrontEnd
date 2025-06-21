import axios, { AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { userStore } from '@/stores/userStore'

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

// 通用消息提示封装
function showError(msg: string) {
  ElMessage({
    message: msg,
    type: 'error',
    showClose: true,
    duration: 3000
  })
}

export async function request(url: string, method: string, params: object, timeout = 15000) {
  const options: AxiosRequestConfig = { url, method, headers: {} }
  axios.defaults.timeout = timeout
  const token = getSessionToken()
  const tokenObj = token ? { Authorization: 'Bearer ' + token } : {}
  options.headers = { ...tokenObj }

  if (typeof params !== 'undefined') {
    if (method.toLowerCase() === 'get' || method.toLowerCase() === 'delete') {
      options.params = params
    } else {
      options.data = params
    }
  }

  axios.interceptors.response.use(
    (response) => response,
    (e) => {
      if (e.response) {
        const tmp = e.response
        switch (tmp.status) {
          case 400:
            showError(tmp.data.error_msg || '请求错误')
            break
          case 401:
            showError('登录过期，请重新登录')
            logout()
            break
          case 500:
            showError('500 Internal Server Error')
            break
          case 404:
            showError(tmp.data.error_msg || '请求资源未找到')
            break
          default:
            showError(tmp.data.error_msg || '请求错误')
            break
        }
      }
      return Promise.reject(e)
    }
  )

  const response = await axios.request(options)
  return response
}

export async function fileRequest(url: string, method: string, params: object, timeout = 15000) {
  axios.defaults.timeout = timeout
  const options: AxiosRequestConfig = { url, method, headers: {} }
  const token = getSessionToken()
  const tokenObj = token ? { Authorization: 'Bearer ' + token } : {}

  if (typeof params !== 'undefined') {
    if (method.toLowerCase() === 'get') {
      options.params = params
      options.responseType = 'blob'
      options.headers = { ...tokenObj }
    } else {
      options.data = params
      options.headers = { 'Content-Type': 'multipart/form-data', ...tokenObj }
    }
  }

  axios.interceptors.response.use(
    (response) => response,
    (e) => {
      if (e.response) {
        const tmp = e.response
        switch (tmp.status) {
          case 400:
            showError(tmp.data.error_msg || '请求错误')
            break
          case 401:
            showError('登录过期，请重新登录')
            logout()
            break
          case 500:
            showError('500 Internal Server Error')
            break
          case 404:
            showError(tmp.data.error_msg || '请求资源未找到')
            break
          default:
            showError(tmp.data.error_msg || '请求错误')
            break
        }
      }
      return Promise.reject(e)
    }
  )

  const response = await axios.request(options)
  return response
}

function getSessionToken() {
  const user = userStore()
  return user.token
}

function logout() {
  const user = userStore()
  user.logout()
}
