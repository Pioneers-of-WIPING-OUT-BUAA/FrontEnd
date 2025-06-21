<template>
  <div class="control-actions">
    <div v-if="launchState" style="margin-left: 4%">
      <slot name="map_display"></slot>
    </div>
    <div :class="(launchState ? '' : 'latitude-center') + ' mt-md'">
      <el-button size="large" class="longitude-center" type="primary" @click="handleLaunch" v-if="!launchState">
        开始工作
      </el-button>
      <el-button v-if="launchState" size="large" type="primary" @click="handleCancel">取消进度</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
// import { navCurReq } from '@/api/nav'
import { wsStore } from '@/stores/wsStore'
import { kinectStore } from '@/stores/kinectStore'

const props = defineProps<{
  showMarkButton?: boolean
}>()

const emit = defineEmits(['launch', 'cancel'])

// 初始状态
const launchState = ref(false)
const curName = ref('')

// 开始工作
function handleLaunch() {
  const ws = wsStore()
  if (ws.ws === null) {
    ElMessage({
      message: '未连接上机器人',
      type: 'error',
      duration: 1000
    })
  } else {
    emit('launch')
    launchState.value = true
    const kinect = kinectStore()
    kinect.setKinect(true)
  }
}

// 取消进度
function handleCancel() {
  emit('cancel')
  launchState.value = false
  const kinect = kinectStore()
  kinect.setKinect(false)
}

// 标记当前位置
async function markCur() {
  // let response = await navCurReq('post', { name: curName.value })
  let response = null
  if (response) {
    curName.value = ''
    markCurDialog.value = false
  }
}

// 暴露状态和方法给父组件
defineExpose({
  launchState
})
</script>

<style scoped>
.control-actions {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.latitude-center {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}

.longitude-center {
  display: block;
  margin: 0 auto;
}

.dialog-card {
  padding: 20px;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 300px;
}

.mt-md {
  margin-top: 20px;
}
</style>
