import {
  RouteLocationNormalized,
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from 'vue-router'

import routes from './routes'
import { userStore } from '@/stores/userStore'
import { wsStore } from '@/stores/wsStore'
import { ElNotification } from 'element-plus' // ✅ Element Plus 通知组件
import { rosConnectReq } from '@/api/ros'

let connectTimes = 0
const MAX_TIMES = 10
let connect = false

async function authDetect(to: RouteLocationNormalized, from: RouteLocationNormalized) {
  const user = userStore()

  if (!user.isLogin && to.path !== '/login') {
    ElNotification({
      title: '提示',
      message: '还未登录，请先登录',
      type: 'warning',
      position: 'top-right',
      duration: 3000
    })
    return { path: '/login' }
  } else if (user.isLogin && to.path === '/login') {
    return { path: '/welcome' }
  } else {
    return true
  }
}

const createHistory =
  import.meta.env.VITE_SERVER === 'true'
    ? createMemoryHistory
    : import.meta.env.VITE_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

const Router = createRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes,
  history: createHistory(import.meta.env.VITE_VUE_ROUTER_BASE)
})

Router.beforeEach(authDetect)

export default Router
