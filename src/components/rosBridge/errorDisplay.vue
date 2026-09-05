<script setup lang="ts">
import { watch } from 'vue'
import { wsStore } from '@/stores/wsStore'
import ROSLIB from 'roslib'
import { ElNotification } from 'element-plus'

const ws = wsStore()
watch(() => ws.ws, (ros, _, onCleanup) => {
  if (!ros) return
  const listener = new ROSLIB.Topic({
    ros, name: '/error', messageType: 'Aft_g1/ErrorMsg', queue_length: 1, throttle_rate: 100
  })
  listener.subscribe((message: any) => {
    ElNotification({ title: '错误信息', message: message.message, type: 'error', duration: 3000 })
  })
  onCleanup(() => listener.unsubscribe())
}, { immediate: true })
</script>
