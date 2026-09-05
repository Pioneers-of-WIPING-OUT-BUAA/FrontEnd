<template>
  <el-header class="header-bar">
    <!-- 左侧 LOGO -->
    <el-button link class="btn-header" @click="goToLink('welcome')">
      <!-- 插入logo.png -->
      <img src="/logo.png" alt="Logo" style="width: 40px; height: 40px" />
      扫荡北航先锋
    </el-button>

    <!-- 中部 Tabs
    <div class="tab-bar">
      <el-button
        v-for="btn in btns"
        :key="btn.name"
        class="tab-btn"
        :type="currentTopTab === btn.name ? 'primary' : 'default'"
        @click="switchTab(btn)"
      >
        <el-icon><i :class="btn.icon" /></el-icon>
        {{ btn.label }}
      </el-button>
    </div> -->

    <!-- 右侧开关 + 用户头像 -->
    <div class="right-controls">
      <el-switch
        v-model="darkMode"
        inline-prompt
        active-icon="el-icon-sunny"
        inactive-icon="el-icon-moon"
        @change="setMode"
      />
      <el-button :type="isLogging ? 'success' : 'danger'" @click="toggleLogStatus" style="font-weight: bold">
        <el-icon style="margin-right: 4px"><i class="mdi mdi-text-box-check-outline" /></el-icon>
        {{ isLogging ? '日志记录中' : '未记录日志' }}
      </el-button>
      <el-button :type="isConnected ? 'success' : 'danger'" @click="toggleRosConnection" style="font-weight: bold">
        <el-icon style="margin-right: 4px"><i :class="isConnected ? 'mdi mdi-robot' : 'mdi mdi-robot-off'" /></el-icon>
        {{ isConnected ? '已连接机器人' : '未连接机器人' }}
      </el-button>
      <el-dropdown>
        <el-button link style="display: flex; align-items: center; padding: 0 6px">
          <el-icon style="margin-right: 6px">
            <i class="mdi mdi-account-circle-outline" style="font-size: 28px" />
          </el-icon>
          <span style="font-size: medium">{{ user.username }}</span>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="showPwdDialog = true">修改密码</el-dropdown-item>
            <el-dropdown-item @click="handleLogout">退出</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
  <el-dialog v-model="showPwdDialog" title="修改密码" width="30%">
    <el-form :model="pwdForm" label-width="80px">
      <el-form-item label="原密码">
        <el-input v-model="pwdForm.old_pwd" type="password" show-password />
      </el-form-item>
      <el-form-item label="新密码">
        <el-input v-model="pwdForm.new_pwd" type="password" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showPwdDialog = false">取消</el-button>
      <el-button type="primary" @click="submitPwdUpdate">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '@/stores/uiStore'
import { wsStore } from '@/stores/wsStore'
import { userStore } from '@/stores/userStore'
import { ElNotification } from 'element-plus'
import { authUpdatePwdReq } from '@/api/user'
import { watchEffect } from 'vue'
import { rosConnectReq, rosFreeReq } from '../api/ros'
import { beginLogReq, endLogReq, getLogFlagReq } from '@/api/log'

const showPwdDialog = ref(false)
const pwdForm = ref({
  old_pwd: '',
  new_pwd: ''
})

const router = useRouter()
const ui = useUiStore()
const ws = wsStore()
const user = userStore()

const darkMode = ref(false)
// const currentTopTab = computed(() => ui.currentTopTab)

const isConnected = computed(() => ws.isConnected)
const isLogging = ref(false)
const logLoading = ref(false)

// const btns = [
//   { label: '建图模式', icon: 'mdi mdi-map-check-outline', name: 'map', route: 'mapping' },
//   { label: '机器人控制', icon: 'mdi mdi-controller-classic-outline', name: 'mode', route: 'robotmode' },
//   { label: '机器人管理', icon: 'mdi mdi-cog', name: 'set', route: 'staff' }
// ]

