<template>
  <a-card>
    <div class="filter-bar">
      <a-row :gutter="16">
        <a-col :span="4">
          <a-select v-model:value="filters.status" placeholder="对账状态" allow-clear>
            <a-select-option :value="0">待对账</a-select-option>
            <a-select-option :value="1">已对账</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="8">
          <a-range-picker v-model:value="filters.dateRange" format="YYYY-MM-DD" />
        </a-col>
        <a-col :span="12">
          <a-space>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
            <a-button @click="exportData" v-permission="'finance:export'"><DownloadOutlined /> 导出</a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <a-table :columns="columns" :data-source="tableData" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'income'">
          <span class="text-green">¥{{ record.totalIncome }}</span>
        </template>
        <template v-else-if="column.key === 'expense'">
          <span class="text-red">¥{{ record.totalExpense }}</span>
        </template>
        <template v-else-if="column.key === 'netAmount'">
          <span :class="Number(record.netAmount) >= 0 ? 'text-green' : 'text-red'">¥{{ record.netAmount }}</span>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="record.status === 1 ? 'green' : 'orange'">{{ record.statusText }}</a-tag>
        </template>
        <template v-else-if="column.key === 'matchInfo'">
          <span>{{ record.matchedCount }}/{{ record.orderCount }}</span>
          <a-tag v-if="record.matchedCount < record.orderCount" color="red" size="small" style="margin-left: 4px">差异</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="viewDetail(record)" v-permission="'finance:reconcile:detail'">明细</a-button>
            <a-button v-if="record.status === 0" type="link" size="small" @click="handleReview(record)" v-permission="'finance:reconcile:review'">对账</a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-drawer v-model:open="detailVisible" title="对账明细" width="720px">
      <div v-if="currentRecord" style="margin-bottom: 16px">
        <a-descriptions :column="2" bordered size="small">
          <a-descriptions-item label="批次号">{{ currentRecord.batchNo }}</a-descriptions-item>
          <a-descriptions-item label="对账日期">{{ currentRecord.date }}</a-descriptions-item>
          <a-descriptions-item label="总收入">¥{{ currentRecord.totalIncome }}</a-descriptions-item>
          <a-descriptions-item label="总支出">¥{{ currentRecord.totalExpense }}</a-descriptions-item>
          <a-descriptions-item label="净收入">¥{{ currentRecord.netAmount }}</a-descriptions-item>
          <a-descriptions-item label="订单数">{{ currentRecord.orderCount }}</a-descriptions-item>
          <a-descriptions-item label="状态">{{ currentRecord.statusText }}</a-descriptions-item>
          <a-descriptions-item label="操作人">{{ currentRecord.operator }}</a-descriptions-item>
        </a-descriptions>
      </div>
      <a-table :columns="detailColumns" :data-source="detailList" :pagination="false" row-key="id" size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'amount'">
            <span class="text-green">¥{{ record.amount }}</span>
          </template>
          <template v-else-if="column.key === 'matched'">
            <a-tag :color="record.matched ? 'green' : 'red'">{{ record.matched ? '已匹配' : '未匹配' }}</a-tag>
          </template>
        </template>
      </a-table>
    </a-drawer>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { DownloadOutlined } from '@ant-design/icons-vue'
import { getReconcileList, getReconcileDetail, reviewReconcile } from '@/api/finance'
import { useTable, usePermission } from '@/hooks'
import type { ReconcileRecord, ListParams } from '@/types'

const { hasPermission } = usePermission()

const { loading, tableData, pagination, filters, handleTableChange, handleSearch, handleReset, loadData } = useTable<ReconcileRecord>({
  fetchData: async (params: ListParams) => {
    const apiParams: Record<string, unknown> = { ...params }
    if (filters.status !== undefined) apiParams.status = filters.status
    if (filters.dateRange && filters.dateRange.length === 2) {
      apiParams.startDate = filters.dateRange[0]?.format?.('YYYY-MM-DD')
      apiParams.endDate = filters.dateRange[1]?.format?.('YYYY-MM-DD')
    }
    const res = await getReconcileList(apiParams)
    return { data: res.data }
  },
  defaultParams: { status: undefined, dateRange: null }
})

const detailVisible = ref(false)
const currentRecord = ref<ReconcileRecord | null>(null)
const detailList = ref<any[]>([])

const columns = [
  { title: '批次号', dataIndex: 'batchNo', width: 140 },
  { title: '对账日期', dataIndex: 'date', width: 120 },
  { title: '总收入', key: 'income', width: 120 },
  { title: '总支出', key: 'expense', width: 120 },
  { title: '净收入', key: 'netAmount', width: 120 },
  { title: '订单数', dataIndex: 'orderCount', width: 80 },
  { title: '匹配情况', key: 'matchInfo', width: 120 },
  { title: '状态', key: 'status', width: 90 },
  { title: '操作人', dataIndex: 'operator', width: 90 },
  { title: '操作', key: 'action', width: 130, fixed: 'right' as const }
]

const detailColumns = [
  { title: '订单号', dataIndex: 'orderNo', width: 150 },
  { title: '金额', key: 'amount', width: 100 },
  { title: '支付方式', dataIndex: 'payMethod', width: 100 },
  { title: '下单时间', dataIndex: 'orderTime', width: 170 },
  { title: '支付时间', dataIndex: 'payTime', width: 170 },
  { title: '匹配状态', key: 'matched', width: 90 }
]

function exportData() { message.success('导出任务已创建') }

async function viewDetail(record: ReconcileRecord) {
  currentRecord.value = record
  detailVisible.value = true
  const res = await getReconcileDetail(record.id)
  detailList.value = res.data.details || []
}

async function handleReview(record: ReconcileRecord) {
  await reviewReconcile(record.id, { status: 1 })
  message.success('对账成功')
  loadData()
}

onMounted(() => { loadData() })
</script>

<style lang="scss" scoped>
.filter-bar { margin-bottom: 16px; }
.text-green { color: #52c41a; font-weight: 600; }
.text-red { color: #ff4d4f; font-weight: 600; }
</style>