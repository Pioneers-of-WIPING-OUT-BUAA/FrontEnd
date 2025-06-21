<template>
  <div style="display: flex; justify-content: center; align-items: center; height: 600px; width: 600px">
    <el-icon v-if="spinner" :size="80" class="is-loading">
      <loading />
    </el-icon>
    <div v-else-if="wsError" style="color: red; text-align: center; width: 100%">WebSocket 未连接，无法显示地图</div>
    <div v-else-if="mapError" style="color: red; text-align: center; width: 100%">地图数据异常，无法渲染地图</div>
    <div v-else id="twod-map" style="height: 600px; width: 600px"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { wsStore } from '@/stores/wsStore'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const ROSLIB = window.ROSLIB
let count = 0
let spinner = ref(true)
let wsError = ref(false)
let mapError = ref(false)

function init() {
  const ws = wsStore()
  const ros = ws.ws
  if (!ros || ros.isConnected === false) {
    wsError.value = true
    ElMessage.error('WebSocket 未连接，无法显示地图')
    return
  }
  wsError.value = false
  //ros.connect('ws://localhost:9090');
  var viewer2D = new ROS2D.Viewer({
    divID: 'twod-map',
    width: 600,
    height: 600
  })

  // 用于记录 odom 坐标系和 map 坐标系之间变换关系
  var x_off = 0
  var y_off = 0
  var theta_off = 0

  var gridClient = new ROS2D.OccupancyGridClient({
    ros: ros,
    rootObject: viewer2D.scene,
    continuous: true
  })
  gridClient.on('change', function () {
    try {
      viewer2D.scaleToDimensions(gridClient.currentGrid.width, gridClient.currentGrid.height)
      viewer2D.shift(gridClient.currentGrid.pose.position.x, gridClient.currentGrid.pose.position.y)
      displayPoseMarker()
      mapError.value = false
    } catch (error) {
      mapError.value = true
      ElMessage.error('地图数据异常，无法渲染地图')
      console.log('地图渲染异常:', error)
    }
  })

  function displayPoseMarker() {
    var robotMarker = new ROS2D.NavigationArrow({
      size: 12,
      strokeSize: 1,
      fillColor: createjs.Graphics.getRGB(255, 128, 0, 0.66)
    })
    robotMarker.visible = false

    gridClient.rootObject.addChild(robotMarker)
    var initScaleSet = false

    var poseListener = new ROSLIB.Topic({
      ros: ros,
      // 机器人里程计，以启动坐标为(0, 0)
      name: '/odom',
      messageType: 'nav_msgs/Odometry'
    })

    var tfListener = new ROSLIB.Topic({
      ros: ros,
      name: '/tf',
      messageType: 'tf2_msgs/TFMessage',
      queue_size: 1,
      throttle_rate: 30 // 获取消息时间间隔，单位ms
      // tf 变换，发布频率极高，这里需要找到 odom 和 map 之间的坐标变换以修正机器人坐标
    })

    tfListener.subscribe(function (tf) {
      if (tf.transforms[0].child_frame_id == 'odom' && tf.transforms[0].header.frame_id == 'map') {
        var x_off_new = tf.transforms[0].transform.translation.x
        var y_off_new = tf.transforms[0].transform.translation.y
        // 计算偏角
        var theta_off_new = viewer2D.scene.rosQuaternionToGlobalTheta(tf.transforms[0].transform.rotation)
        // 如果 tf 变了，则更新 x_off, y_off 和 theta_off，防抖
        if (
          Math.abs(x_off - x_off_new) >= 0.00001 ||
          Math.abs(y_off - y_off_new) >= 0.00001 ||
          Math.abs(theta_off - theta_off_new) >= 0.00001
        ) {
          x_off = x_off_new
          y_off = y_off_new
          theta_off = theta_off_new
        }
      }
    })

    poseListener.subscribe(function (pose) {
      // 获取机器人里程计坐标并修正到 map 坐标系
      robotMarker.x = pose.pose.pose.position.x + x_off
      robotMarker.y = -pose.pose.pose.position.y - y_off
      if (!initScaleSet) {
        robotMarker.scaleX = 1.0 / viewer2D.scene.scaleX
        robotMarker.scaleY = 1.0 / viewer2D.scene.scaleY
        initScaleSet = true
      }
      robotMarker.rotation = viewer2D.scene.rosQuaternionToGlobalTheta(pose.pose.pose.orientation) + theta_off
      robotMarker.visible = true
      if (count % 100 == 0) {
        count += 1
      }
    })
  }
}

function countdown() {
  setTimeout(() => {
    spinner.value = false
    setTimeout(() => {
      init()
    }, 1000)
  }, 4000)
}

onMounted(() => {
  spinner.value = true
  wsError.value = false
  mapError.value = false
  countdown()
})
</script>

<style scoped>
.is-loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
