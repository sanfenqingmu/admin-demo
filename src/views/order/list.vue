<template>
  <a-card>
    <div class="status-tabs">
      <a-radio-group v-model:value="filters.status" button-style="solid" @change="handleSearch">
        <a-radio-button :value="undefined">全部</a-radio-button>
        <a-radio-button :value="0">待付款</a-radio-button>
        <a-radio-button :value="1">待发货</a-radio-button>
        <a-radio-button :value="2">待收货</a-radio-button>
        <a-radio-button :value="3">已完成</a-radio-button>
        <a-radio-button :value="4">已关闭</a-radio-button>
      </a-radio-group>
    </div>

    <div class="filter-bar">
      <a-row :gutter="16">
        <a-col :span="5">
          <a-input v-model:value="filters.keyword" placeholder="订单号/收件人" allow-clear @pressEnter="handleSearch">
            <template #prefix><SearchOutlined /></template>
          </a-input>
        </a-col>
        <a-col :span="8">
          <a-range-picker v-model:value="filters.dateRange" show-time format="YYYY-MM-DD" />
        </a-col>
        <a-col :span="11">
          <a-space>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
            <a-button v-permission="'order:export'" @click="exportData">导出</a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <a-table :columns="columns" :data-source="tableData" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'product'">
          <div class="product-cell">
            <div class="product-thumb"><ShoppingOutlined /></div>
            <div>
              <div class="product-name">{{ record.productName }}</div>
              <div class="product-qty">x{{ record.quantity }}</div>
            </div>
          </div>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">{{ record.statusText }}</a-tag>
        </template>
        <template v-else-if="column.key === 'amount'">
          <span class="amount">¥{{ record.amount }}</span>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="goDetail(record)">详情</a-button>
            <a-button v-if="record.status === 1" v-permission="'order:ship'" type="link" size="small" @click="handleShip(record)">发货</a-button>
            <a-button v-if="record.status === 0" v-permission="'order:close'" type="link" size="small" style="color: #ff4d4f" @click="handleClose(record)">关闭</a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal v-model:open="shipVisible" title="手动发货" @ok="handleShipSubmit" @cancel="closeShip" width="500px" :confirm-loading="submitting">
      <a-form :model="shipForm" layout="vertical" ref="shipFormRef">
        <a-form-item label="物流公司" name="company" :rules="[{ required: true }]">
          <a-select v-model:value="shipForm.company" placeholder="选择物流公司">
            <a-select-option value="顺丰速运">顺丰速运</a-select-option>
            <a-select-option value="京东物流">京东物流</a-select-option>
            <a-select-option value="圆通快递">圆通快递</a-select-option>
            <a-select-option value="中通快递">中通快递</a-select-option>
            <a-select-option value="韵达快递">韵达快递</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="物流单号" name="trackingNo" :rules="[{ required: true }]">
          <a-input v-model:value="shipForm.trackingNo" placeholder="请输入物流单号" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { SearchOutlined, ShoppingOutlined } from '@ant-design/icons-vue'
import { getOrderList, shipOrder, closeOrder } from '@/api/order'
import { useTable, useFormModal, usePermission } from '@/hooks'
import type { OrderRecord, ListParams } from '@/types'

const router = useRouter()
const { hasPermission } = usePermission()
const currentOrderId = ref<number>(0)

async function fetchOrderList(params: ListParams) {
  const { dateRange, ...rest } = params
  const finalParams: Record<string, unknown> = { ...rest }
  if (dateRange && Array.isArray(dateRange) && dateRange.length === 2) {
    const dr = dateRange as Array<{ format?: (fmt: string) => string }>
    finalParams.startDate = dr[0]?.format?.('YYYY-MM-DD')
    finalParams.endDate = dr[1]?.format?.('YYYY-MM-DD')
  }
  return getOrderList(finalParams)
}

const { loading, tableData, pagination, filters, handleTableChange, handleSearch, handleReset, refresh } = useTable<OrderRecord>({
  fetchData: fetchOrderList,
  defaultParams: { keyword: '', status: undefined as number | undefined, dateRange: null as any }
})

const { visible: shipVisible, formRef: shipFormRef, formData: shipForm, close: closeShip, validate: validateShip, submitting } = useFormModal({ company: '', trackingNo: '' })

const columns = [
  { title: '订单号', dataIndex: 'orderNo', width: 160 },
  { title: '商品', key: 'product', width: 220 },
  { title: '收件人', dataIndex: 'receiver', width: 100 },
  { title: '联系电话', dataIndex: 'phone', width: 130 },
  { title: '收货地址', dataIndex: 'address' },
  { title: '支付方式', dataIndex: 'payMethod', width: 100 },
  { title: '订单金额', key: 'amount', width: 110 },
  { title: '状态', key: 'status', width: 90 },
  { title: '下单时间', dataIndex: 'createTime', width: 170 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' as const }
]

function getStatusColor(status: number): string {
  const colors: Record<number, string> = { 0: 'orange', 1: 'blue', 2: 'cyan', 3: 'green', 4: 'default' }
  return colors[status] || 'default'
}

function exportData() { message.success('导出任务已创建') }

function goDetail(record: OrderRecord) { router.push(`/order/detail/${record.id}`) }

function handleShip(record: OrderRecord) {
  currentOrderId.value = record.id
  shipForm.company = ''
  shipForm.trackingNo = ''
  shipVisible.value = true
}

async function handleShipSubmit() {
  if (!await validateShip()) return
  await shipOrder(currentOrderId.value, { ...shipForm })
  message.success('发货成功')
  closeShip()
  refresh()
}

async function handleClose(record: OrderRecord) {
  await closeOrder(record.id)
  message.success('订单已关闭')
  refresh()
}
</script>

<style lang="scss" scoped>
.status-tabs { margin-bottom: 16px; }
.filter-bar { margin-bottom: 16px; }
.product-cell { display: flex; align-items: center; gap: 8px; }
.product-thumb { width: 40px; height: 40px; background: #f5f5f5; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #999; }
.product-name { max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.product-qty { font-size: 12px; color: #999; }
.amount { color: #ff4d4f; font-weight: 600; }
</style>