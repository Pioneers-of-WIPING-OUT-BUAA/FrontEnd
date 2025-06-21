<template>
  <HandControl :has-save="false" :tip-brief="false" @launch="startCtrl" @prev="backToSelect">
    <template v-slot:map_display>
      <div class="map-camera-panel">
        <div class="nav-panel">
          <nav-display :point-info="pointInfoData" />
        </div>
        <div class="camera-panel">
          <KinectDisplay />
        </div>
      </div>
    </template>
  </HandControl>

  <div style="text-align: right; margin-top: 20px">
    <el-button type="primary" plain @click="backToSelect" round>Back</el-button>
  </div>
</template>

<script setup lang="ts">
import HandControl from '@/components/Control/HandControl.vue'
import NavDisplay from '@/components/rosBridge/NavDisplay.vue'
import KinectDisplay from '@/components/rosBridge/KinectDisplay.vue'
import { ref, defineEmits } from 'vue'

let step = ref(1)
const emits = defineEmits(['back'])
// 用户控制

// 添加pointInfo数据以满足NavDisplay组件的props要求
const pointInfoData = ref<Array<{ x: number; y: number; theta: number; name: string }>>([])

function startCtrl() {
  return
}

function backToSelect() {
  emits('back')
}
</script>

<style scoped>
.map-camera-panel {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 24px;
}

.nav-panel {
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-panel {
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  overflow: hidden;
}

.py-lg {
  padding-top: 16px;
  padding-bottom: 16px;
}

.px-sm {
  padding-left: 8px;
  padding-right: 8px;
}
</style>
