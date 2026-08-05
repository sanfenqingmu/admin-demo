import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { message } from 'ant-design-vue'
import { storage } from './storage'
import router from '@/router'
import type { ApiResponse } from '@/types'

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000
})

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data as ApiResponse
    if (res.code && res.code !== 200) {
      message.error(res.message || '请求失败')
      if (res.code === 401) {
        storage.clear()
        router.push('/login')
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  (error) => {
    if (error.response) {
      const { status } = error.response
      const errorMessages: Record<number, string> = {
        401: '登录已过期，请重新登录',
        403: '没有访问权限',
        404: '请求的资源不存在',
        500: '服务器错误，请稍后重试'
      }
      if (status === 401) {
        storage.clear()
        router.push('/login')
      }
      message.error(errorMessages[status] || error.message || '请求失败')
    } else if (error.message.includes('timeout')) {
      message.error('请求超时，请稍后重试')
    } else {
      message.error('网络连接异常，请检查网络')
    }
    return Promise.reject(error)
  }
)

export interface RequestOptions extends AxiosRequestConfig {
  loading?: boolean
}

export function request<T = unknown>(config: RequestOptions): Promise<ApiResponse<T>> {
  return service.request(config) as Promise<ApiResponse<T>>
}

export default service
