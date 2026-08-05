import { request } from '@/utils/request'
import type { ApiResponse, MemberRecord, MemberLevel, FlowRecord, OrderRecord, ListParams, ListResult, SelectOption } from '@/types'

export function getMemberList(params?: ListParams): Promise<ApiResponse<ListResult<MemberRecord>>> {
  return request({ url: '/api/member/list', method: 'get', params })
}

export function getMemberDetail(id: number): Promise<ApiResponse<MemberRecord>> {
  return request({ url: `/api/member/detail/${id}`, method: 'get' })
}

export function freezeMember(id: number): Promise<ApiResponse<void>> {
  return request({ url: `/api/member/freeze/${id}`, method: 'put' })
}

export function unfreezeMember(id: number): Promise<ApiResponse<void>> {
  return request({ url: `/api/member/unfreeze/${id}`, method: 'put' })
}

export function getMemberOrders(id: number, params?: ListParams): Promise<ApiResponse<ListResult<OrderRecord>>> {
  return request({ url: `/api/member/${id}/orders`, method: 'get', params })
}

export function getLevelList(): Promise<ApiResponse<MemberLevel[]>> {
  return request({ url: '/api/member/level/list', method: 'get' })
}

export function createLevel(data: Record<string, unknown>): Promise<ApiResponse<MemberLevel>> {
  return request({ url: '/api/member/level/create', method: 'post', data })
}

export function updateLevel(id: number, data: Record<string, unknown>): Promise<ApiResponse<void>> {
  return request({ url: `/api/member/level/update/${id}`, method: 'put', data })
}

export function deleteLevel(id: number): Promise<ApiResponse<void>> {
  return request({ url: `/api/member/level/delete/${id}`, method: 'delete' })
}

export function getPointsFlow(params?: ListParams): Promise<ApiResponse<ListResult<FlowRecord>>> {
  return request({ url: '/api/member/points/flow', method: 'get', params })
}

export function getBalanceFlow(params?: ListParams): Promise<ApiResponse<ListResult<FlowRecord>>> {
  return request({ url: '/api/member/balance/flow', method: 'get', params })
}

export function getMemberOptions(): Promise<ApiResponse<SelectOption[]>> {
  return request({ url: '/api/member/options', method: 'get' })
}