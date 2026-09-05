<template><span hidden></span></template>

<script lang="ts" setup>
import { ElNotification } from 'element-plus'
import { logLatestReq } from '@/api/log'
import { watch } from 'vue'
import { logStore } from '@/stores/logStore'

const log = logStore()
let previousId: number | null = null
watch(() => log.show, (show, _, onCleanup) => {
  if (!show) return
  let active = true
  let timer: ReturnType<typeof setTimeout>
  async function update() {
    try {
      const item = (await logLatestReq('get')).data.log
      if (!active) return
      if (item && previousId !== null && item.id !== previousId) {
        ElNotification({ title: '新的日志', message: item.detail, type: 'info', duration: 8000, offset: 60 })
      }
      if (item) previousId = item.id
    } catch {
      // Retry on the next poll after the request layer reports the error.
    } finally {
      if (active) timer = setTimeout(update, 10000)
    }
  }
  timer = setTimeout(update, 10000)
  onCleanup(() => { active = false; clearTimeout(timer) })
}, { immediate: true })
</script>
