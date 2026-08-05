import { request } from '@/utils/request'
import type { ApiResponse, ListParams, ListResult } from '@/types'

export function getCategoryTree(): Promise<ApiResponse<Record<string, unknown>[]>> {
  return request({ url: '/api/product/category/tree', method: 'get' })
}

export function createCategory(data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return request({ url: '/api/product/category/create', method: 'post', data })
}

export function updateCategory(id: number, data: Record<string, unknown>): Promise<ApiResponse<void>> {
  return request({ url: `/api/product/category/update/${id}`, method: 'put', data })
}

export function deleteCategory(id: number): Promise<ApiResponse<void>> {
  return request({ url: `/api/product/category/delete/${id}`, method: 'delete' })
}

export function getBrandList(params?: ListParams): Promise<ApiResponse<ListResult<Record<string, unknown>>>> {
  return request({ url: '/api/product/brand/list', method: 'get', params })
}

export function createBrand(data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return request({ url: '/api/product/brand/create', method: 'post', data })
}

export function updateBrand(id: number, data: Record<string, unknown>): Promise<ApiResponse<void>> {
  return request({ url: `/api/product/brand/update/${id}`, method: 'put', data })
}

export function deleteBrand(id: number): Promise<ApiResponse<void>> {
  return request({ url: `/api/product/brand/delete/${id}`, method: 'delete' })
}

export function getSpecList(): Promise<ApiResponse<Record<string, unknown>[]>> {
  return request({ url: '/api/product/spec/list', method: 'get' })
}

export function createSpec(data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return request({ url: '/api/product/spec/create', method: 'post', data })
}

export function updateSpec(id: number, data: Record<string, unknown>): Promise<ApiResponse<void>> {
  return request({ url: `/api/product/spec/update/${id}`, method: 'put', data })
}

export function deleteSpec(id: number): Promise<ApiResponse<void>> {
  return request({ url: `/api/product/spec/delete/${id}`, method: 'delete' })
}

export function getSpecValueList(specId: number): Promise<ApiResponse<Record<string, unknown>[]>> {
  return request({ url: `/api/product/spec/${specId}/values`, method: 'get' })
}

export function createSpecValue(specId: number, data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return request({ url: `/api/product/spec/${specId}/values`, method: 'post', data })
}

export function deleteSpecValue(specId: number, valueId: number): Promise<ApiResponse<void>> {
  return request({ url: `/api/product/spec/${specId}/values/${valueId}`, method: 'delete' })
}

export function getProductList(params?: ListParams): Promise<ApiResponse<ListResult<Record<string, unknown>>>> {
  return request({ url: '/api/product/list', method: 'get', params })
}

export function getProductDetail(id: number): Promise<ApiResponse<Record<string, unknown>>> {
  return request({ url: `/api/product/detail/${id}`, method: 'get' })
}

export function createProduct(data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return request({ url: '/api/product/create', method: 'post', data })
}

export function updateProduct(id: number, data: Record<string, unknown>): Promise<ApiResponse<void>> {
  return request({ url: `/api/product/update/${id}`, method: 'put', data })
}

export function deleteProduct(id: number): Promise<ApiResponse<void>> {
  return request({ url: `/api/product/delete/${id}`, method: 'delete' })
}

export function batchUpdateStatus(ids: number[], status: number): Promise<ApiResponse<void>> {
  return request({ url: '/api/product/batch/status', method: 'put', data: { ids, status } })
}

export function batchUpdateStock(data: Record<string, unknown>): Promise<ApiResponse<void>> {
  return request({ url: '/api/product/batch/stock', method: 'put', data })
}

export function batchUpdatePrice(data: Record<string, unknown>): Promise<ApiResponse<void>> {
  return request({ url: '/api/product/batch/price', method: 'put', data })
}

export function getRecycleList(params?: ListParams): Promise<ApiResponse<ListResult<Record<string, unknown>>>> {
  return request({ url: '/api/product/recycle/list', method: 'get', params })
}

export function restoreProduct(id: number): Promise<ApiResponse<void>> {
  return request({ url: `/api/product/recycle/restore/${id}`, method: 'put' })
}

export function permanentDelete(id: number): Promise<ApiResponse<void>> {
  return request({ url: `/api/product/recycle/delete/${id}`, method: 'delete' })
}

export function clearRecycle(): Promise<ApiResponse<void>> {
  return request({ url: '/api/product/recycle/clear', method: 'delete' })
}

export function getMaterialList(params?: ListParams): Promise<ApiResponse<ListResult<Record<string, unknown>>>> {
  return request({ url: '/api/product/material/list', method: 'get', params })
}

export function uploadMaterial(data: FormData): Promise<ApiResponse<Record<string, unknown>>> {
  return request({ url: '/api/product/material/upload', method: 'post', data, headers: { 'Content-Type': 'multipart/form-data' } })
}

export function deleteMaterial(id: number): Promise<ApiResponse<void>> {
  return request({ url: `/api/product/material/delete/${id}`, method: 'delete' })
}

export function moveMaterial(id: number, folderId: number): Promise<ApiResponse<void>> {
  return request({ url: `/api/product/material/move/${id}`, method: 'put', data: { folderId } })
}

export function getMaterialFolders(): Promise<ApiResponse<Record<string, unknown>[]>> {
  return request({ url: '/api/product/material/folders', method: 'get' })
}