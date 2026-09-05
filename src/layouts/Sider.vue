<template>
  <el-menu :default-active="$route.path" class="el-menu-vertical" router :unique-opened="false" :collapse="collapsed">
    <el-sub-menu index="map">
      <template #title>
        <el-icon><i class="mdi mdi-map-outline" /></el-icon>
        <span>地图管理</span>
      </template>
      <el-menu-item index="/mapping">
        <el-icon><i class="mdi mdi-map" /></el-icon>
        <span>建图模式</span>
      </el-menu-item>
      <el-menu-item index="/mapping-mark">
        <el-icon><i class="mdi mdi-map-marker" /></el-icon>
        <span>航点标注</span>
      </el-menu-item>
    </el-sub-menu>

    <el-menu-item index="/robotmode">
      <el-icon><i class="mdi mdi-robot-outline" /></el-icon>
      <span>模式控制</span>
    </el-menu-item>

    <el-sub-menu index="security">
      <template #title>
        <el-icon><i class="mdi mdi-security" /></el-icon>
        <span>安全管理</span>
      </template>
      <el-menu-item index="/staff">
        <el-icon><i class="mdi mdi-account-group" /></el-icon>
        <span>人员管理</span>
      </el-menu-item>
      <el-menu-item index="/log">
        <el-icon><i class="mdi mdi-alert-octagon-outline" /></el-icon>
        <span>险情日志</span>
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, onUnmounted } from 'vue'

const route = useRoute()
const media = window.matchMedia('(max-width: 720px)')
const collapsed = ref(media.matches)
const update = () => { collapsed.value = media.matches }
media.addEventListener('change', update)
onUnmounted(() => media.removeEventListener('change', update))
</script>

<style scoped>
.el-menu-vertical {
  height: 100%;
  border-right: none;
}
</style>
