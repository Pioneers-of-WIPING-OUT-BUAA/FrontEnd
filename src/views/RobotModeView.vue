<template>
  <el-card shadow="never" class="stepper-card">
    <!-- <el-steps :active="step" finish-status="success" align-center>
      <el-step title="地图选择" icon="el-icon-map-location" />
      <el-step title="控制选择" icon="el-icon-setting" />
    </el-steps> -->

    <div v-if="step === 1" class="step-content">
      <map-select :map-info="mapInfo" @update="update" />

      <div class="step-footer">
        <el-button type="primary" @click="goToStep2" :disabled="!mapInfo.id"> Continue </el-button>
      </div>
    </div>

    <div v-if="step === 2" class="step-content">
      <control-select @back="backToStep1" :map-info="mapInfo" />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { MapInfo } from '@/utils/models'
import ControlSelect from '@/components/Navigation/ControlSelect.vue'
import MapSelect from '@/components/Map/MapSelect.vue'
import { kinectStore } from '@/stores/kinectStore'

const step = ref(1)
const mapInfo = ref<MapInfo>({ name: '' })

function update(info: MapInfo) {
  mapInfo.value = info
}

const kinect = kinectStore()

// 仅切换到第二步，不初始化导航
function goToStep2() {
  step.value = 2
}

function backToStep1() {
  step.value = 1
  kinect.setKinect(false)
}

onUnmounted(() => {
  kinect.setKinect(false)
})
</script>

<style scoped>
.stepper-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.stepper-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
}

.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.step-footer {
  margin-top: 16px;
  text-align: right;
}
</style>
