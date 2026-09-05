<template>
  <el-row style="min-width: 500px">
    <!-- 左侧日志列表 -->
    <el-col :span="11">
      <el-card>
        <div
          v-for="(log, i) in logs"
          :key="log.id"
          style="cursor: pointer; margin-bottom: 8px"
          @click="clickItem(log)"
        >
          <el-text tag="h4"> [{{ eventTypeMap[log.event_type] }}] {{ log.detail }} </el-text>
          <el-text type="info" size="small">{{ log.time }} | 坐标: ({{ log.x }}, {{ log.y }})</el-text>
          <el-divider v-if="i !== logs.length - 1" />
        </div>

        <div style="text-align: center; margin-top: 10px">
          <el-pagination
            v-if="total > size"
            v-model:current-page="cur"
            :page-size="size"
            :total="total"
            :disabled="loading"
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
import { ref, watch } from 'vue'
import { logListReq } from '@/api/log'

const logs = ref<any[]>([])
const cur = ref(1)
const size = 7
const total = ref(0)
const loading = ref(false)
const chosenOne = ref<any>(null)
const eventTypeMap: Record<number, string> = { 1: '明火', 2: '烟雾', 3: '陌生人', 4: '垃圾' }
let generation = 0

watch(cur, async page => {
  const current = ++generation
  loading.value = true
  try {
    const response = await logListReq('get', { page, page_size: size })
    if (current !== generation) return
    logs.value = response.data.logs
    total.value = response.data.total
    chosenOne.value = null
  } catch {
    if (current === generation) logs.value = []
  } finally {
    if (current === generation) loading.value = false
  }
}, { immediate: true })

function clickItem(log: any) { chosenOne.value = log }
</script>

<style scoped>
.el-card {
  margin-bottom: 20px;
}
</style>
