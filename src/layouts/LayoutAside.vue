<template>
  <el-menu :default-active="$route.path" class="el-menu-vertical" router>
    <el-menu-item v-for="item in sidebarItems" :key="item.path" :index="item.path">
      <el-icon><i :class="item.icon" /></el-icon>
      {{ item.label }}
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUiStore } from '@/stores/uiStore'

// 引用顶部选中状态
const ui = useUiStore()

// 根据当前 topTab 返回对应的侧边栏菜单
const sidebarItems = computed(() => {
  switch (ui.currentTopTab) {
    case 'map':
      return [
        {
          label: '建图',
          path: '/mapping',
          icon: 'mdi mdi-map-legend'
        },
        {
          label: '航点标注',
          path: '/mapping-mark',
          icon: 'mdi mdi-map-marker-check-outline'
        }
      ]
    case 'set':
      return [
        {
          label: '人员管理',
          path: '/staff',
          icon: 'mdi mdi-account-group'
        },
        {
          label: '险情日志',
          path: '/log',
          icon: 'mdi mdi-alert-octagon-outline'
        }
      ]
    default:
      return []
  }
})
</script>

<style scoped>
.el-menu-vertical {
  height: 100%;
  border-right: none;
}
</style>
