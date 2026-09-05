<template>
  <el-card class="mapping-card">
    <el-container>
      <el-main>
        <MapCtrl :has-save="true" :active="active" :is-loading="isLoading" @save="save" @cancel="cancel" @launch="launch">
          <template v-slot:map_display>
            <div class="map-camera-panel">
              <div class="map-panel">
              <MapDisplay />
              </div>
              <div class="camera-panel">
                <KinectDisplay />
              </div>
            </div>
          </template>
        </MapCtrl>
      </el-main>
    </el-container>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { mapSaveReq, mapStopReq, mapStartReq } from '@/api/mapping'
import { ElMessage } from 'element-plus'
import MapDisplay from '@/components/rosBridge/MapDisplay.vue'
import MapCtrl from '@/components/Map/MapCtrl.vue'
import KinectDisplay from '@/components/rosBridge/KinectDisplay.vue'
import { kinectStore } from '@/stores/kinectStore'

const isLoading = ref(false)
const active = ref(false)
const kinect = kinectStore()

async function save(name: string) {
  try {
    isLoading.value = true
    let response = await mapSaveReq('post', { name: name })
    if (response) {
      ElMessage.success('地图保存成功')
      await cancel()
    }
  } catch (error) {
    ElMessage.error('保存地图失败，请重试')
    console.error('保存地图失败:', error)
  } finally {
    isLoading.value = false
  }
}

async function launch() {
  try {
    isLoading.value = true
    const response = await mapStartReq('get', {})
    if (response && response.status === 200) {
      active.value = true
      kinect.setKinect(true)
      ElMessage.success('建图模式已启动')
    }
  } catch (error) {
    ElMessage.error('启动建图模式失败，请重试')
    console.error('启动建图模式失败:', error)
  } finally {
    isLoading.value = false
  }
}

async function cancel() {
  try {
    isLoading.value = true
    await mapStopReq('get', {})
    active.value = false
    kinect.setKinect(false)
    ElMessage.info('已退出建图模式')
  } catch (error) {
    ElMessage.error('取消建图失败，请重试')
    console.error('取消建图失败:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.mapping-card {
  padding: 0px;
}
.map-camera-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  gap: 24px;
}
.camera-panel {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sidebar {
  border-right: 1px solid #ebeef5;
}
.map-panel { min-width: 0; }
@media (max-width: 720px) {
  .map-camera-panel { grid-template-columns: minmax(0, 1fr); gap: 12px; }
  .mapping-card :deep(.el-main) { padding: 4px; }
  .mapping-card :deep(.el-card__body) { padding: 10px; }
}
</style>
