<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>{{ isLogin ? '欢迎登录' : '用户注册' }}</h2>
        <p>{{ isLogin ? '扫荡北航前锋系统' : '加入扫荡北航前锋' }}</p>
      </div>

      <el-form :model="formData" :rules="rules" ref="formRef" class="login-form">
        <el-form-item prop="username">
          <el-input
            v-model="formData.username"
            placeholder="用户名"
            prefix-icon="el-icon-user"
            maxlength="20"
            clearable
          >
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="formData.password"
            placeholder="密码"
            prefix-icon="el-icon-lock"
            :type="showPassword ? 'text' : 'password'"
            maxlength="20"
            clearable
            show-password
          >
          </el-input>
        </el-form-item>

        <el-form-item v-if="!isLogin && confirmPassword" prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
            placeholder="确认密码"
            prefix-icon="el-icon-lock"
            :type="showPassword ? 'text' : 'password'"
            maxlength="20"
            clearable
            show-password
          >
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="submit-btn" :loading="loading" @click="handleSubmit">
            {{ isLogin ? '登 录' : '注 册' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p v-if="isLogin">
          还没有账号？
          <el-button type="text" @click="switchMode">立即注册</el-button>
        </p>
        <p v-else>
          已有账号？
          <el-button type="text" @click="switchMode">返回登录</el-button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authLoginReq, authRegisterReq } from '@/api/user'
import { userStore } from '@/stores/userStore'

const router = useRouter()
const user = userStore()
const formRef = ref(null)
const loading = ref(false)
const isLogin = ref(true)
const showPassword = ref(false)
const confirmPassword = ref(true)

const formData = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== formData.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6-20个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
})

const switchMode = () => {
  isLogin.value = !isLogin.value
  formData.username = ''
  formData.password = ''
  formData.confirmPassword = ''
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true

    try {
      if (isLogin.value) {
        // 登录逻辑
        const response = await authLoginReq('post', {
          username: formData.username,
          password: formData.password
        })

        if (response && response.data) {
          const { token, role } = response.data

          // 保存用户信息到store
          user.login({
            username: formData.username,
            token,
            role,
            avatar: '' // 可以设置默认头像
          })

          ElMessage.success('登录成功')
          router.push('/welcome')
        }
      } else {
        // 注册逻辑
        if (formData.password !== formData.confirmPassword) {
          ElMessage.error('两次输入的密码不一致')
          return
        }

        const response = await authRegisterReq('post', {
          username: formData.username,
          password: formData.password
        })

        if (response) {
          ElMessage.success('注册成功，请登录')
          isLogin.value = true
          formData.password = ''
          formData.confirmPassword = ''
        }
      }
    } catch (error) {
      console.error('操作失败:', error)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 10px;
  box-shadow:
    0 15px 35px rgba(50, 50, 93, 0.1),
    0 5px 15px rgba(0, 0, 0, 0.07);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
}

.login-header p {
  color: #666;
  font-size: 16px;
}

.login-form {
  margin-bottom: 20px;
}

.submit-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  border-radius: 4px;
  margin-top: 10px;
}

.login-footer {
  text-align: center;
  color: #666;
}

.login-footer p {
  margin: 0;
  line-height: 1.6;
}

:deep(.el-input__inner) {
  height: 50px;
}

:deep(.el-button--text) {
  padding: 0 5px;
}
</style>
