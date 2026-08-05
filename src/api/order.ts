import { request } from '@/utils/request'
import type { ApiResponse, OrderRecord, AfterSaleRecord, ReviewRecord, ConsultRecord, ListParams, ListResult } from '@/types'

export function getOrderList(params?: ListParams): Promise<ApiResponse<ListResult<OrderRecord>>> {
  return request({ url: '/api/order/list', method: 'get', params })
}

export function getOrderDetail(id: number): Promise<ApiResponse<OrderRecord>> {
  return request({ url: `/api/order/detail/${id}`, method: 'get' })
}

export function shipOrder(id: number, data: Record<string, unknown>): Promise<ApiResponse<void>> {
  return request({ url: `/api/order/ship/${id}`, method: 'put', data })
}

export function addOrderRemark(id: number, remark: string): Promise<ApiResponse<void>> {
  return request({ url: `/api/order/remark/${id}`, method: 'put', data: { remark } })
}

export function closeOrder(id: number): Promise<ApiResponse<void>> {
  return request({ url: `/api/order/close/${id}`, method: 'put' })
}

export function getAfterSaleList(params?: ListParams): Promise<ApiResponse<ListResult<AfterSaleRecord>>> {
  return request({ url: '/api/order/after-sale/list', method: 'get', params })
}

export function reviewAfterSale(id: number, data: { status: number; reason?: string }): Promise<ApiResponse<void>> {
  return request({ url: `/api/order/after-sale/review/${id}`, method: 'put', data })
}

export function getReviewList(params?: ListParams): Promise<ApiResponse<ListResult<ReviewRecord>>> {
  return request({ url: '/api/order/review/list', method: 'get', params })
}

export function replyReview(id: number, reply: string): Promise<ApiResponse<void>> {
  return request({ url: `/api/order/review/reply/${id}`, method: 'put', data: { reply } })
}

export function hideReview(id: number): Promise<ApiResponse<void>> {
  return request({ url: `/api/order/review/hide/${id}`, method: 'put' })
}

export function getConsultList(params?: ListParams): Promise<ApiResponse<ListResult<ConsultRecord>>> {
  return request({ url: '/api/order/consult/list', method: 'get', params })
}

export function replyConsult(id: number, reply: string): Promise<ApiResponse<void>> {
  return request({ url: `/api/order/consult/reply/${id}`, method: 'put', data: { reply } })
}

export function deleteConsult(id: number): Promise<ApiResponse<void>> {
  return request({ url: `/api/order/consult/delete/${id}`, method: 'delete' })
}