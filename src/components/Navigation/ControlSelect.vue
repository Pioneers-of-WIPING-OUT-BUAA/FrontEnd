<template>
  <div class="container">
    <!-- 上方水平导航 -->
    <el-menu
      class="top-menu"
      :default-active="tab"
      @select="handleTabSelect"
      mode="horizontal"
    >
      <el-menu-item index="usercontrol" :disabled="switching">
        <!-- <el-icon><i class="mdi mdi-controller" /></el-icon> -->
        <span>用户控制</span>
      </el-menu-item>
      <el-menu-item index="navigation" :disabled="switching">
        <!-- <el-icon><i class="mdi mdi-robot-industrial-outline" /></el-icon> -->
        <span>巡检模式</span>
      </el-menu-item>
    </el-menu>

    <!-- 内容面板 -->
    <div class="content-panel">
      <div v-if="tab === 'navigation' && navigationInitialized" class="tab-panel">
        <NavigationView ref="navigationViewRef" @back="emits('back')" :map-info="mapInfo" />
      </div>
      <div v-if="tab === 'usercontrol' && userControlInitialized" class="tab-panel">
        <UserControl @back="emits('back')" :map-info="mapInfo" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import UserControl from '@/views/UserControl.vue'
import NavigationView from '@/components/Navigation/NavigationView.vue'
import type { MapInfo } from '@/utils/models'
import { navStartReq, navEndReq } from '@/api/nav'
import { ctrlKeyboardReq } from '@/api/userCtrl'

const props = defineProps<{ mapInfo: MapInfo }>()
const tab = ref('usercontrol')
const navigationInitialized = ref(false)
const userControlInitialized = ref(true)
const switching = ref(false)
const emits = defineEmits(['back'])
let disposed = false

async function handleTabSelect(index: string) {
  if (switching.value || index === tab.value) return
  switching.value = true
  try {
    if (index === 'navigation') {
      await ctrlKeyboardReq('post', { direction: 'r', speed: 0 })
      await navStartReq('get', props.mapInfo.id as number)
      if (disposed) { await navEndReq('get', {}); return }
      navigationInitialized.value = true
    } else {
      await navEndReq('get', {})
    }
    tab.value = index
  } catch {
    // Keep the previously confirmed mode when the transition fails.
  } finally {
    switching.value = false
  }
}
onUnmounted(() => {
  disposed = true
  if (tab.value === 'navigation') navEndReq('get', {}).catch(() => {})
})
</script>

<style scoped>
.container {
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.top-menu {
  border-bottom: 1px solid #e5e5e5;
}

.top-menu :deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
  padding: 0 24px;
}

.top-menu :deep(.el-menu-item.is-active) {
  border-bottom: 2px solid #409EFF;
}

.content-panel {
  width: 100%;
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.tab-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
