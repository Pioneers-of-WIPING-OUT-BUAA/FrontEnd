<template>
  <div class="welcome-container">
    <h1>扫荡北航先锋</h1>
    <div class="logo">
      <el-icon>
        <i :class="'mdi mdi-robot-outline'" style="font-size: 45px" />
      </el-icon>
    </div>
    <p class="description">
      以安全为盾，清洁为刃，扫荡北航先锋是一款集安防巡检、清洁作业于一体的智能机器人。
      我们致力于用科技守护北航，助力智慧校园和绿色低碳发展。
    </p>
  </div>
</template>

<script setup></script>

<style scoped>
.welcome-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  background-color: #0f0f0f;
  color: #fff;
}

h1 {
  font-size: 2.5em;
  margin-bottom: 0.5em;
}

.logo {
  margin: 20px 0;
  width: 120px;
  height: 120px;
  border: 2px solid #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2em;
}

.description {
  font-size: 1.1em;
  max-width: 500px;
  margin: 20px;
  color: #ccc;
  line-height: 1.6;
}
</style>
