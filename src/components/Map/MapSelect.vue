<template>
  <div class="map-select-container">
    <!-- 地图选择 -->
    <div class="select-panel">
      <el-select
        v-model="tmpInfo"
        :placeholder="infos.length === 0 ? '还没有地图,去建立一个吧' : '选择地图'"
        value-key="id"
        :disabled="infos.length === 0"
        @change="update"
        style="width: 200px"
      >
        <el-option v-for="item in infos" :key="item.id" :label="item.name" :value="item" />
      </el-select>
    </div>

    <!-- 地图预览 -->
    <div class="image-panel">
      <el-image v-if="tmpInfo && tmpInfo.url" :src="tmpInfo.url" fit="contain" style="width: 300px; height: 200px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, withDefaults, ref, onMounted, watch } from 'vue'
import type { MapInfo } from '@/utils/models'
import { mapListReq } from '@/api/waypoint'

interface autoProps {
  mapInfo: MapInfo
}

const props = withDefaults(defineProps<autoProps>(), {
  mapInfo: () => ({})
})

const emit = defineEmits<{
  (e: 'update', value: MapInfo): void
}>()

const infos = ref<MapInfo[]>([])
const tmpInfo = ref<MapInfo>(props.mapInfo)

function update(info: MapInfo) {
  emit('update', info)
}

// 监听tmpInfo变化，确保props变化时也能更新
watch(
  () => props.mapInfo,
  (newVal) => {
    if (newVal && newVal.id) {
      tmpInfo.value = newVal
    }
  },
  { deep: true }
)

onMounted(async () => {
  try {
    const response = await mapListReq('get', {})
    if (response && response.data && response.data.maps) {
      infos.value = response.data.maps

      // 如果有地图列表且当前未选择任何地图，自动选择第一个并更新
      if (infos.value.length > 0 && (!tmpInfo.value || !tmpInfo.value.id)) {
        tmpInfo.value = infos.value[0]
        update(infos.value[0])
      }
    } else {
      // 测试数据
      infos.value = [
        { id: 1, name: '55', url: 'map.png', x: 0, y: 0 },
        { id: 2, name: '33', url: 'map.png', x: 0, y: 0 }
      ]

      // 测试环境也自动选择第一个
      if (infos.value.length > 0 && (!tmpInfo.value || !tmpInfo.value.id)) {
        tmpInfo.value = infos.value[0]
        update(infos.value[0])
      }
    }
  } catch (error) {
    console.error('获取地图列表失败:', error)
  }
})
</script>

<style scoped>
.map-select-container {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: auto; /* 或者干脆删掉 min-width */
}
</style>
