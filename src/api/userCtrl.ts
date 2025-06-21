import { request, fileRequest } from './api'

export function ctrlKeyboardReq(method: string, params: object) {
  const url = `/user_ctrl/keyboard`
  return request(url, method, params)
}

export function ctrlCommandReq(method: string, params: object) {
  const url = `/user_ctrl/command`
  return request(url, method, params)
}
