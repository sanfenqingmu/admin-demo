<template>
  <a-dropdown :trigger="['click']">
    <div class="user-info">
      <a-avatar :size="32" style="background-color: #1677ff">
        {{ userStore.userInfo?.nickname?.charAt(0) || 'A' }}
      </a-avatar>
      <span class="username">{{ userStore.userInfo?.nickname || '管理员' }}</span>
      <DownOutlined />
    </div>
    <template #overlay>
      <a-menu @click="handleMenuClick">
        <a-menu-item key="profile">
          <UserOutlined />
          个人中心
        </a-menu-item>
        <a-menu-item key="logout">
          <LogoutOutlined />
          退出登录
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const router = useRouter()

async function handleMenuClick({ key }: { key: string }) {
  if (key === 'logout') {
    await userStore.logout()
    router.push('/login')
  } else if (key === 'profile') {
    // TODO: 跳转到个人中心
  }
}
</script>

<style lang="scss" scoped>
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  .username {
    font-size: 14px;
  }
}
</style>
