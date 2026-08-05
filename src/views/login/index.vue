<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <div class="login-header">
        <h1>{{ appTitle }}</h1>
        <p>欢迎登录</p>
      </div>
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        layout="vertical"
        class="login-form"
        @finish="handleLogin"
      >
        <a-form-item name="username" label="用户名">
          <a-input v-model:value="formState.username" placeholder="请输入用户名" size="large">
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item name="password" label="密码">
          <a-input-password
            v-model:value="formState.password"
            placeholder="请输入密码"
            size="large"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            :loading="loading"
            block
          >
            登 录
          </a-button>
        </a-form-item>
      </a-form>
      <div class="login-tips">
        <span>提示：admin / 任意密码</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/store/user'
import type { FormInstance } from 'ant-design-vue'

const appTitle = import.meta.env.VITE_APP_TITLE
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const formState = reactive({
  username: 'admin',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  loading.value = true
  try {
    await userStore.login({
      username: formState.username,
      password: formState.password
    })
    message.success('登录成功')
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch {
    // error handled in request interceptor
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-form-wrapper {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;

  h1 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
  }

  p {
    color: #999;
    margin: 0;
  }
}

.login-form {
  margin-top: 24px;
}

.login-tips {
  text-align: center;
  color: #999;
  font-size: 12px;
  margin-top: 16px;
}
</style>
