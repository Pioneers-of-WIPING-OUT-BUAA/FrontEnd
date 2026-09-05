<template>
  <div class="map-control-container">
    <!-- 上方：控制面板 -->
    <el-card class="keypad-card">
      <div class="title">键盘控制</div>
      <div class="key-container">
        <template v-for="row in keyCtrls" :key="row.keys[0].value">
          <el-button
            v-for="key in row.keys"
            :key="key.label"
            class="key-btn"
            :type="key.type"
            :disabled="!launchState"
            @click="handleInput(key.value)"
          >
            {{ key.label }}
          </el-button>
        </template>
      </div>
    </el-card>

    <!-- 下方：地图与操作区 -->
    <div class="map-area">
      <div class="button-area">
        <el-button v-if="!launchState" type="primary" size="large" :loading="isLoading" @click="launch">
          开始工作
        </el-button>
        <el-button v-else type="primary" size="large" :loading="isLoading" @click="cancel"> 取消进度 </el-button>
        <el-button
          v-if="launchState && hasSave"
          type="primary"
          size="large"
          :loading="isLoading"
          @click="dialogVisible = true"
        >
          保存结果
        </el-button>
      </div>
      <div v-if="launchState">
        <slot name="map_display" />
      </div>
    </div>
  </div>

  <!-- 地图保存弹窗 -->
  <el-dialog v-model="dialogVisible" title="保存地图" width="400px">
    <el-input v-model="mapName" placeholder="请输入地图名称" />
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="isLoading" @click="save">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineProps, defineEmits, withDefaults } from 'vue'
import { ElMessage } from 'element-plus'
import { mapMoveReq } from '@/api/mapping'
import { wsStore } from '@/stores/wsStore'
import { kinectStore } from '@/stores/kinectStore'

interface autoProps {
  hasSave: boolean
  isLoading?: boolean
  active?: boolean
}
const props = withDefaults(defineProps<autoProps>(), {
  hasSave: true,
  isLoading: false,
  active: false
})
const emit = defineEmits(['launch', 'cancel', 'save'])

const launchState = computed(() => props.active)
const dialogVisible = ref(false)
const mapName = ref('')
const kinect = kinectStore()

const keyCtrls = [
  {
    keys: [
      { label: '左转', value: 'q', type: 'success' },
      { label: '前进', value: 'w', type: 'primary' },
      { label: '右转', value: 'e', type: 'success' }
    ]
  },
  {
    keys: [
      { label: '向左', value: 'a', type: 'primary' },
      { label: '后退', value: 's', type: 'primary' },
      { label: '向右', value: 'd', type: 'primary' }
    ]
  },
  {
    keys: [{ label: '停止', value: 'r', type: 'warning' }]
  }
]

const directionSpeed = ref({
  r: 0,
  w: 0,
  a: 0,
  s: 0,
  d: 0,
  q: 0,
  e: 0
})
const stepSpeed = 0.1
const maxSpeed = 0.3

async function handleInput(value: keyof typeof directionSpeed.value) {
  const prev = directionSpeed.value[value]
  directionSpeed.value = { r: 0, w: 0, a: 0, s: 0, d: 0, q: 0, e: 0 }
  const next = Math.min(prev + stepSpeed, maxSpeed)
  directionSpeed.value[value] = next

  await mapMoveReq('post', {
    direction: value,
    speed: value === 'r' ? 0 : next
  })
}

function launch() {
  const ws = wsStore()
  if (!ws.ws) {
    ElMessage.error('未连接上机器人')
    return
  }
  emit('launch')
}

function cancel() {
  emit('cancel')
  dialogVisible.value = false
}

function save() {
  emit('save', mapName.value)
  mapName.value = ''
  dialogVisible.value = false
}

function beforeUnload() {
  kinect.setKinect(false)
  if (launchState.value) cancel()
}

onMounted(() => {
  window.addEventListener('pagehide', beforeUnload)
})
onUnmounted(() => {
  window.removeEventListener('pagehide', beforeUnload)
  beforeUnload()
})
</script>

<style scoped>
.map-control-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.keypad-card {
  text-align: center;
}

.key-container {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  max-width: 420px;
  margin-left: auto;
  margin-right: auto;
  gap: 10px;
  margin-top: 15px;
}

.title {
  margin-bottom: 15px;
  font-weight: bold;
}

.map-area {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
}

.button-area {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.key-btn {
  min-width: 0;
  margin: 0;
}
.key-btn:last-child { grid-column: 2; }
.button-area :deep(.el-button + .el-button) { margin-left: 0; }
</style>
