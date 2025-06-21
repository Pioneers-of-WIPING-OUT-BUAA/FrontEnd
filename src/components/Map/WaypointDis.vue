<template>
  <el-card class="canvas-card" shadow="always">
    <div v-if="!isMapLoaded" class="loading-container">
      <el-icon class="loading-spinner is-loading"><Loading /></el-icon>
      <div class="loading-text">地图加载中，请稍候...</div>
    </div>
    <canvas v-show="isMapLoaded" id="map" :style="`height:${imgHeight}px;width:${imgWidth}px`"></canvas>
  </el-card>
</template>

<script lang="ts" setup>
import { withDefaults, defineProps, watch, onMounted, defineEmits, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

interface autoProps {
  url: string
  pointInfo: { x: number; y: number; theta: number; name: string }[]
  editable: boolean
  propX: number
  propY: number
}

const props = withDefaults(defineProps<autoProps>(), {
  url: 'map.png',
  pointInfo: () => [],
  editable: true,
  propX: 0,
  propY: 0
})

const emit = defineEmits(['update'])

const imgHeight = 500
const imgWidth = 400
let isDrawing = false
let originHeight = 0
let originWidth = 0
let centerX = 0
let centerY = 0
let scale = 0
let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let resolution = 0.03
const img = new Image()
const isMapLoaded = ref(false)
let originX: number, originY: number
let targetX: number, targetY: number
let tmpX: number, tmpY: number
let rect: DOMRect | null = null
const triangleSize = 13
const triangleColor = '#FF0000'
const textColor = 'blue'
const textSize = '15px Arial'

onMounted(() => {
  canvas = document.querySelector('#map') as HTMLCanvasElement
  if (!canvas) return

  ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = imgWidth
  canvas.height = imgHeight

  // 设置图片加载事件
  img.onload = () => {
    isMapLoaded.value = true
    originWidth = img.width
    originHeight = img.height
    const sourceAspectRatio = img.width / img.height
    const targetAspectRatio = canvas!.width / canvas!.height
    centerX = props.propX !== 0 ? Math.abs(props.propX) / resolution : img.width / 2
    centerY = props.propY !== 0 ? Math.abs(props.propY) / resolution : img.height / 2

    scale = targetAspectRatio > sourceAspectRatio ? canvas!.height / img.height : canvas!.width / img.width

    ctx!.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width * scale, img.height * scale)
    drawPoint(props.pointInfo)
  }

  img.onerror = (event) => {
    ElMessage.error('地图加载失败，请检查地图链接是否有效')
  }

  // 设置图片源
  img.src = props.url

  // 只有在地图加载完成并且可编辑模式下才添加鼠标事件
  if (props.editable) {
    canvas.addEventListener('mousedown', (event: MouseEvent) => {
      if (!isMapLoaded.value) {
        ElMessage.warning('地图尚未加载完成，无法标注航点')
        return
      }

      rect = canvas!.getBoundingClientRect()
      originX = event.clientX - rect.left
      originY = event.clientY - rect.top
      isDrawing = true
    })

    canvas.addEventListener('mousemove', (event: MouseEvent) => {
      if (!isDrawing || !ctx || !canvas || !isMapLoaded.value) return
      rect = canvas.getBoundingClientRect()
      tmpX = event.clientX - rect.left
      tmpY = event.clientY - rect.top
      drawLine()
    })

    canvas.addEventListener('mouseup', (event: MouseEvent) => {
      if (!isMapLoaded.value) return

      isDrawing = false
      rect = canvas!.getBoundingClientRect()
      targetX = event.clientX - rect.left
      targetY = event.clientY - rect.top
      newPoint()
    })
  }
})

// 监听URL变化重新加载地图
watch(
  () => props.url,
  (newUrl) => {
    if (newUrl) {
      isMapLoaded.value = false
      img.src = newUrl
    }
  }
)

function newPoint() {
  const dx = targetX - originX
  const dy = targetY - originY
  const angle = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2)
  const newPoint = imgPos2originPos(originX, originY, angle)
  emit('update', newPoint)
}

watch(
  () => props.pointInfo,
  (to) => {
    if (isMapLoaded.value) {
      drawPoint(to)
    }
  }
)

function drawLine() {
  drawPoint(props.pointInfo)
  ctx!.beginPath()
  ctx!.strokeStyle = 'blue'
  ctx!.lineWidth = 2
  ctx!.moveTo(originX, originY)
  ctx!.lineTo(tmpX, tmpY)
  ctx!.stroke()
  ctx!.closePath()
}

function drawPoint(points: autoProps['pointInfo']) {
  if (!ctx || !canvas || !isMapLoaded.value) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width * scale, img.height * scale)

  points.forEach((ele) => {
    const Element = originPos2imgPos(ele.x, ele.y, ele.theta)
    const [x1, y1] = [
      Element.x + triangleSize * Math.cos(Element.theta),
      Element.y + triangleSize * Math.sin(Element.theta)
    ]
    const [x2, y2] = [
      Element.x + triangleSize * Math.cos(Math.PI - Math.PI / 6 + Element.theta),
      Element.y + triangleSize * Math.sin(Math.PI - Math.PI / 6 + Element.theta)
    ]
    const [x3, y3] = [
      Element.x + triangleSize * Math.cos(Math.PI - Math.PI / 6 + Element.theta + Math.PI / 3),
      Element.y + triangleSize * Math.sin(Math.PI - Math.PI / 6 + Element.theta + Math.PI / 3)
    ]

    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x3, y3)
    ctx.closePath()
    ctx.fillStyle = triangleColor
    ctx.fill()

    ctx.font = textSize
    ctx.fillStyle = textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(ele.name, Element.x, Element.y)
  })
}

function originPos2imgPos(x: number, y: number, theta: number) {
  let tmpX = x / resolution + centerX
  let tmpY = originHeight - (y / resolution + centerY)
  let newTheta = Math.PI * 2 - ((theta + Math.PI * 2) % (Math.PI * 2))
  return { x: tmpX * scale, y: tmpY * scale, theta: newTheta }
}

function imgPos2originPos(x: number, y: number, theta: number) {
  let tmpX = x / scale
  let tmpY = y / scale
  let newX = (tmpX - centerX) * resolution
  let newY = (originHeight - tmpY - centerY) * resolution
  let newTheta = Math.PI * 2 - theta >= Math.PI ? -theta : Math.PI * 2 - theta
  return { x: newX, y: newY, theta: newTheta }
}
</script>

<style scoped>
.canvas-card {
  width: 80%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0;
  position: relative;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 500px;
  width: 100%;
}

.loading-spinner {
  font-size: 32px;
}

.loading-text {
  margin-top: 16px;
  color: #909399;
  font-size: 14px;
}
</style>
