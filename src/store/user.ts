import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storage } from '@/utils/storage'
import { login as loginApi, logout as logoutApi, getUserInfo as getUserInfoApi } from '@/api/auth'
import type { LoginParams, UserInfo } from '@/types'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(storage.getToken() || '')
  const userInfo = ref<UserInfo | null>(storage.getUserInfo<UserInfo>())
  const permissions = ref<string[]>([])

  async function login(params: LoginParams) {
    const res = await loginApi(params)
    token.value = res.data.token
    userInfo.value = res.data.userInfo
    permissions.value = res.data.userInfo.permissions
    storage.setToken(res.data.token)
    storage.setUserInfo(res.data.userInfo)
  }

  async function logout() {
    try {
      await logoutApi()
    } finally {
      clearState()
    }
  }

  async function fetchUserInfo() {
    const res = await getUserInfoApi()
    userInfo.value = res.data
    permissions.value = res.data.permissions
    storage.setUserInfo(res.data)
  }

  function clearState() {
    token.value = ''
    userInfo.value = null
    permissions.value = []
    storage.clear()
  }

  return {
    token,
    userInfo,
    permissions,
    login,
    logout,
    fetchUserInfo,
    clearState
  }
})
