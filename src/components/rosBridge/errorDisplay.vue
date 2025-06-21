<script setup lang="ts">
import 'roslib/build/roslib'
import { ref, onMounted } from 'vue'
import { wsStore } from '@/stores/wsStore'
import ROSLIB from 'roslib'
import { ElNotification } from 'element-plus' // 引入 Element Plus 的通知组件

let listener: ROSLIB.Topic | null = null
function subscribe() {
  const ws = wsStore()
  const ros = ws.ws
  listener = new window.ROSLIB.Topic({
    ros: ros,
    name: '/error',
    messageType: 'Tus_g5/ErrorMsg',
    queue_size: 3, // 必须配合 throttle_rate 才能生效
    throttle_rate: 6 // 获取消息间隔，单位 ms
  })
  listener.subscribe(function (message) {
    let msg = message.message
    ElNotification({
      title: '错误信息',
      message: msg,
      type: 'error',
      position: 'top-right', // 可选：top-right, bottom-right, bottom-left
      duration: 3000 // 显示 3 秒
    })
  })
}

function Unsubscribe() {
  ;(listener as ROSLIB.Topic).unsubscribe()
}

onMounted(() => {
  subscribe()
})

onMounted(() => {
  let tmpFunc = window.onbeforeunload
  if (tmpFunc !== null) {
    window.onbeforeunload = () => {
      Unsubscribe()
      tmpFunc()
    }
  } else {
    window.onbeforeunload = () => {
      Unsubscribe()
    }
  }
})
</script>
