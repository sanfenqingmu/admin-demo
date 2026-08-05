import { request } from '@/utils/request'
import type { ApiResponse, SalesRankingRecord, TransactionSummary, TransactionTrend, ListParams, ListResult } from '@/types'

export function getSalesRanking(params?: ListParams): Promise<ApiResponse<ListResult<SalesRankingRecord>>> {
  return request({ url: '/api/report/sales-ranking', method: 'get', params })
}

export function getTransactionStats(params?: ListParams): Promise<ApiResponse<TransactionSummary>> {
  return request({ url: '/api/report/transaction-stats', method: 'get', params })
}

export function getTransactionTrend(params?: ListParams): Promise<ApiResponse<TransactionTrend>> {
  return request({ url: '/api/report/transaction-trend', method: 'get', params })
}

export function exportSalesRanking(params?: ListParams): Promise<ApiResponse<Record<string, unknown>>> {
  return request({ url: '/api/report/sales-ranking/export', method: 'get', params })
}

export function exportTransactionStats(params?: ListParams): Promise<ApiResponse<Record<string, unknown>>> {
  return request({ url: '/api/report/transaction-stats/export', method: 'get', params })
}