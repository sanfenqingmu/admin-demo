<template>
  <a-card>
    <div class="filter-bar">
      <a-row :gutter="16">
        <a-col :span="5">
          <a-input v-model:value="filters.keyword" placeholder="搜索订单号" allow-clear @pressEnter="handleSearch">
            <template #prefix><SearchOutlined /></template>
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-select v-model:value="filters.status" placeholder="审核状态" allow-clear>
            <a-select-option :value="0">待审核</a-select-option>
            <a-select-option :value="1">已同意</a-select-option>
            <a-select-option :value="2">已拒绝</a-select-option>
            <a-select-option :value="3">处理中</a-select-option>
            <a-select-option :value="4">已完成</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select v-model:value="filters.type" placeholder="售后类型" allow-clear>
            <a-select-option :value="1">仅退款</a-select-option>
            <a-select-option :value="2">退货退款</a-select-option>
            <a-select-option :value="3">换货</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="11">
          <a-space>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <a-table :columns="columns" :data-source="tableData" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'type'">
          <a-tag color="blue">{{ record.typeText }}</a-tag>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">{{ record.statusText }}</a-tag>
        </template>
        <template v-else-if="column.key === 'amount'">
          <span class="amount">¥{{ record.amount }}</span>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button v-if="record.status === 0" v-permission="'aftersale:approve'" type="link" size="small" @click="handleApprove(record)">同意</a-button>
            <a-button v-if="record.status === 0" v-permission="'aftersale:reject'" type="link" size="small" danger @click="handleReject(record)">拒绝</a-button>
            <a-button v-if="record.status === 4" v-permission="'aftersale:complete'" type="link" size="small" @click="handleComplete(record)">完成</a-button>
            <a-button type="link" size="small" @click="viewDetail(record)">详情</a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-drawer v-model:open="detailVisible" title="售后详情" width="500px">
      <a-descriptions v-if="currentRecord" :column="1" bordered size="small">
        <a-descriptions-item label="售后类型">{{ currentRecord.typeText }}</a-descriptions-item>
        <a-descriptions-item label="关联订单">{{ currentRecord.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="商品名称">{{ currentRecord.productName }}</a-descriptions-item>
        <a-descriptions-item label="退款金额">¥{{ currentRecord.amount }}</a-descriptions-item>
        <a-descriptions-item label="申请原因">{{ currentRecord.reason }}</a-descriptions-item>
        <a-descriptions-item label="状态">{{ currentRecord.statusText }}</a-descriptions-item>
        <a-descriptions-item label="申请时间">{{ currentRecord.createTime }}</a-descriptions-item>
      </a-descriptions>
    </a-drawer>

    <a-modal v-model:open="rejectVisible" title="拒绝售后申请" @ok="handleRejectSubmit" @cancel="closeReject" width="400px" :confirm-loading="submitting">
      <a-form layout="vertical">
        <a-form-item label="拒绝原因" required>
          <a-textarea v-model:value="rejectForm.reason" :rows="3" placeholder="请输入拒绝原因" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import { getAfterSaleList, reviewAfterSale } from '@/api/order'
import { useTable, useFormModal, usePermission } from '@/hooks'
import type { AfterSaleRecord, ListParams } from '@/types'

const { hasPermission } = usePermission()
const detailVisible = ref(false)
const currentRecord = ref<AfterSaleRecord | null>(null)

async function fetchAfterSaleList(params: ListParams) {
  return getAfterSaleList(params)
}

const { loading, tableData, pagination, filters, handleTableChange, handleSearch, handleReset, refresh } = useTable<AfterSaleRecord>({
  fetchData: fetchAfterSaleList,
  defaultParams: { keyword: '', status: undefined as number | undefined, type: undefined as number | undefined }
})

const { visible: rejectVisible, formData: rejectForm, close: closeReject, submitting } = useFormModal({ reason: '' })

const columns = [
  { title: '售后编号', dataIndex: 'id', width: 80 },
  { title: '订单号', dataIndex: 'orderNo', width: 160 },
  { title: '商品', dataIndex: 'productName', width: 150 },
  { title: '售后类型', key: 'type', width: 100 },
  { title: '申请原因', dataIndex: 'reason', width: 150 },
  { title: '退款金额', key: 'amount', width: 110 },
  { title: '状态', key: 'status', width: 90 },
  { title: '申请时间', dataIndex: 'createTime', width: 170 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' as const }
]

function getStatusColor(status: number): string {
  const colors: Record<number, string> = { 0: 'orange', 1: 'green', 2: 'red', 3: 'blue', 4: 'default' }
  return colors[status] || 'default'
}

function viewDetail(record: AfterSaleRecord) { currentRecord.value = record; detailVisible.value = true }

async function handleApprove(record: AfterSaleRecord) {
  await reviewAfterSale(record.id, { status: 1 })
  message.success('已同意售后申请')
  refresh()
}

function handleReject(record: AfterSaleRecord) {
  currentRecord.value = record
  rejectForm.reason = ''
  rejectVisible.value = true
}

async function handleRejectSubmit() {
  if (!rejectForm.reason) { message.error('请输入拒绝原因'); return }
  await reviewAfterSale(currentRecord.value!.id, { status: 2, reason: rejectForm.reason })
  message.success('已拒绝售后申请')
  closeReject()
  refresh()
}

async function handleComplete(record: AfterSaleRecord) {
  await reviewAfterSale(record.id, { status: 4 })
  message.success('已标记为完成')
  refresh()
}
</script>

<style lang="scss" scoped>
.filter-bar { margin-bottom: 16px; }
.amount { color: #ff4d4f; font-weight: 600; }
</style>