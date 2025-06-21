<template>
  <el-card shadow="never" style="height: 100%">
    <div>
      <div v-if="errorMsg" style="color: red; text-align: center; margin-top: 10px">{{ errorMsg }}</div>
      <div v-if="loading" style="text-align: center; margin-top: 10px; color: #409eff">
        正在录音... 剩余 {{ remainSeconds }} 秒
      </div>
    </div>
    <div style="display: flex; justify-content: center; align-items: center">
      <el-button
        :icon="loading ? VideoPause : VideoPlay"
        :type="loading ? 'danger' : 'success'"
        size="large"
        @click="handleVoice()"
      >
        {{ loading ? '结束' : '开始' }}
      </el-button>
      <el-button type="primary" size="large" @click="confirm" :loading="sending"> 确认指令 </el-button>
    </div>
    <el-input
      v-model="voice"
      type="textarea"
      style="margin-top: 1%; font-size: 16px; text-align: center"
      rows="3"
      class="centered-textarea"
      placeholder="请开始说话"
    ></el-input>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { ctrlCommandReq } from '@/api/userCtrl'
import { VideoPause, VideoPlay } from '@element-plus/icons-vue'

const props = defineProps<{
  tipBrief: boolean
}>()

const emit = defineEmits(['voiceEnd'])

// 语音输入状态
const loading = ref(false)
const voice = ref('')
const errorMsg = ref('')
const remainSeconds = ref(60)
const sending = ref(false)

const MAX_SECONDS = 60
let second = 0
let countInterval: NodeJS.Timeout | null = null
let recognition: any = null

// 发送语音命令到后端
async function voiceCtrl() {
  sending.value = true
  errorMsg.value = ''
  try {
    await ctrlCommandReq('post', { command: voice.value })
  } catch (e: any) {
    errorMsg.value = '指令发送失败: ' + (e?.message || e)
  } finally {
    sending.value = false
  }
}

// 处理语音按钮点击
function handleVoice() {
  errorMsg.value = ''
  if (!loading.value) {
    voiceStart()
  } else {
    voiceEnd()
  }
}

// 开始语音识别
function voiceStart() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    errorMsg.value = '当前浏览器不支持语音识别功能，请使用Chrome浏览器。'
    return
  }
  voice.value = ''
  second = 0
  remainSeconds.value = MAX_SECONDS
  loading.value = true
  // @ts-ignore
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition = new SpeechRecognition()
  recognition.lang = 'zh-CN'
  recognition.continuous = true
  recognition.interimResults = true

  recognition.onresult = (event: any) => {
    let result = ''
    for (let i = 0; i < event.results.length; ++i) {
      result += event.results[i][0].transcript
    }
    voice.value = result
  }
  recognition.onerror = (event: any) => {
    errorMsg.value = '语音识别出错: ' + event.error
    voiceEnd()
  }
  recognition.onend = () => {
    loading.value = false
  }
  recognition.start()
  countInterval = setInterval(() => {
    second++
    remainSeconds.value = MAX_SECONDS - second
    if (second >= MAX_SECONDS) {
      voiceEnd()
    }
  }, 1000)
}

// 结束语音识别
function voiceEnd() {
  loading.value = false
  remainSeconds.value = MAX_SECONDS
  if (recognition) {
    try {
      recognition.stop()
    } catch {}
    recognition = null
  }
  clearInterval(countInterval as NodeJS.Timeout)
  emit('voiceEnd')
}

// 确认语音指令
function confirm() {
  if (!voice.value) {
    errorMsg.value = '请先输入或说出指令内容！'
    return
  }
  voiceCtrl()
}

// 组件卸载时清理
onUnmounted(() => {
  if (countInterval) {
    clearInterval(countInterval)
  }
  if (recognition) {
    try {
      recognition.stop()
    } catch {}
    recognition = null
  }
})
</script>

<style scoped>
.tooltip-brief {
  position: fixed;
  top: 10%;
  left: 120px;
}

.tooltip-detail {
  position: fixed;
  top: 35%;
  left: 15%;
}

/* 添加文本居中样式 */
.centered-textarea :deep(.el-textarea__inner) {
  text-align: center;
}
</style>