// function switchTab(btn: (typeof btns)[number]) {
//   ui.currentTopTab = btn.name
//   console.log('当前选中 tab：', btn.name)
//   console.log('当前选中 tab 路由：', btn.route)
//   router.push(`/${btn.route}`)
// }

function goToLink(path: string) {
  router.push(path)
}

function setMode() {
  document.documentElement.classList.toggle('dark', darkMode.value)
}

async function submitPwdUpdate() {
  try {
    const res = await authUpdatePwdReq('post', pwdForm.value)
    ElNotification({
      title: '成功',
      message: '密码修改成功，请重新登录',
      type: 'success'
    })
    showPwdDialog.value = false
  } catch (error: any) {
    ElNotification({
      title: '错误',
      message: error?.message || '密码修改失败',
      type: 'error'
    })
  }
}

const rosLoading = ref(false) // 机器人连接/断开loading状态

// 连接/断开机器人逻辑
async function toggleRosConnection() {
  if (rosLoading.value) return // 防止重复点击
  rosLoading.value = true
  try {
    if (ws.isConnected) {
      // 先断开WebSocket，再释放后端ROS
      await rosFreeReq('get')
      ws.disconnect()
      ElNotification({
        title: '成功',
        message: '已断开机器人',
        type: 'success'
      })
    } else {
      // 先请求后端连接ROS，成功后再WebSocket连接
      await rosConnectReq('get')
      await ws.connect()
      ElNotification({
        title: '成功',
        message: '已连接机器人',
        type: 'success'
      })
    }
  } catch (error: any) {
    ElNotification({
      title: '错误',
      message: error?.message || '机器人连接/断开失败',
      type: 'error'
    })
  } finally {
    rosLoading.value = false
  }
}

// 退出登录
function handleLogout() {
  user.logout()
  ElNotification({
    title: '成功',
    message: '已退出登录',
    type: 'success'
  })
}

// 初始化获取日志状态
async function initLogStatus() {
  try {
    const res = await getLogFlagReq()
    isLogging.value = res.data.log
  } catch (error: any) {
    ElNotification({
      title: '错误',
      message: error?.message || '获取日志状态失败',
      type: 'error'
    })
  }
}

// 切换日志状态
async function toggleLogStatus() {
  if (logLoading.value) return
  logLoading.value = true
  try {
    if (isLogging.value) {
      await endLogReq()
      isLogging.value = false
      ElNotification({
        title: '成功',
        message: '日志记录已停止',
        type: 'success'
      })
    } else {
      await beginLogReq()
      isLogging.value = true
      ElNotification({
        title: '成功',
        message: '日志记录已开始',
        type: 'success'
      })
    }
  } catch (error: any) {
    ElNotification({
      title: '错误',
      message: error?.message || '切换日志状态失败',
      type: 'error'
    })
  } finally {
    logLoading.value = false
  }
}

// 在组件挂载时获取日志状态
onMounted(() => {
  initLogStatus()
})

watchEffect(() => {
  const path = router.currentRoute.value.path

  if (path.startsWith('/mapping')) {
    ui.currentTopTab = 'map'
  } else if (path.startsWith('/control') || path.startsWith('/patrol')) {
    ui.currentTopTab = 'mode'
  } else if (path.startsWith('/staff') || path.startsWith('/log')) {
    ui.currentTopTab = 'set'
  } else {
    ui.currentTopTab = ''
  }
})
</script>

<style scoped>
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: white;
  height: 60px;
  border-bottom: 1px solid #e0e0e0;
}

.btn-header {
  font-weight: bold;
  font-size: 20px;
}

.tab-bar {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.tab-btn {
  font-size: 14px;
}

.right-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}
@media (max-width: 720px) {
  .header-bar { height: auto; min-height: 60px; flex-wrap: wrap; padding: 8px; gap: 8px; }
  .right-controls { width: 100%; flex-wrap: wrap; gap: 8px; }
  .right-controls :deep(.el-button + .el-button) { margin-left: 0; }
}
</style>
