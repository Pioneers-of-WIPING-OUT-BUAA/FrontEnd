<template>
  <div class="kinect-container">
    <img v-if="!wsError && !imgError" :src="url" fit="scale-down" class="kinect" @error="onImgError" />
    <div v-else-if="wsError" class="kinect-error">摄像头连接异常，请检查网络或ROSBridge</div>
    <div v-else-if="imgError" class="kinect-error">暂未收到摄像头画面</div>
  </div>
</template>

<script lang="ts" setup>
import 'roslib/build/roslib'
import { ref, onMounted, onUnmounted } from 'vue'
import { wsStore } from '@/stores/wsStore'
import ROSLIB from 'roslib'

// Publishing a Topic
// Subscribing to a Topic
const url = ref('')
let listener: ROSLIB.Topic | null = null
const wsError = ref(false) // WebSocket连接异常
const imgError = ref(false) // 图像流异常
let imgTimeout: any = null // 图像流超时定时器

function subscribe() {
  const ws = wsStore()
  const ros = ws.ws
  console.log('[KinectDisplay] subscribe called, ros:', ros)
  if (!ros || ros.isConnected === false) {
    wsError.value = true
    console.log('[KinectDisplay] WebSocket未连接')
    return
  }
  wsError.value = false
  listener = new (window as any).ROSLIB.Topic({
    ros: ros,
    name: '/kinect2/hd/image_color_rect/compressed',
    messageType: 'sensor_msgs/CompressedImage',
    queue_size: 1, // 必须配合throttle_rate才能生效
    throttle_rate: 5 // 猜测是获取消息间隔，单位ms，大了会更新不及时，小了浪费带宽
  })
  listener.subscribe(function (message: any) {
    if (message && message.data) {
      url.value = 'data:image/jpeg;base64, ' + message.data
      imgError.value = false
      // 每次收到新图片，重置超时定时器
      if (imgTimeout) clearTimeout(imgTimeout)
      imgTimeout = setTimeout(() => {
        imgError.value = true
        console.log('[KinectDisplay] 3秒未收到新图片，触发imgError')
      }, 3000) // 3秒未收到新图片则提示异常
    } else {
      console.log('[KinectDisplay] 收到消息但无data字段:', message)
    }
  })
}

function Unsubscribe() {
  if (listener) {
    listener?.unsubscribe()
    console.log('[KinectDisplay] 已取消订阅listener')
  }
  if (imgTimeout) {
    clearTimeout(imgTimeout)
    console.log('[KinectDisplay] 清除imgTimeout')
  }
}

function onImgError() {
  imgError.value = true
  console.log('[KinectDisplay] 图片加载出错，触发imgError')
}

onMounted(() => {
  subscribe()
  console.log('[KinectDisplay] onMounted，已调用subscribe')
})

onUnmounted(() => {
  Unsubscribe()
  console.log('[KinectDisplay] onUnmounted，已调用Unsubscribe')
})

onMounted(() => {
  let tmpFunc = window.onbeforeunload
  if (tmpFunc !== null) {
    window.onbeforeunload = function (event) {
      Unsubscribe()
      console.log('[KinectDisplay] onbeforeunload，已调用Unsubscribe')
      if (typeof tmpFunc === 'function') {
        tmpFunc.call(this, event)
      }
    }
  } else {
    window.onbeforeunload = function () {
      Unsubscribe()
      console.log('[KinectDisplay] onbeforeunload，已调用Unsubscribe')
    }
  }
})
</script>

<style scoped>
.kinect-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.kinect {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border: 0px;
}

.kinect-error {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  color: #d32f2f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  padding: 16px;
  text-align: center;
  border: 1px solid #d32f2f;
  border-radius: 8px;
}
</style>
