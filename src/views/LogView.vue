<template>
  <el-row style="min-width: 500px">
    <!-- 左侧日志列表 -->
    <el-col :span="11">
      <el-card>
        <div
          v-for="(log, i) in partOfLog"
          :key="log.id"
          style="cursor: pointer; margin-bottom: 8px"
          @click="clickItem(log)"
        >
          <el-text tag="h4"> [{{ eventTypeMap[log.event_type] }}] {{ log.detail }} </el-text>
          <el-text type="info" size="small">{{ log.time }} | 坐标: ({{ log.x }}, {{ log.y }})</el-text>
          <el-divider v-if="i !== partOfLog.length - 1" />
        </div>

        <div style="text-align: center; margin-top: 10px">
          <el-pagination
            v-if="pageOfLog > 1"
            v-model:current-page="cur"
            :page-size="size"
            :total="logs.length"
            layout="prev, pager, next"
            background
          />
        </div>
      </el-card>
    </el-col>

    <el-col :span="1" />

    <!-- 右侧日志详情 -->
    <el-col :span="12" v-if="chosenOne">
      <el-card>
        <h4>日志详情</h4>
        <el-descriptions border column="1">
          <el-descriptions-item label="事件类型">{{ eventTypeMap[chosenOne.event_type] }}</el-descriptions-item>
          <el-descriptions-item label="日志内容">{{ chosenOne.detail }}</el-descriptions-item>
          <el-descriptions-item label="时间">{{ chosenOne.time }}</el-descriptions-item>
          <el-descriptions-item label="位置坐标">({{ chosenOne.x }}, {{ chosenOne.y }})</el-descriptions-item>
        </el-descriptions>
        <el-image :src="chosenOne.url" fit="contain" style="width: 100%; height: 450px; margin-top: 16px" />
      </el-card>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { logListReq } from '@/api/log'

const logs = ref<any[]>([])
const cur = ref(1)
const size = 7
const chosenOne = ref<any>(null)

const eventTypeMap: Record<number, string> = {
  1: '明火',
  2: '烟雾',
  3: '陌生人',
  4: '垃圾'
}

const partOfLog = computed(() => {
  return logs.value.slice((cur.value - 1) * size, cur.value * size)
})

const pageOfLog = computed(() => {
  return Math.ceil(logs.value.length / size)
})

async function init() {
  const response = await logListReq('get')
  if (response && response.data && response.data.logs) {
    logs.value = response.data.logs
  } else {
    logs.value = [
      { id: 1, event_type: 3, detail: '发现陌生人', time: '2023-10-01 12:30', x: 12.3, y: 45.6, url: 'map.png' },
      { id: 2, event_type: 2, detail: '检测到烟雾', time: '2023-10-02 14:15', x: 78.9, y: 11.2, url: 'smoke.png' }
    ]
  }
}

function clickItem(log: any) {
  chosenOne.value = log
}

onMounted(() => {
  init()
})
</script>

<style scoped>
.el-card {
  margin-bottom: 20px;
}
</style>
