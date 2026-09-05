<template>
  <div class="waypoint-container">
    <!-- 航点表格 -->
    <div class="table-panel">
      <el-card>
        <template #header>
          <div class="table-title">
            <span>航点列表</span>
            <el-tooltip content="点击地图设置坐标, 鼠标拖拽方向为机器人朝向">
              <el-button circle>
                <i class="mdi mdi-alert-circle-outline" style="font-size: 25px" />
              </el-button>
            </el-tooltip>
          </div>
        </template>

        <el-table :data="pointInfo" border stripe style="width: 100%">
          <el-table-column label="操作" width="100" align="center">
            <template #default="scope">
              <el-button size="small" type="danger" @click="deleteInfo(scope.row)">删除</el-button>
            </template>
          </el-table-column>

          <el-table-column label="航点名称" align="center">
            <template #default="scope">
              <el-input
                v-if="editable"
                :model-value="scope.row.name"
                size="small"
                @change="(val) => changeName(val, scope.row.id)"
              />
              <span v-else>{{ scope.row.name }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="x" label="x 坐标" align="center" />
          <el-table-column prop="y" label="y 坐标" align="center" />
          <el-table-column prop="theta" label="z 轴旋转" align="center" />
        </el-table>

        <div v-if="pointInfo.length === 0" class="no-data-tip">
          <el-icon><DocumentRemove /></el-icon> 还没有航点信息, 点击地图进行设置
        </div>
      </el-card>
    </div>

    <!-- 地图显示组件 -->
    <div class="map-panel">
      <WaypointDis
        v-if="props.mapInfo.url"
        :url="props.mapInfo.url"
        :pointInfo="pointInfo"
        @update="insertPoint"
        :editable="editable"
        :prop-x="props.mapInfo.x"
        :prop-y="props.mapInfo.y"
        :resolution="props.mapInfo.resolution"
        :key="disKey"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, withDefaults, onMounted, watch } from 'vue'
import { MapInfo } from '@/utils/models'
import WaypointDis from '@/components/Map/WaypointDis.vue'
import { pointListReq, markPointReq, deletePointReq, renamePointReq } from '@/api/waypoint'
import { ElNotification } from 'element-plus'
import { DocumentRemove } from '@element-plus/icons-vue'

interface autoProps {
  mapInfo: MapInfo
  editable: boolean
}

const props = withDefaults(defineProps<autoProps>(), {
  mapInfo: () => ({}),
  editable: true
})

const pointInfo = ref<{ x: number; y: number; theta: number; name: string; id: number }[]>([])
const disKey = ref(1)

async function insertPoint(info: { x: number; y: number; theta: number; id: number }) {
  let name = 0
  pointInfo.value.forEach((p) => {
    if (!isNaN(+p.name) && Number(p.name) >= name) {
      name = Number(p.name) + 1
    }
  })

  const newPoint = { ...info, name: String(name) }

  if (props.mapInfo && props.mapInfo.id) {
    await markPointReq('post', props.mapInfo.id, newPoint)
    await init()
  } else {
    ElNotification.error('未选择有效地图，无法保存航点')
  }
}

async function deleteInfo(info: { id: number }) {
  await deletePointReq('delete', info.id)
  await init()
}

async function changeName(newName: string, id: number) {
  if (pointInfo.value.some((p) => p.name === newName && p.id !== id)) {
    ElNotification.error(`${newName} 已存在，修改失败`)
    return
  }
  const target = pointInfo.value.find((p) => p.id === id)
  if (target) {
    await renamePointReq('post', { id: target.id, name: newName })
    target.name = newName
    disKey.value ^= 1 // 强制刷新地图标注组件
  }
}

async function init() {
  // 检查mapInfo.id是否有效
  if (!props.mapInfo || !props.mapInfo.id) {
    ElNotification.warning('未选择有效地图，无法获取航点数据')
    pointInfo.value = [] // 清空航点
    return
  }

  try {
    const response = await pointListReq('get', props.mapInfo.id)
    if (response && response.data) {
      pointInfo.value = response.data.points
    } else {
      // 测试数据
      pointInfo.value = [
        {
          x: -1.03001,
          y: -0.031616,
          theta: 0,
          name: '1',
          id: 1
        },
        {
          x: -1.00467,
          y: 1.97643,
          theta: Math.PI / 2,
          name: '2',
          id: 2
        }
      ]
    }
  } catch (error) {
    console.error('获取航点列表失败:', error)
    ElNotification.error('获取航点列表失败')
    pointInfo.value = []
  }
}

// 监听mapInfo变化，当id改变时重新加载航点
watch(
  () => props.mapInfo.id,
  (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
      init()
    }
  }
)

onMounted(() => {
  // 仅当mapInfo.id有效时初始化
  if (props.mapInfo && props.mapInfo.id) {
    init()
  }
})
</script>

<style scoped>
.waypoint-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: flex-start;
}

.table-panel {
  min-width: 500px;
}

.map-panel {
  min-width: 600px;
  min-height: 400px;
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
</style>
