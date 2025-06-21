<script lang="ts" setup>
import { ElNotification } from 'element-plus'
import { logLatestReq } from '@/api/log'
import { onMounted, watch } from 'vue'
import { logStore } from '@/stores/logStore'

let prev: null | object = null
const T = 10
const log = logStore()
let logInterval: NodeJS.Timeout | null = null

async function updateLog() {
  let response = await logLatestReq('get')
  if (response) {
    if (!prev) {
      prev = response.data.log
    } else if (response.data.log.id !== prev.id) {
      ElNotification({
        title: '新的日志',
        message: response.data.log.detail,
        type: 'primary',
        position: 'top-right',
        duration: T * 800, // Element Plus 的 duration 单位是毫秒
        offset: 60 // 距离顶部的偏移量（可选）
      })
      prev = response.data.log
    }
  }
}

watch(
  () => log.show,
  (to, from) => {
    if (to) {
      logInterval = setInterval(updateLog, T * 1000)
    } else {
      clearInterval(<NodeJS.Timeout>logInterval)
    }
  }
)

function init() {
  logInterval = setInterval(updateLog, T * 1000)
}

onMounted(() => {
  if (log.show) {
    init()
  }
})
</script>
