<template>
  <div class="profile-container">
    <a-row :gutter="16">
      <a-col :span="8">
        <a-card class="profile-card">
          <div class="avatar-section">
            <a-avatar :size="80" style="background-color: #1677ff">
              {{ userStore.userInfo?.nickname?.charAt(0) || 'A' }}
            </a-avatar>
            <h2>{{ userStore.userInfo?.nickname || '管理员' }}</h2>
            <p class="username">@{{ userStore.userInfo?.username }}</p>
            <a-tag color="blue">{{ userStore.userInfo?.roles?.[0] || 'admin' }}</a-tag>
          </div>
          <a-divider />
          <div class="info-list">
            <div class="info-item">
              <span class="label">用户ID</span>
              <span>{{ userStore.userInfo?.id }}</span>
            </div>
            <div class="info-item">
              <span class="label">权限数</span>
              <span>{{ userStore.userInfo?.permissions?.length || 0 }}</span>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="16">
        <a-card title="基本信息" style="margin-bottom: 16px">
          <a-form :model="profileForm" layout="vertical" ref="profileFormRef">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="用户名">
                  <a-input v-model:value="profileForm.username" disabled />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="昵称" name="nickname" :rules="[{ required: true }]">
                  <a-input v-model:value="profileForm.nickname" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="邮箱" name="email" :rules="[{ type: 'email' }]">
                  <a-input v-model:value="profileForm.email" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="手机">
                  <a-input v-model:value="profileForm.phone" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item>
              <a-button type="primary" @click="handleUpdate">保存修改</a-button>
            </a-form-item>
          </a-form>
        </a-card>

        <a-card title="修改密码">
          <a-form :model="pwdForm" layout="vertical" ref="pwdFormRef" style="max-width: 400px">
            <a-form-item label="当前密码" name="oldPassword" :rules="[{ required: true, message: '请输入当前密码' }]">
              <a-input-password v-model:value="pwdForm.oldPassword" placeholder="请输入当前密码" />
            </a-form-item>
            <a-form-item label="新密码" name="newPassword" :rules="[{ required: true, message: '请输入新密码' }]">
              <a-input-password v-model:value="pwdForm.newPassword" placeholder="请输入新密码（至少6位）" />
            </a-form-item>
            <a-form-item label="确认密码" name="confirmPassword" :rules="[{ required: true, message: '请再次输入新密码' }]">
              <a-input-password v-model:value="pwdForm.confirmPassword" placeholder="请再次输入新密码" />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="handleChangePwd">修改密码</a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/store/user'
import { getProfile, updateProfile, changePassword } from '@/api/system'

const userStore = useUserStore()

const profileFormRef = ref()
const pwdFormRef = ref()

const profileForm = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: ''
})

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

async function loadProfile() {
  const res = await getProfile()
  Object.assign(profileForm, res.data)
}

async function handleUpdate() {
  try {
    await profileFormRef.value?.validate()
    await updateProfile({
      nickname: profileForm.nickname,
      email: profileForm.email,
      phone: profileForm.phone
    })
    message.success('修改成功')
  } catch {
    // validation error
  }
}

async function handleChangePwd() {
  try {
    await pwdFormRef.value?.validate()
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      message.error('两次输入的密码不一致')
      return
    }
    if (pwdForm.newPassword.length < 6) {
      message.error('新密码至少6位')
      return
    }
    await changePassword({
      oldPassword: pwdForm.oldPassword,
      newPassword: pwdForm.newPassword
    })
    message.success('密码修改成功')
    Object.assign(pwdForm, { oldPassword: '', newPassword: '', confirmPassword: '' })
  } catch {
    // handled
  }
}

onMounted(() => {
  if (userStore.userInfo) {
    profileForm.username = userStore.userInfo.username
    profileForm.nickname = userStore.userInfo.nickname
  }
  loadProfile()
})
</script>

<style lang="scss" scoped>
.profile-card {
  text-align: center;

  .avatar-section {
    padding: 16px 0;
  }

  h2 {
    margin: 12px 0 4px;
  }

  .username {
    color: #999;
    margin-bottom: 12px;
  }
}

.info-list {
  .info-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;

    .label {
      color: #999;
    }
  }
}
</style>
