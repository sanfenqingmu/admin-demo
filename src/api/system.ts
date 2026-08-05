import { request } from '@/utils/request'
import type { ApiResponse, MenuItem, ListParams, ListResult } from '@/types'

export function getProfile(): Promise<ApiResponse<Record<string, unknown>>> {
  return request({
    url: '/api/system/profile',
    method: 'get'
  })
}

export function updateProfile(data: Record<string, unknown>): Promise<ApiResponse<void>> {
  return request({
    url: '/api/system/profile',
    method: 'put',
    data
  })
}

export function changePassword(data: { oldPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
  return request({
    url: '/api/system/password',
    method: 'put',
    data
  })
}

export function getAccountList(params?: ListParams): Promise<ApiResponse<ListResult<Record<string, unknown>>>> {
  return request({
    url: '/api/system/account/list',
    method: 'get',
    params
  })
}

export function createAccount(data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return request({
    url: '/api/system/account/create',
    method: 'post',
    data
  })
}

export function updateAccount(id: number, data: Record<string, unknown>): Promise<ApiResponse<void>> {
  return request({
    url: `/api/system/account/update/${id}`,
    method: 'put',
    data
  })
}

export function deleteAccount(id: number): Promise<ApiResponse<void>> {
  return request({
    url: `/api/system/account/delete/${id}`,
    method: 'delete'
  })
}

export function getRoleList(): Promise<ApiResponse<Record<string, unknown>[]>> {
  return request({
    url: '/api/system/role/list',
    method: 'get'
  })
}

export function createRole(data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return request({
    url: '/api/system/role/create',
    method: 'post',
    data
  })
}

export function updateRole(id: number, data: Record<string, unknown>): Promise<ApiResponse<void>> {
  return request({
    url: `/api/system/role/update/${id}`,
    method: 'put',
    data
  })
}

export function deleteRole(id: number): Promise<ApiResponse<void>> {
  return request({
    url: `/api/system/role/delete/${id}`,
    method: 'delete'
  })
}

export function getRolePermissions(roleId: number): Promise<ApiResponse<string[]>> {
  return request({
    url: `/api/system/role/${roleId}/permissions`,
    method: 'get'
  })
}

export function assignRolePermissions(roleId: number, permissionKeys: string[]): Promise<ApiResponse<void>> {
  return request({
    url: `/api/system/role/${roleId}/permissions`,
    method: 'put',
    data: { permissionKeys }
  })
}

export function getMenuList(): Promise<ApiResponse<MenuItem[]>> {
  return request({
    url: '/api/system/menu/list',
    method: 'get'
  })
}

export function createMenu(data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return request({
    url: '/api/system/menu/create',
    method: 'post',
    data
  })
}

export function updateMenu(id: number, data: Record<string, unknown>): Promise<ApiResponse<void>> {
  return request({
    url: `/api/system/menu/update/${id}`,
    method: 'put',
    data
  })
}

export function deleteMenu(id: number): Promise<ApiResponse<void>> {
  return request({
    url: `/api/system/menu/delete/${id}`,
    method: 'delete'
  })
}

export function getPermissionList(params?: ListParams): Promise<ApiResponse<ListResult<Record<string, unknown>>>> {
  return request({
    url: '/api/system/permission/list',
    method: 'get',
    params
  })
}

export function createPermission(data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return request({
    url: '/api/system/permission/create',
    method: 'post',
    data
  })
}

export function updatePermission(id: number, data: Record<string, unknown>): Promise<ApiResponse<void>> {
  return request({
    url: `/api/system/permission/update/${id}`,
    method: 'put',
    data
  })
}

export function deletePermission(id: number): Promise<ApiResponse<void>> {
  return request({
    url: `/api/system/permission/delete/${id}`,
    method: 'delete'
  })
}

export function getDictTypeList(): Promise<ApiResponse<Record<string, unknown>[]>> {
  return request({
    url: '/api/system/dict/type/list',
    method: 'get'
  })
}

export function getDictItemList(params?: ListParams): Promise<ApiResponse<ListResult<Record<string, unknown>>>> {
  return request({
    url: '/api/system/dict/item/list',
    method: 'get',
    params
  })
}

export function createDictType(data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return request({
    url: '/api/system/dict/type/create',
    method: 'post',
    data
  })
}

export function updateDictType(id: number, data: Record<string, unknown>): Promise<ApiResponse<void>> {
  return request({
    url: `/api/system/dict/type/update/${id}`,
    method: 'put',
    data
  })
}

export function deleteDictType(id: number): Promise<ApiResponse<void>> {
  return request({
    url: `/api/system/dict/type/delete/${id}`,
    method: 'delete'
  })
}

export function createDictItem(data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return request({
    url: '/api/system/dict/item/create',
    method: 'post',
    data
  })
}

export function updateDictItem(id: number, data: Record<string, unknown>): Promise<ApiResponse<void>> {
  return request({
    url: `/api/system/dict/item/update/${id}`,
    method: 'put',
    data
  })
}

export function deleteDictItem(id: number): Promise<ApiResponse<void>> {
  return request({
    url: `/api/system/dict/item/delete/${id}`,
    method: 'delete'
  })
}

export function getSettings(): Promise<ApiResponse<Record<string, unknown>>> {
  return request({
    url: '/api/system/settings',
    method: 'get'
  })
}

export function updateSettings(data: Record<string, unknown>): Promise<ApiResponse<void>> {
  return request({
    url: '/api/system/settings',
    method: 'put',
    data
  })
}

export function getOperationLogList(params?: ListParams): Promise<ApiResponse<ListResult<Record<string, unknown>>>> {
  return request({
    url: '/api/log/operation/list',
    method: 'get',
    params
  })
}

export function getLoginLogList(params?: ListParams): Promise<ApiResponse<ListResult<Record<string, unknown>>>> {
  return request({
    url: '/api/log/login/list',
    method: 'get',
    params
  })
}

export function deleteLog(ids: number[], type: 'operation' | 'login'): Promise<ApiResponse<void>> {
  return request({
    url: `/api/log/${type}/delete`,
    method: 'delete',
    data: { ids }
  })
}