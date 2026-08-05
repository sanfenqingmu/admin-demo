import { request } from '@/utils/request'
import type { ApiResponse, FlowRecord, TransactionSummary, ReconcileRecord, InvoiceRecord, ListParams, ListResult } from '@/types'

export function getFinanceFlowList(params?: ListParams): Promise<ApiResponse<ListResult<FlowRecord>>> {
  return request({ url: '/api/finance/flow/list', method: 'get', params })
}

export function getFinanceSummary(params?: ListParams): Promise<ApiResponse<TransactionSummary>> {
  return request({ url: '/api/finance/flow/summary', method: 'get', params })
}

export function exportFinanceFlow(params?: ListParams): Promise<ApiResponse<Record<string, unknown>>> {
  return request({ url: '/api/finance/flow/export', method: 'get', params })
}

export function getReconcileList(params?: ListParams): Promise<ApiResponse<ListResult<ReconcileRecord>>> {
  return request({ url: '/api/finance/reconcile/list', method: 'get', params })
}

export function getReconcileDetail(id: number): Promise<ApiResponse<ReconcileRecord>> {
  return request({ url: `/api/finance/reconcile/detail/${id}`, method: 'get' })
}

export function reviewReconcile(id: number, data: { status: number; remark?: string }): Promise<ApiResponse<void>> {
  return request({ url: `/api/finance/reconcile/review/${id}`, method: 'put', data })
}

export function getInvoiceList(params?: ListParams): Promise<ApiResponse<ListResult<InvoiceRecord>>> {
  return request({ url: '/api/finance/invoice/list', method: 'get', params })
}

export function reviewInvoice(id: number, data: { status: number; remark?: string }): Promise<ApiResponse<void>> {
  return request({ url: `/api/finance/invoice/review/${id}`, method: 'put', data })
}

export function getInvoiceDetail(id: number): Promise<ApiResponse<InvoiceRecord>> {
  return request({ url: `/api/finance/invoice/detail/${id}`, method: 'get' })
}