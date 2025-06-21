<template>
  <div class="error-page">
    <div class="content">
      <div class="error-code">404</div>
      <div class="error-message">Oops. Nothing here...</div>
      <el-button type="primary" @click="goHome">Go Home</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<style scoped>
.error-page {
  background-color: #1976d2;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  color: white;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-code {
  font-size: 30vh;
}

.error-message {
  font-size: 1.5rem;
  opacity: 0.6;
  margin-bottom: 2rem;
}
</style>
