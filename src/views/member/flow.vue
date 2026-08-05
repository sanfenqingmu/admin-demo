<template>
  <a-card>
    <a-tabs v-model:active-key="activeTab" @change="handleTabChange">
      <a-tab-pane key="points" tab="积分流水">
        <div class="filter-bar">
          <a-row :gutter="16">
            <a-col :span="6">
              <a-input v-model:value="filters.keyword" placeholder="搜索会员名称" allow-clear @pressEnter="handleSearch">
                <template #prefix><SearchOutlined /></template>
              </a-input>
            </a-col>
            <a-col :span="4">
              <a-select v-model:value="filters.type" placeholder="流水类型" allow-clear>
                <a-select-option value="earn">获得积分</a-select-option>
                <a-select-option value="spend">消耗积分</a-select-option>
                <a-select-option value="adjust">管理员调整</a-select-option>
              </a-select>
            </a-col>
            <a-col :span="6">
              <a-range-picker v-model:value="filters.dateRange" show-time format="YYYY-MM-DD" />
            </a-col>
            <a-col :span="8">
              <a-space>
                <a-button type="primary" @click="handleSearch">搜索</a-button>
                <a-button @click="handleReset">重置</a-button>
                <a-button @click="exportData">导出</a-button>
              </a-space>
            </a-col>
          </a-row>
        </div>

        <a-table :columns="pointsColumns" :data-source="tableData" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'type'">
              <a-tag :color="record.type === 'earn' ? 'green' : record.type === 'spend' ? 'red' : 'blue'">{{ record.typeText }}</a-tag>
            </template>
            <template v-else-if="column.key === 'points'">
              <span :class="record.points > 0 ? 'text-green' : 'text-red'">
                {{ record.points > 0 ? '+' : '' }}{{ record.points }}
              </span>
            </template>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="balance" tab="余额流水">
        <div class="filter-bar">
          <a-row :gutter="16">
            <a-col :span="6">
              <a-input v-model:value="filters.keyword" placeholder="搜索会员名称" allow-clear @pressEnter="handleSearch">
                <template #prefix><SearchOutlined /></template>
              </a-input>
            </a-col>
            <a-col :span="4">
              <a-select v-model:value="filters.type" placeholder="流水类型" allow-clear>
                <a-select-option value="recharge">充值</a-select-option>
                <a-select-option value="consume">消费</a-select-option>
                <a-select-option value="refund">退款</a-select-option>
                <a-select-option value="adjust">管理员调整</a-select-option>
              </a-select>
            </a-col>
            <a-col :span="6">
              <a-range-picker v-model:value="filters.dateRange" show-time format="YYYY-MM-DD" />
            </a-col>
            <a-col :span="8">
              <a-space>
                <a-button type="primary" @click="handleSearch">搜索</a-button>
                <a-button @click="handleReset">重置</a-button>
                <a-button @click="exportData">导出</a-button>
              </a-space>
            </a-col>
          </a-row>
        </div>

        <a-table :columns="balanceColumns" :data-source="tableData" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'type'">
              <a-tag :color="record.type === 'recharge' ? 'green' : record.type === 'consume' ? 'red' : record.type === 'refund' ? 'blue' : 'orange'">{{ record.typeText }}</a-tag>
            </template>
            <template v-else-if="column.key === 'amount'">
              <span :class="record.amount.startsWith('-') ? 'text-red' : 'text-green'">
                {{ record.amount.startsWith('-') ? '' : '+' }}¥{{ record.amount }}
              </span>
            </template>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import { getPointsFlow, getBalanceFlow } from '@/api/member'
import { useTable, usePermission } from '@/hooks'
import type { FlowRecord, ListParams } from '@/types'

const { hasPermission } = usePermission()

const activeTab = ref('points')

const { loading, tableData, pagination, filters, handleTableChange, handleSearch, handleReset, loadData } = useTable({
  fetchData: async (params: ListParams) => {
    const apiParams: Record<string, unknown> = { ...params }
    if (filters.keyword) apiParams.keyword = filters.keyword
    if (filters.type) apiParams.type = filters.type
    if (filters.dateRange && filters.dateRange.length === 2) {
      apiParams.startTime = filters.dateRange[0]?.format?.('YYYY-MM-DD')
      apiParams.endTime = filters.dateRange[1]?.format?.('YYYY-MM-DD')
    }
    if (activeTab.value === 'points') {
      const res = await getPointsFlow(apiParams)
      return { data: res.data }
    } else {
      const res = await getBalanceFlow(apiParams)
      return { data: res.data }
    }
  },
  defaultParams: { keyword: '', type: undefined, dateRange: null }
})

const pointsColumns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '会员', dataIndex: 'memberName', width: 120 },
  { title: '流水类型', key: 'type', width: 120 },
  { title: '积分变动', key: 'points', width: 120 },
  { title: '积分余额', dataIndex: 'balance', width: 120 },
  { title: '备注', dataIndex: 'remark' },
  { title: '时间', dataIndex: 'createTime', width: 170 }
]

const balanceColumns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '会员', dataIndex: 'memberName', width: 120 },
  { title: '流水类型', key: 'type', width: 120 },
  { title: '金额变动', key: 'amount', width: 130 },
  { title: '账户余额', dataIndex: 'balance', width: 120, customRender: ({ record }: { record: FlowRecord }) => `¥${record.balance}` },
  { title: '备注', dataIndex: 'remark' },
  { title: '时间', dataIndex: 'createTime', width: 170 }
]

function handleTabChange() {
  pagination.current = 1
  loadData()
}

function exportData() {
  message.success('导出任务已创建，请稍后在下载中心查看')
}

onMounted(() => { loadData() })
</script>

<style lang="scss" scoped>
.filter-bar { margin-bottom: 16px; }
.text-green { color: #52c41a; font-weight: 500; }
.text-red { color: #ff4d4f; font-weight: 500; }
</style>