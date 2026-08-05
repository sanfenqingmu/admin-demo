<template>
  <a-card>
    <a-row :gutter="16" class="summary-cards">
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card stat-income">
          <a-statistic title="总收入" :value="summary.totalIncome" prefix="¥" :precision="2" :value-style="{ color: '#52c41a' }" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card stat-expense">
          <a-statistic title="总支出" :value="summary.totalExpense" prefix="¥" :precision="2" :value-style="{ color: '#ff4d4f' }" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card stat-net">
          <a-statistic title="净收入" :value="summary.netAmount" prefix="¥" :precision="2" :value-style="{ color: Number(summary.netAmount) >= 0 ? '#52c41a' : '#ff4d4f' }" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card stat-count">
          <a-statistic title="交易笔数" :value="summary.totalCount" suffix="笔" />
        </a-card>
      </a-col>
    </a-row>

    <div class="filter-bar">
      <a-row :gutter="16">
        <a-col :span="5">
          <a-input v-model:value="filters.keyword" placeholder="流水号/订单号/用户" allow-clear @pressEnter="handleSearch">
            <template #prefix><SearchOutlined /></template>
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-select v-model:value="filters.type" placeholder="收支类型" allow-clear>
            <a-select-option value="income">收入</a-select-option>
            <a-select-option value="expense">支出</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="8">
          <a-range-picker v-model:value="filters.dateRange" show-time format="YYYY-MM-DD" />
        </a-col>
        <a-col :span="7">
          <a-space>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
            <a-button @click="handleExport" v-permission="'finance:export'"><DownloadOutlined /> 导出</a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <a-table :columns="columns" :data-source="tableData" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'type'">
          <a-tag :color="record.type === 'income' ? 'green' : 'red'">{{ record.typeText }}</a-tag>
        </template>
        <template v-else-if="column.key === 'amount'">
          <span :class="record.type === 'income' ? 'text-green' : 'text-red'">
            {{ record.type === 'income' ? '+' : '' }}¥{{ record.amount }}
          </span>
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import { getFinanceFlowList, getFinanceSummary, exportFinanceFlow } from '@/api/finance'
import { useTable, usePermission } from '@/hooks'
import type { FlowRecord, ListParams } from '@/types'

const { hasPermission } = usePermission()

const summary = reactive({ totalIncome: '0', totalExpense: '0', netAmount: '0', totalCount: 0 })

const { loading, tableData, pagination, filters, handleTableChange, handleSearch, handleReset, loadData } = useTable<FlowRecord>({
  fetchData: async (params: ListParams) => {
    const apiParams: Record<string, unknown> = { ...params }
    if (filters.keyword) apiParams.keyword = filters.keyword
    if (filters.type) apiParams.type = filters.type
    if (filters.dateRange && filters.dateRange.length === 2) {
      apiParams.startDate = filters.dateRange[0]?.format?.('YYYY-MM-DD')
      apiParams.endDate = filters.dateRange[1]?.format?.('YYYY-MM-DD')
    }
    const [res, sumRes] = await Promise.all([getFinanceFlowList(apiParams), getFinanceSummary(apiParams)])
    Object.assign(summary, sumRes.data)
    return { data: res.data }
  },
  defaultParams: { keyword: '', type: undefined, dateRange: null }
})

const columns = [
  { title: '流水号', dataIndex: 'flowNo', width: 170 },
  { title: '收支类型', key: 'type', width: 90 },
  { title: '来源', dataIndex: 'source', width: 120 },
  { title: '金额', key: 'amount', width: 130 },
  { title: '支付方式', dataIndex: 'payMethod', width: 100 },
  { title: '关联订单', dataIndex: 'orderNo', width: 150 },
  { title: '用户', dataIndex: 'userName', width: 100 },
  { title: '账户余额', dataIndex: 'balance', width: 120, customRender: ({ record }: { record: FlowRecord }) => `¥${record.balance}` },
  { title: '时间', dataIndex: 'createTime', width: 170 }
]

async function handleExport() {
  await exportFinanceFlow(filters)
  message.success('导出任务已创建')
}

onMounted(() => { loadData() })
</script>

<style lang="scss" scoped>
.summary-cards { margin-bottom: 16px; }
.stat-card { border-radius: 8px; }
.stat-income { background: linear-gradient(135deg, #f6ffed, #d9f7be); }
.stat-expense { background: linear-gradient(135deg, #fff1f0, #ffccc7); }
.stat-net { background: linear-gradient(135deg, #e6f4ff, #bae0ff); }
.stat-count { background: linear-gradient(135deg, #f9f0ff, #efdbff); }
.filter-bar { margin-bottom: 16px; }
.text-green { color: #52c41a; font-weight: 600; }
.text-red { color: #ff4d4f; font-weight: 600; }
</style>