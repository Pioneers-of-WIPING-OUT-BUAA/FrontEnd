<template>
  <el-card class="step-card">
    <el-steps :active="active" finish-status="success" direction="vertical" align-center>
      <el-step title="Step 1" description="地图选择" />
      <el-step title="Step 2" description="航点操作" />
    </el-steps>

    <div v-show="step === 0" class="step-content">
      <MapSelect :map-info="mapInfo" @update="update" :key="flag" />

      <div class="step-actions">
        <el-button type="danger" :disabled="!mapInfo.id" @click="deleteMap">删除地图</el-button>
        <el-button type="primary" :disabled="!mapInfo.id" @click="nextStep">继续</el-button>
      </div>
    </div>

    <div v-show="step === 1" class="step-content">
      <WaypointEdit :map-info="mapInfo" :editable="true" />

      <div class="step-actions">
        <el-button type="primary" @click="save">保存结果</el-button>
        <el-button @click="prevStep">返回</el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MapSelect from '@/components/Map/MapSelect.vue'
import WaypointEdit from '@/components/Map/WaypointEdit.vue'
import { mapDeleteReq } from '@/api/mapping'
import type { MapInfo } from '@/utils/models'

const active = ref(0)
const step = ref(0)

// 初始化mapInfo时提供所有必要的属性
const mapInfo = ref<MapInfo>({
  name: '',
  id: undefined,
  url: '',
  x: 0,
  y: 0
})
const flag = ref(0)

function update(info: MapInfo) {
  // 确保info包含所有必要的属性
  mapInfo.value = {
    id: info.id,
    name: info.name || '',
    url: info.url || '',
    x: info.x || 0,
    y: info.y || 0
  }
}

function nextStep() {
  // 仅当有有效地图时才进入下一步
  if (mapInfo.value && mapInfo.value.id) {
    active.value++
    step.value++
  }
}

function prevStep() {
  active.value--
  step.value--
}

async function deleteMap() {
  if (mapInfo.value && mapInfo.value.id) {
    try {
      await mapDeleteReq('delete', mapInfo.value.id)
      // 重置为完整的空对象
      mapInfo.value = {
        name: '',
        id: undefined,
        url: '',
        x: 0,
        y: 0
      }
      flag.value ^= 1 // 重置 MapSelect
    } catch (error) {
      console.error('删除地图失败:', error)
    }
  }
}

function save() {
  // console.log('保存地图与航点', mapInfo.value)
  prevStep()
}
</script>

<style scoped>
.step-card {
  padding: 0px;
}

.step-content {
  margin-top: 30px;
}

.step-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>
