<template>
  <el-card shadow="never" style="height: 100%; overflow-y: auto; display: flex; flex-direction: column">
    <div class="key-control-container">
      <div class="row">
        <el-button
          v-for="key in allKeys.slice(0, Math.ceil(allKeys.length / 2))"
          :key="key.label"
          :type="getButtonType(key.color)"
          @click="handleInput(key.value)"
          :disabled="!enabled"
          class="key-button"
          size="large"
        >
          {{ key.label }}
        </el-button>
      </div>
      <div class="row">
        <el-button
          v-for="key in allKeys.slice(Math.ceil(allKeys.length / 2))"
          :key="key.label"
          :type="getButtonType(key.color)"
          @click="handleInput(key.value)"
          :disabled="!enabled"
          class="key-button"
          size="large"
        >
          {{ key.label }}
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ctrlKeyboardReq } from '@/api/userCtrl'

const props = defineProps<{
  enabled: boolean
}>()

const allKeys = [
  { label: '左转', value: 'q', color: 'green-9' },
  { label: '前进', value: 'w', color: 'primary' },
  { label: '右转', value: 'e', color: 'green-9' },
  { label: '向左', value: 'a', color: 'primary' },
  { label: '后退', value: 's', color: 'primary' },
  { label: '向右', value: 'd', color: 'primary' },
  { label: '停止', value: 'r', color: 'yellow-10' },
  { label: '抓取', value: 'g', color: 'primary' },
  { label: '出机械臂', value: 'arm_out', color: 'success' },
  { label: '收机械臂', value: 'arm_in', color: 'success' },
  { label: '机械臂上升', value: 'arm_up', color: 'info' },
  { label: '机械臂停止', value: 'arm_stop', color: 'info' },
  { label: '机械臂下降', value: 'arm_down', color: 'info' },
  { label: '机械臂抓紧', value: 'grip', color: 'warning' },
  { label: '机械臂松开', value: 'release', color: 'warning' }
]

// 将Quasar颜色转换为Element UI按钮类型
function getButtonType(color: string) {
  switch (color) {
    case 'primary':
      return 'primary'
    case 'green-9':
      return 'success'
    case 'yellow-10':
      return 'warning'
    default:
      return 'default'
  }
}

// 方向速度状态
let directionSpeed = reactive({
  r: 0,
  w: 0,
  a: 0,
  s: 0,
  d: 0,
  q: 0,
  e: 0
})

// 默认速度
const defaultSpeed = {
  r: 0,
  w: 0,
  a: 0,
  s: 0,
  d: 0,
  q: 0,
  e: 0
}

// 速度配置
const stepSpeed = 0.1
const maxSpeed = 0.3

// 处理按键输入
async function handleInput(value: string) {
  const armCommands = ['arm_out', 'arm_in', 'arm_up', 'arm_down', 'grip', 'release', 'arm_stop']
  if (!['q', 'w', 'e', 'a', 's', 'd', 'r', 'g', ...armCommands].includes(value)) return

  const dirKey = value as keyof typeof directionSpeed

  if (armCommands.includes(value) || value === 'g') {
    ctrlKeyboardReq('post', { direction: value, speed: 0 })
    return
  }

  // 处理方向命令
  let prevSpeed = directionSpeed[dirKey]

  // 重置所有方向速度
  Object.keys(directionSpeed).forEach((key) => {
    directionSpeed[key as keyof typeof directionSpeed] = 0
  })

  // 设置当前方向速度
  if (dirKey in directionSpeed) {
    directionSpeed[dirKey] = prevSpeed + stepSpeed > maxSpeed ? maxSpeed : prevSpeed + stepSpeed
  }

  // 发送停止命令
  if (value === 'r') {
    ctrlKeyboardReq('post', { direction: value, speed: 0 })
  } else {
    // 发送方向命令
    ctrlKeyboardReq('post', { direction: value, speed: directionSpeed[dirKey] })
  }
}

// 重置所有方向速度
function resetDirectionSpeed() {
  Object.keys(directionSpeed).forEach((key) => {
    directionSpeed[key as keyof typeof directionSpeed] = 0
  })
}

// 暴露方法给父组件
defineExpose({
  resetDirectionSpeed
})
</script>

<style scoped>
.key-control-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 15px;
  padding: 0 10px;
}

.row {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 8px;
}

.key-button-4 {
  flex: 1;
  height: 50px;
  font-size: 16px;
  min-width: 80px;
  max-width: 120px;
}

.key-button-10 {
  flex: 1;
  height: 50px;
  font-size: 16px;
  min-width: 120px;
  max-width: 200px;
}
</style>
