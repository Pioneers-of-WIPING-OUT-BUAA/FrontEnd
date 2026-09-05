<template>
  <!-- 整体容器：用于占位撑高高度 -->
  <div class="fixed-layout">
    <!-- 顶部固定导航栏 -->
    <div class="fixed-header">
      <LayoutHeader />
    </div>

    <!-- 左侧固定侧边栏 + 内容区域 -->
    <div class="fixed-body">
      <!-- <div class="fixed-aside" v-if="showSidebar">
        <LayoutAside />
      </div> -->
      <div class="fixed-aside">
        <Sider />
      </div>
      <div class="fixed-main">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LayoutHeader from './LayoutHeader.vue'
import LayoutAside from './LayoutAside.vue'
import Sider from './Sider.vue'
import { useUiStore } from '@/stores/uiStore'
import { computed } from 'vue'

const ui = useUiStore()
const showSidebar = computed(() => ui.currentTopTab == 'map' || ui.currentTopTab == 'set')
</script>

<style scoped>
.fixed-layout {
  height: 100dvh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部导航栏固定 */
.fixed-header {
  flex: none;
  z-index: 1000;
  background-color: var(--el-bg-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 主体部分（侧边栏 + 内容） */
.fixed-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* 左侧固定侧边栏 */
.fixed-aside {
  width: 200px;
  flex-shrink: 0;
  background-color: var(--el-bg-color-page);
  border-right: 1px solid var(--el-border-color);
  overflow-y: auto;
}

/* 内容区域 */
.fixed-main {
  flex: 1;
  min-width: 0;
  padding: 5px;
  overflow-y: auto;
  background-color: var(--el-bg-color-page);
}
@media (max-width: 720px) {
  .fixed-aside { width: 64px; }
}
</style>
