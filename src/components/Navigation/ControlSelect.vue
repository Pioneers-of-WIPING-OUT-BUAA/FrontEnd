<template>
  <div class="container">
    <!-- 上方水平导航 -->
    <el-menu
      class="top-menu"
      :default-active="tab"
      @select="handleTabSelect"
      mode="horizontal"
    >
      <el-menu-item index="usercontrol">
        <!-- <el-icon><i class="mdi mdi-controller" /></el-icon> -->
        <span>用户控制</span>
      </el-menu-item>
      <el-menu-item index="navigation">
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
import { ref, defineEmits, defineProps, nextTick } from 'vue'
import UserControl from '@/views/UserControl.vue'
import NavigationView from '@/components/Navigation/NavigationView.vue'
import { MapInfo } from '@/components/models'

interface autoProps {
  mapInfo: MapInfo
}

const props = withDefaults(defineProps<autoProps>(), {
  mapInfo: {}
})

const tab = ref('usercontrol')
const navigationInitialized = ref(false)
const userControlInitialized = ref(false)
const navigationViewRef = ref<InstanceType<typeof NavigationView> | null>(null)
const emits = defineEmits(['back', 'nav-init'])

function handleTabSelect(index: string) {
  tab.value = index

  // 根据选中的标签页初始化对应的组件
  if (index === 'navigation' && !navigationInitialized.value) {
    // 首次选择导航模式时，触发导航初始化事件
    emits('nav-init')

    navigationInitialized.value = true

    // 等待组件渲染完成后初始化
    nextTick(() => {
      // 在下一个微任务中执行，确保组件已完全挂载
      setTimeout(() => {
        if (navigationViewRef.value) {
          navigationViewRef.value.initialize()
        }
      }, 100)
    })
  } else if (index === 'usercontrol' && !userControlInitialized.value) {
    userControlInitialized.value = true
  }
}

// 初始化默认选中的用户控制组件
userControlInitialized.value = true
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
