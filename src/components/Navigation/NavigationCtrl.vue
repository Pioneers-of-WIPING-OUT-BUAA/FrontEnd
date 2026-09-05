<template>
  <el-row :gutter="20">
    <el-col :span="6">
      <el-card shadow="hover" class="control-card">
        <div style="text-align: center">
          <div class="text-subtitle1" style="margin-top: 10px">巡检控制</div>
          <el-button :icon="listen ? PauseIcon : PlayIcon" :loading="pending" type="primary" @click="handleInput" style="margin-top: 20px">
            {{ listen ? '退出' : '开始' }}
          </el-button>
        </div>
      </el-card>
    </el-col>

    <el-col :span="18">
      <el-card v-if="listen" style="min-height: 450px; min-width: 500px">
        <nav-display :point-info="path" />
      </el-card>
      <el-card
        v-else
        style="min-height: 450px; min-width: 500px; display: flex; align-items: center; justify-content: center"
      >
        <span>未开始巡检模式</span>
      </el-card>
    </el-col>
  </el-row>

  <el-col :span="24" style="text-align: right; margin-top: 20px">
    <el-button @click="back" :disabled="pending" type="primary">返回</el-button>
  </el-col>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { kinectStore } from '@/stores/kinectStore'
import { wsStore } from '@/stores/wsStore'
import { navPatrolReq, navStopReq } from '@/api/nav'
import { ElMessage } from 'element-plus'
import NavDisplay from '@/components/rosBridge/NavDisplay.vue'
import type { MapInfo } from '@/utils/models'
import { VideoPlay as PlayIcon, VideoPause as PauseIcon } from '@element-plus/icons-vue'

interface PropInfo {
  path: { x: number; y: number; theta: number; name: string; id: number }[]
  loop?: number
  mapInfo: MapInfo
  name: string
}
const props = withDefaults(defineProps<PropInfo>(), { path: () => [], loop: 0 })
const kinect = kinectStore()
const ws = wsStore()
const emit = defineEmits(['backToStep2'])
const listen = ref(false)
const pending = ref(false)
const idList = computed(() => props.path.map(point => point.id))
let disposed = false

async function handleInput() {
  if (pending.value) return
  if (!ws.ws) { ElMessage.error('未连接上机器人'); return }
  pending.value = true
  const starting = !listen.value
  try {
    const response = starting
      ? await navPatrolReq('post', { loop: props.loop, path: idList.value, map: props.mapInfo.id, name: props.name })
      : await navStopReq('get')
    if (response.status !== 200 || response.data?.success !== true) {
      ElMessage.error(starting ? '巡检模式启动失败' : '巡检停止失败')
      return
    }
    if (disposed) {
      if (starting) await navStopReq('get')
      return
    }
    listen.value = starting
    kinect.setKinect(starting)
  } catch {
    // The request layer displays the failure; retain the last confirmed state.
  } finally {
    pending.value = false
  }
}

function back() { emit('backToStep2') }
function beforeUnload() {
  kinect.setKinect(false)
  if (listen.value) {
    listen.value = false
    navStopReq('get').catch(() => {})
  }
}
onMounted(() => window.addEventListener('pagehide', beforeUnload))
onUnmounted(() => {
  disposed = true
  window.removeEventListener('pagehide', beforeUnload)
  beforeUnload()
})
</script>

<style scoped>
.control-card {
  padding: 20px;
  text-align: center;
}
</style>
