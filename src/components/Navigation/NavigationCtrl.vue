<template>
  <el-row :gutter="20">
    <el-col :span="6">
      <el-card shadow="hover" class="control-card">
        <div style="text-align: center">
          <div class="text-subtitle1" style="margin-top: 10px">巡检控制</div>
          <el-button :icon="listen ? PauseIcon : PlayIcon" type="primary" @click="handleInput" style="margin-top: 20px">
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
    <el-button @click="back" type="primary">返回</el-button>
  </el-col>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, withDefaults, computed, onMounted, onUnmounted } from 'vue'
import { kinectStore } from '@/stores/kinectStore'
import { wsStore } from '@/stores/wsStore'
import { navPatrolReq, navStopReq } from '@/api/nav'
import { ElMessage } from 'element-plus'
import NavDisplay from '@/components/rosBridge/NavDisplay.vue'
import { MapInfo } from '@/utils/models'

// 引入图标
import {
  VideoPlay as PlayIcon,
  VideoPause as PauseIcon,
  User as RobotExcitedIcon,
  Remove as RobotDeadIcon
} from '@element-plus/icons-vue'

interface propInfo {
  path: { x: number; y: number; yaw: number; name: string; id: number }[]
  loop: number
  mapInfo: MapInfo
  name: string
}

const props = withDefaults(defineProps<propInfo>(), {
  path: () => [],
  loop: 1
})

const kinect = kinectStore()
const ws = wsStore()
const $emit = defineEmits(['backToStep2'])

let listen = ref(false)

const idList = computed(() => props.path.map((ele) => ele.id))

function handleInput() {
  if (ws.ws === null) {
    ElMessage({
      message: '未连接上机器人',
      type: 'error',
      duration: 1000,
      showClose: true
    })
  } else {
    listen.value = !listen.value
    kinect.setKinect(listen.value)
    if (listen.value) {
      console.log(props.mapInfo)
      navPatrolReq('post', { loop: props.loop, path: idList.value, map: props.mapInfo.id, name: props.name })
        .then((res) => {
          if (res.code === 200) {
            ElMessage({
              message: '巡检模式已启动',
              type: 'success',
              duration: 1000,
              showClose: true
            })
          } else {
            ElMessage({
              message: res.msg || '巡检模式启动失败',
              type: 'error',
              duration: 1000,
              showClose: true
            })
            listen.value = false
          }
        })
        .catch((err) => {
          console.error(err)
          ElMessage({
            message: '巡检模式启动失败',
            type: 'error',
            duration: 1000,
            showClose: true
          })
          listen.value = false
        })
    } else {
      navStopReq('get', {})
    }
  }
}

function back() {
  $emit('backToStep2')
}

function beforeUnload() {
  kinect.setKinect(false)
  if (listen.value) {
    navStopReq('get', {})
  }
}

onMounted(() => {
  const tmpFunc = window.onbeforeunload
  window.onbeforeunload = () => {
    beforeUnload()
  }
})

onUnmounted(() => {
  beforeUnload()
})
</script>

<style scoped>
.control-card {
  padding: 20px;
  text-align: center;
}
</style>
