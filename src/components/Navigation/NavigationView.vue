<template>
  <el-steps :active="step" finish-status="success" align-center>
    <!-- Step 1 -->
    <el-step title="航点排序" icon="el-icon-sort"> </el-step>

    <!-- Step 2 -->
    <el-step title="巡检模式" icon="el-icon-guide"> </el-step>
  </el-steps>
  <div v-if="step === 1" class="step-content">
    <waypoint-sort
      ref="waypointSortRef"
      :editable="false"
      :map-info="mapInfo"
      @next="startPatrol"
      @prev="emits('back')"
    ></waypoint-sort>
  </div>

  <div v-if="step === 2" class="step-content">
    <navigation-ctrl 
      @back-to-step2="backToStep1" 
      :path="patrolInfo?.path" 
      :loop="patrolInfo?.loop"
      :map-info="mapInfo"
      :name="patrolInfo?.name || '自动巡检'"
    ></navigation-ctrl>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, withDefaults, defineProps, onMounted, watch } from 'vue'
import NavigationCtrl from '@/components/Navigation/NavigationCtrl.vue'
import { MapInfo } from '@/utils/models'
import WaypointSort from '@/components/Navigation/WaypointSort.vue'
import { ElMessage } from 'element-plus'

interface autoProps {
  mapInfo: MapInfo
  initializeNow?: boolean
}

const props = withDefaults(defineProps<autoProps>(), {
  mapInfo: {},
  initializeNow: false
})

const emits = defineEmits(['back'])
const step = ref(1)
const waypointSortRef = ref<InstanceType<typeof WaypointSort> | null>(null)
const isInitialized = ref(false)

let patrolInfo = ref<{ path: { x: number; y: number; yaw: number; name: string }[]; loop: number; name?: string } | null>(null)

function startPatrol(info: { path: { x: number; y: number; yaw: number; name: string }[]; loop: number; name: string }) {
  if (!info.path.length) {
    ElMessage.error('请先添加航点')
    return
  }
  patrolInfo.value = info
  step.value = 2
}

function backToStep1() {
  step.value = 1
}

// 初始化方法
function initialize() {
  if (isInitialized.value) return

  setTimeout(() => {
    if (waypointSortRef.value) {
      waypointSortRef.value.initData()
      isInitialized.value = true
    }
  }, 100)
}

// 监听props.initializeNow的变化
watch(
  () => props.initializeNow,
  (newVal) => {
    if (newVal && !isInitialized.value) {
      initialize()
    }
  }
)

// 暴露初始化方法给父组件
defineExpose({
  initialize
})
</script>

<style scoped>
.step-card {
  padding: 0 !important;
  margin-top: 16px;
}
</style>
