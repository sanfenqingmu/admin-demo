import { request } from '@/utils/request'
import type { ApiResponse, InventoryRecord, StockFlowRecord, ListParams, ListResult } from '@/types'

export function getFreightList(params?: ListParams): Promise<ApiResponse<ListResult<Record<string, unknown>>>> {
  return request({ url: '/api/logistics/freight/list', method: 'get', params })
}

export function createFreight(data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return request({ url: '/api/logistics/freight/create', method: 'post', data })
}

export function updateFreight(id: number, data: Record<string, unknown>): Promise<ApiResponse<void>> {
  return request({ url: `/api/logistics/freight/update/${id}`, method: 'put', data })
}

export function deleteFreight(id: number): Promise<ApiResponse<void>> {
  return request({ url: `/api/logistics/freight/delete/${id}`, method: 'delete' })
}

export function getExpressList(params?: ListParams): Promise<ApiResponse<ListResult<Record<string, unknown>>>> {
  return request({ url: '/api/logistics/express/list', method: 'get', params })
}

export function createExpress(data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return request({ url: '/api/logistics/express/create', method: 'post', data })
}

export function updateExpress(id: number, data: Record<string, unknown>): Promise<ApiResponse<void>> {
  return request({ url: `/api/logistics/express/update/${id}`, method: 'put', data })
}

export function deleteExpress(id: number): Promise<ApiResponse<void>> {
  return request({ url: `/api/logistics/express/delete/${id}`, method: 'delete' })
}

export function getInventoryList(params?: ListParams): Promise<ApiResponse<ListResult<InventoryRecord>>> {
  return request({ url: '/api/logistics/inventory/list', method: 'get', params })
}

export function updateStock(id: number, data: { stock: number; remark?: string }): Promise<ApiResponse<void>> {
  return request({ url: `/api/logistics/inventory/update/${id}`, method: 'put', data })
}

export function batchUpdateStock(data: { ids: number[]; stock: number }): Promise<ApiResponse<void>> {
  return request({ url: '/api/logistics/inventory/batch-update', method: 'put', data })
}

export function getStockFlowList(params?: ListParams): Promise<ApiResponse<ListResult<StockFlowRecord>>> {
  return request({ url: '/api/logistics/inventory/flow', method: 'get', params })
}

export function getWarningList(params?: ListParams): Promise<ApiResponse<ListResult<InventoryRecord>>> {
  return request({ url: '/api/logistics/inventory/warning', method: 'get', params })
}

export function setWarningThreshold(id: number, threshold: number): Promise<ApiResponse<void>> {
  return request({ url: `/api/logistics/inventory/warning-threshold/${id}`, method: 'put', data: { threshold } })
}