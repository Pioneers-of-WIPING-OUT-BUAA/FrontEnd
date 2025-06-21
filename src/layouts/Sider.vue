<template>
  <el-menu :default-active="$route.path" class="el-menu-vertical" router :unique-opened="false" :collapse="false">
    <el-sub-menu index="map">
      <template #title>
        <el-icon><i class="mdi mdi-map-outline" /></el-icon>
        <span>地图管理</span>
      </template>
      <el-menu-item index="/mapping">
        <el-icon><i class="mdi mdi-map" /></el-icon>
        建图模式
      </el-menu-item>
      <el-menu-item index="/mapping-mark">
        <el-icon><i class="mdi mdi-map-marker" /></el-icon>
        航点标注
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
        人员管理
      </el-menu-item>
      <el-menu-item index="/log">
        <el-icon><i class="mdi mdi-alert-octagon-outline" /></el-icon>
        险情日志
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style scoped>
.el-menu-vertical {
  height: 100%;
  border-right: none;
}
</style>
