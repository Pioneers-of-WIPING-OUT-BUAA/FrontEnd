<template>
  <el-card class="mapping-card">
    <el-container>
      <el-main>
        <MapCtrl :has-save="true" :is-loading="isLoading" @save="save" @cancel="cancel" @launch="launch">
          <template v-slot:map_display>
            <div class="map-camera-panel">
              <div style="width: 50%; height: 100%">
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

const isLoading = ref(false)

async function save(name: string) {
  try {
    isLoading.value = true
    let response = await mapSaveReq('post', { name: name })
    if (response) {
      ElMessage.success('地图保存成功')
      setTimeout(() => {
        cancel()
      }, 8000)
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
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  height: 600px;
  gap: 24px;
}
.camera-panel {
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sidebar {
  border-right: 1px solid #ebeef5;
}
</style>
