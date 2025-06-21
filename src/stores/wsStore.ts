// 管理 ROS WebSocket 对象
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import 'roslib/build/roslib'
import ROSLIB from 'roslib'
import { ElNotification } from 'element-plus'

export const wsStore = defineStore('ws', () => {
  const ws = ref<ROSLIB.Ros | null>(null)
  const isConnected = computed(() => ws.value !== null)

  // 连接机器人
  function connect(url = 'ws://10.193.174.182:9090') {
    if (ws.value) {
      ElNotification({
        title: '已连接',
        message: '已连接机器人',
        type: 'success',
        position: 'top-right',
        duration: 1000
      })
      return
    }
    const ros = new ROSLIB.Ros({ url })
    ros.on('connection', function () {
      ElNotification({
        title: '连接成功',
        message: '连接机器人成功',
        type: 'success',
        position: 'top-right',
        duration: 1000
      })
      ws.value = ros
    })
    ros.on('error', function (error) {
      console.error('ROS连接失败详细信息:', error)
      ElNotification({
        title: '连接失败',
        message: '连接机器人失败，请检查网络',
        type: 'error',
        position: 'top-right',
        duration: 2000
      })
    })
    ros.on('close', function () {
      ws.value = null
      ElNotification({
        title: '连接关闭',
        message: '机器人连接已关闭',
        type: 'warning',
        position: 'top-right',
        duration: 15000
      })
    })
  }

  // 断开机器人
  function disconnect() {
    if (ws.value) {
      ws.value.close()
      ws.value = null
      ElNotification({
        title: '断开连接',
        message: '已断开机器人连接',
        type: 'warning',
        position: 'top-right',
        duration: 15000
      })
    }
  }

  return { ws, isConnected, connect, disconnect }
})
