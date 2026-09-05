<template>
  <div class="kinect-container">
    <img v-if="url && !wsError && !imgError" :src="url" fit="scale-down" class="kinect" @error="onImgError" />
    <div v-else-if="wsError" class="kinect-error">摄像头连接异常，请检查网络或ROSBridge</div>
    <div v-else-if="imgError" class="kinect-error">暂未收到摄像头画面</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import { wsStore } from '@/stores/wsStore'
import ROSLIB from 'roslib'

const ws = wsStore()
const url = ref('')
const wsError = computed(() => !ws.isConnected)
const imgError = ref(false)

watch(() => ws.ws, (ros, _, onCleanup) => {
  url.value = ''
  imgError.value = false
  if (!ros) return
  let timeout: ReturnType<typeof setTimeout>
  let active = true
  const armTimeout = () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => { imgError.value = true }, 3000)
  }
  const listener = new ROSLIB.Topic({
    ros,
    name: '/kinect2/hd/image_color_rect/compressed',
    messageType: 'sensor_msgs/CompressedImage',
    queue_length: 1,
    throttle_rate: 100
  })
  listener.subscribe((message: any) => {
    if (!active || !message?.data) return
    url.value = 'data:image/jpeg;base64,' + message.data
    imgError.value = false
    armTimeout()
  })
  armTimeout()
  onCleanup(() => {
    active = false
    listener.unsubscribe()
    clearTimeout(timeout)
  })
}, { immediate: true })

function onImgError() {
  imgError.value = true
}
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
