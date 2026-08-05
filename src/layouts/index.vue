<template>
  <a-layout class="layout-container">
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      theme="dark"
      width="220"
    >
      <div class="logo">
        <span v-if="!collapsed">{{ appTitle }}</span>
        <span v-else>AD</span>
      </div>
      <SideMenu />
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="layout-header">
        <div class="header-left">
          <MenuUnfoldOutlined v-if="collapsed" class="trigger" @click="toggleCollapsed" />
          <MenuFoldOutlined v-else class="trigger" @click="toggleCollapsed" />
          <Breadcrumb />
        </div>
        <div class="header-right">
          <UserInfo />
        </div>
      </a-layout-header>
      <TagsView />
      <a-layout-content class="layout-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/store/app'
import SideMenu from './components/SideMenu.vue'
import Breadcrumb from './components/Breadcrumb.vue'
import UserInfo from './components/UserInfo.vue'
import TagsView from './components/TagsView.vue'

const appStore = useAppStore()
const collapsed = computed({
  get: () => appStore.collapsed,
  set: (val) => (appStore.collapsed = val)
})

const appTitle = computed(() => import.meta.env.VITE_APP_TITLE)

function toggleCollapsed() {
  appStore.toggleCollapsed()
}
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
}

.logo {
  height: $header-height;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  white-space: nowrap;
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .header-right {
    display: flex;
    align-items: center;
  }

  .trigger {
    font-size: 18px;
    cursor: pointer;
    padding: 0 12px;
    border-radius: 4px;
    transition: background 0.3s;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }
}

.layout-content {
  margin: 16px;
  padding: 24px;
  background: #fff;
  min-height: calc(100vh - #{$header-height} - #{$tags-view-height} - 32px);
  border-radius: 4px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
