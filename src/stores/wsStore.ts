import { defineStore } from 'pinia'
import { shallowRef, ref, computed } from 'vue'
import ROSLIB from 'roslib'
import { ElNotification } from 'element-plus'

export const wsStore = defineStore('ws', () => {
  const ws = shallowRef<ROSLIB.Ros | null>(null)
  const isConnected = computed(() => ws.value !== null)
  const isConnecting = ref(false)
  let socket: ROSLIB.Ros | null = null
  let pending: Promise<void> | null = null
  let cancelConnect: (() => void) | null = null

  function connect(url = import.meta.env.VITE_ROSBRIDGE_URL || 'ws://127.0.0.1:9090') {
    if (ws.value) return Promise.resolve()
    if (pending) return pending
    const ros = new ROSLIB.Ros({})
    socket = ros
    isConnecting.value = true
    const attempt = new Promise<void>((resolve, reject) => {
      let settled = false
      const finish = (error?: Error) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        isConnecting.value = false
        cancelConnect = null
        if (error) reject(error)
        else resolve()
      }
      const timer = setTimeout(() => {
        finish(new Error('机器人连接超时'))
        if (socket === ros) socket = null
        ros.close()
      }, 5000)
      cancelConnect = () => finish(new Error('机器人连接已取消'))
      ros.on('connection', () => {
        if (socket !== ros) return
        ws.value = ros
        finish()
      })
      ros.on('error', () => {
        if (socket !== ros) return
        finish(new Error('机器人连接失败'))
        ws.value = null
        socket = null
        ros.close()
      })
      ros.on('close', () => {
        if (socket !== ros) return
        const connected = ws.value !== null
        ws.value = null
        socket = null
        finish(new Error('机器人连接已关闭'))
        if (connected) ElNotification({ title: '连接关闭', message: '机器人连接已关闭', type: 'warning' })
      })
      try {
        ros.connect(url)
      } catch (error) {
        socket = null
        finish(error instanceof Error ? error : new Error('机器人地址无效'))
      }
    })
    pending = attempt
    const clear = () => { if (pending === attempt) pending = null }
    attempt.then(clear, clear)
    return attempt
  }

  function disconnect() {
    const closing = socket
    socket = null
    ws.value = null
    cancelConnect?.()
    pending = null
    closing?.close()
  }

  return { ws, isConnected, isConnecting, connect, disconnect }
})
