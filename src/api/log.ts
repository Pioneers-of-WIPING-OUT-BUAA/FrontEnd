import { request, fileRequest } from './api'

export function logListReq(method: string) {
  const url = '/log/list'
  return request(url, method, {})
}

export function logLatestReq(method: string) {
  const url = '/log/latest'
  return request(url, method, {})
}

export function changeLogStatusReq(method: string, log_id: number, status: string) {
  const url = `/log/change_status`
  return request(url, method, { status })
}

export function beginLogReq() {
  const url = '/log/begin'
  return request(url, 'post', {})
}

export function endLogReq() {
  const url = '/log/end'
  return request(url, 'post', {})
}

export function getLogFlagReq() {
  const url = '/log/flag'
  return request(url, 'get', {})
}
