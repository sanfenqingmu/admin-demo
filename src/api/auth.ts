import { request } from '@/utils/request'
import type { ApiResponse, LoginParams, LoginResult, UserInfo, MenuItem } from '@/types'

export function login(data: LoginParams): Promise<ApiResponse<LoginResult>> {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data
  })
}

export function logout(): Promise<ApiResponse<void>> {
  return request({
    url: '/api/auth/logout',
    method: 'post'
  })
}

export function getUserInfo(): Promise<ApiResponse<UserInfo>> {
  return request({
    url: '/api/auth/userinfo',
    method: 'get'
  })
}

export function getMenuList(): Promise<ApiResponse<MenuItem[]>> {
  return request({
    url: '/api/auth/menus',
    method: 'get'
  })
}