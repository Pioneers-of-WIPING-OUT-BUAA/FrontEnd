import { request, fileRequest } from './api'

export function mapStartReq(method: string, params: object) {
  const url = `/mapping/start`
  return request(url, method, params)
}

export function mapStopReq(method: string, params: object) {
  const url = '/mapping/stop'
  return request(url, method, params)
}

export function mapSaveReq(method: string, params: object) {
  const url = '/mapping/save'
  return request(url, method, params, 15000)
}

export function mapMoveReq(method: string, params: object) {
  const url = '/mapping/move'
  return request(url, method, params)
}

export function mapDeleteReq(method: string, query_id: number) {
  const url = `/mapping/delete/${query_id}`
  return request(url, method, {})
}
