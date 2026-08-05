import { request } from '@/utils/request'
import type { ApiResponse, ListParams, ListResult } from '@/types'

export function getUserList(params?: ListParams): Promise<ApiResponse<ListResult<Record<string, unknown>>>> {
  return request({
    url: '/api/user/list',
    method: 'get',
    params
  })
}

export function createUser(data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return request({
    url: '/api/user/create',
    method: 'post',
    data
  })
}

export function updateUser(id: number, data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return request({
    url: `/api/user/update/${id}`,
    method: 'put',
    data
  })
}

export function deleteUser(id: number): Promise<ApiResponse<void>> {
  return request({
    url: `/api/user/delete/${id}`,
    method: 'delete'
  })
}