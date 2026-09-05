<template>
  <el-card shadow="never" style="height: 100%">
    <div style="display: flex; flex-direction: column; height: 100%; overflow: hidden">
      <div class="control-tabs">
        <div class="tab-item" :class="{ active: slide === 'keyboard' }" @click="slide = 'keyboard'">键盘控制</div>
        <div class="tab-item" :class="{ active: slide === 'voice' }" @click="slide = 'voice'">语音控制</div>
      </div>
      <div>
        <div v-if="slide === 'voice'" style="height: 100%">
          <VoiceControl :tip-brief="tipBrief" @voice-end="handleVoiceEnd" />
        </div>
        <div v-if="slide === 'keyboard'" style="height: 100%">
          <KeyboardControl :enabled="controlActionsRef?.launchState || false" ref="keyboardControlRef" />
        </div>
      </div>
      <el-divider />

      <ControlActions
        ref="controlActionsRef"
        :show-mark-button="false"
        @launch="handleLaunch"
        @cancel="handleCancel"
        style="flex: 1; overflow-y: auto"
      >
        <template #map_display>
          <slot name="map_display"></slot>
        </template>
      </ControlActions>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onUnmounted, onMounted } from 'vue'
import VoiceControl from './VoiceControl.vue'
import KeyboardControl from './KeyboardControl.vue'
import ControlActions from './ControlActions.vue'
import { kinectStore } from '@/stores/kinectStore'

interface autoProps {
  hasSave: boolean
  tipBrief: boolean
}

const props = withDefaults(defineProps<autoProps>(), {
  hasSave: true,
  tipBrief: true
})

const emit = defineEmits(['launch', 'cancel', 'save', 'prev'])

// 当前选中的控制面板
const slide = ref('keyboard')

// 组件引用
const controlActionsRef = ref<InstanceType<typeof ControlActions> | null>(null)
const keyboardControlRef = ref<InstanceType<typeof KeyboardControl> | null>(null)

// 处理语音结束
function handleVoiceEnd() {
  // 可以在这里添加额外的逻辑
}

// 处理启动
function handleLaunch() {
  emit('launch')
}

// 处理取消
function handleCancel() {
  if (keyboardControlRef.value) {
    keyboardControlRef.value.resetDirectionSpeed()
  }
  emit('cancel')
}

// 退出前的清理工作
function beforeUnload() {
  const kinect = kinectStore()
  kinect.setKinect(false)
  if (controlActionsRef.value?.launchState) {
    handleCancel()
  }
}

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('pagehide', beforeUnload)
  beforeUnload()
})

// 组件挂载时设置页面退出事件
onMounted(() => {
  window.addEventListener('pagehide', beforeUnload)
})
</script>

<style scoped>
.my-md {
  margin-top: 20px;
  margin-bottom: 20px;
}

.ml-sm {
  margin-left: 12px;
}

.pl-sm {
  padding-left: 12px;
}

.control-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.tab-item {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin: 0 10px;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.tab-item:hover {
  color: #409eff;
}

.tab-item.active {
  color: #409eff;
  border-bottom: 3px solid #409eff;
  font-weight: bold;
}
</style>
