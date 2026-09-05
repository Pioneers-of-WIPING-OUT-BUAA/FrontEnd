<template>
  <div class="ros-map-container">
    <div ref="element" class="ros-map-canvas"></div>
    <div v-if="!ws.isConnected" class="ros-map-status">WebSocket 未连接，无法显示地图</div>
    <div v-else-if="failed" class="ros-map-status">地图数据异常，无法渲染地图</div>
    <el-icon v-else-if="loading" class="ros-map-status is-loading" :size="60"><Loading /></el-icon>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { wsStore } from '@/stores/wsStore'
import { createRosMap, type MapPoint } from '@/utils/rosMap'

const props = withDefaults(defineProps<{ points?: MapPoint[] }>(), { points: () => [] })
const ws = wsStore()
const element = ref<HTMLElement | null>(null)
const loading = ref(true)
const failed = ref(false)
let map: ReturnType<typeof createRosMap> | null = null

watch([element, () => ws.ws], ([container, ros], _, onCleanup) => {
  loading.value = true
  failed.value = false
  if (!container || !ros) return
  try {
    const current = createRosMap(container, ros, () => {
      loading.value = false
      failed.value = false
    }, () => { failed.value = true })
    map = current
    current.setPoints(props.points)
    onCleanup(() => { current.dispose(); map = null })
  } catch {
    failed.value = true
  }
}, { flush: 'post' })

watch(() => props.points, points => map?.setPoints(points), { deep: true })
</script>

<style scoped>
.ros-map-container { position: relative; width: 100%; max-width: 600px; aspect-ratio: 1; }
.ros-map-canvas { width: 100%; height: 100%; }
.ros-map-canvas :deep(canvas) { width: 100%; height: 100%; }
.ros-map-status { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
</style>
