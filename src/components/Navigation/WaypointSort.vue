<template>
  <div class="layout-container">
    <div class="vertical-container">
      <el-card shadow="hover" class="table-card">
        <template #header>
          <div class="table-title">
            <span>航点信息</span>
            <el-tooltip content="拖拽可以更改航点顺序">
              <el-button circle>
                <i class="mdi mdi-alert-circle-outline" style="font-size: 25px" />
              </el-button>
            </el-tooltip>
          </div>
        </template>

        <el-table
          v-if="pointInfo.length !== 0"
          :data="pointInfo"
          border
          size="small"
          row-key="id"
          :row-class-name="getRowClass"
          ref="tableRef"
        >
          <el-table-column label="序号" type="index" width="60" align="center" />
          <el-table-column label="名称" prop="name" align="center" />
        </el-table>

        <div v-else class="no-data-tip">
          <el-icon><DocumentRemove /></el-icon> 还没有航点信息, 点击地图进行设置
        </div>
      </el-card>
    </div>

    <el-divider direction="vertical" class="custom-divider" />

    <el-card shadow="hover" class="map-card">
      <template #header>
        <div class="table-title">地图预览</div>
      </template>

      <waypoint-dis
        :url="props.mapInfo.url"
        :point-info="pointInfo"
        :editable="false"
        :prop-x="mapInfo.x"
        :prop-y="mapInfo.y"
        :resolution="mapInfo.resolution"
      ></waypoint-dis>
    </el-card>
  </div>
  <div class="button-group">
    <el-button
      type="primary"
      @click="emit('next', { path: pointInfo, loop: loop, name: patrolName })"
      :disabled="pointInfo.length === 0"
      round
    >
      Continue
    </el-button>
    <el-button plain type="primary" @click="emit('prev')" round> Back </el-button>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, withDefaults, ref, onMounted, nextTick } from 'vue'
import Sortable from 'sortablejs'
import { MapInfo } from '@/utils/models'
import WaypointDis from '@/components/Map/WaypointDis.vue'
import { pointListReq } from '@/api/waypoint'

interface autoProps {
  mapInfo: MapInfo
  editable: boolean
}

const emit = defineEmits(['next', 'prev'])

const props = withDefaults(defineProps<autoProps>(), {
  mapInfo: {},
  editable: false
})

// const columns = [
//   { label: '航点名字', value: 'name' },
//   { label: '航点 x 坐标', value: 'x' },
//   { label: '航点 y 坐标', value: 'y' },
//   { label: '航点 z 轴旋转弧度', value: 'theta' }
// ]

const pointInfo = ref<{ x: number; y: number; theta: number; name: string; id: number }[]>([])
const loop = ref(0)
const patrolName = ref('自动巡检')
const tableRef = ref()
const isInitialized = ref(false)

onMounted(() => {
  document.body.ondrop = function (event) {
    event.preventDefault()
    event.stopPropagation()
  }

  // 不再自动调用 initData
})

// 创建一个新的初始化方法，供父组件调用
const initData = async () => {
  if (isInitialized.value) return

  const response = await pointListReq('get', <number>props.mapInfo.id)
  if (response) {
    pointInfo.value = response.data.points
  } else {
    pointInfo.value = [
      { x: -1.03001, y: -0.031616, theta: 0, name: '1', id: 1 },
      { name: '2', x: -1.00467, y: 1.97643, theta: Math.PI / 2, id: 2 }
    ]
  }

  await nextTick()
  initSortable()
  isInitialized.value = true
}

const initSortable = () => {
  const tbody = tableRef.value?.$el.querySelector('.el-table__body-wrapper tbody')
  if (!tbody) return

  Sortable.create(tbody, {
    animation: 150,
    handle: 'tr',
    onEnd(evt) {
      const movedItem = pointInfo.value.splice(evt.oldIndex, 1)[0]
      pointInfo.value.splice(evt.newIndex, 0, movedItem)
    }
  })
}

const getRowClass = ({ rowIndex }: { rowIndex: number }) => {
  return rowIndex % 2 === 0 ? 'even-row' : 'odd-row'
}

// 在组件挂载后自动执行初始化，确保兼容性
onMounted(() => {
  // 延迟一点执行，确保DOM已准备好
  setTimeout(() => {
    initData()
  }, 0)
})

// 暴露方法给父组件
defineExpose({
  initData
})
</script>

<style scoped>
.layout-container {
  display: flex;
  gap: 6px;
  align-items: flex-start;
}

.table-card {
  flex: 1;
  max-width: 450px;
}
.map-card {
  padding: 0;
  min-width: 600px;
  min-height: auto;
  height: auto;
  display: flex;
  flex-direction: column;
}

.map-card .el-card__body {
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.table-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.no-data-tip {
  margin-top: 16px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 6px;
}

.custom-divider {
  height: auto;
  min-height: 300px;
  background-color: #ddd;
  margin: 0 8px;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.even-row {
  background-color: #f9f9f9;
}

.odd-row {
  background-color: #ffffff;
}
</style>
