<template>
  <div>
    <el-row :gutter="20">
      <el-col v-for="face in faceList" :key="face.id" :span="6" style="margin-bottom: 20px">
        <el-card shadow="hover">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>{{ face.name }}</span>
              <el-button type="danger" @click="deleteImg(face.id)">删除</el-button>
            </div>
          </template>
          <el-image :src="face.url" fit="contain" style="width: 100%; height: 150px" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="upload-card">
          <div style="text-align: center">
            <el-button type="primary" :icon="Plus" @click="imgDialog = true" circle />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="imgDialog" title="上传人员图像" width="400px">
      <el-form label-position="top">
        <el-form-item label="预览图像">
          <el-image :src="imgPreview" fit="contain" style="width: 100%; height: 150px" />
        </el-form-item>

        <el-form-item label="选择图像">
          <el-upload action="" :auto-upload="false" :show-file-list="false" :on-change="handleFileChange" accept=".jpg">
            <el-button type="primary">点击选择图像</el-button>
          </el-upload>
        </el-form-item>

        <el-form-item label="人员姓名">
          <el-input v-model="name" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="imgDialog = false">取消</el-button>
          <el-button type="primary" @click="submitImg" :disabled="!file || !name">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { faceUplaodReq, faceDeleteReq, faceListReq } from '@/api/face'

const faceList = ref([])
const imgDialog = ref(false)
const file = ref<File | null>(null)
const name = ref('')

const imgPreview = computed(() => {
  const windowURL = window.URL || window.webkitURL
  return file.value instanceof File
    ? windowURL.createObjectURL(file.value)
    : 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg2.doubanio.com%2Fview%2Fgroup_topic%2Fl%2Fpublic%2Fp515017572.jpg&refer=http%3A%2F%2Fimg2.doubanio.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1684653688&t=77fc1a857d099ee9c9331a633125f65f'
})

function handleFileChange(uploadFile: any) {
  file.value = uploadFile.raw
}

async function deleteImg(id: number) {
  await faceDeleteReq('delete', id)
  init()
}

async function submitImg() {
  if (!file.value || !name.value) return
  console.log('提交人脸图像:', file.value, name.value)
  await faceUplaodReq('post', { file: file.value }, name.value)
  console.log('上传人脸图像:', file.value, name.value)
  imgDialog.value = false
  file.value = null
  name.value = ''
  // init()
}

async function init() {
  const response = await faceListReq('get')
  console.log('获取人脸列表:', response.data)
  if (response) {
    faceList.value = response.data.faces
  } else {
    faceList.value = [
      { id: 1, name: '张三', url: 'map.png' },
      { id: 2, name: '李四', url: 'map.png' },
      { id: 3, name: '王五', url: 'map.png' }
    ]
  }
}

onMounted(() => {
  init()
})
</script>

<style scoped>
.upload-card {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 90%;
  border: 2px dashed #dcdfe6;
  cursor: pointer;
}
</style>
