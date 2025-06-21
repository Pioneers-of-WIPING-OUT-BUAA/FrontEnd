import { request, fileRequest } from './api'

export function authLoginReq(method: string, params: object) {
  const url = '/auth/login'
  return request(url, method, params)
}

export function authRegisterReq(method: string, params: object) {
  const url = '/auth/register'
  return request(url, method, params)
}

export function authUpdatePwdReq(method: string, params: object) {
  const url = '/auth/update'
  return request(url, method, params)
}

export function getUserDetailReq(method: string) {
  const url = '/auth/detail'
  return request(url, method, {})
}

// export function userReq(method: string, params: object = {}) {
//   const url = `/user`;
//   return request(url, method, params);
// }

// export function imgUserReq(method: string, params: object = {}) {
//   const url = `/image/user`;
//   return fileRequest(url, method, params);
// }
