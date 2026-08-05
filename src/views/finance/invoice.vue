<template>
  <a-card>
    <div class="filter-bar">
      <a-row :gutter="16">
        <a-col :span="5">
          <a-input v-model:value="filters.keyword" placeholder="搜索申请号/订单号/公司" allow-clear @pressEnter="handleSearch">
            <template #prefix><SearchOutlined /></template>
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-select v-model:value="filters.status" placeholder="申请状态" allow-clear>
            <a-select-option :value="0">待审核</a-select-option>
            <a-select-option :value="1">已开票</a-select-option>
            <a-select-option :value="2">已拒绝</a-select-option>
            <a-select-option :value="3">已寄出</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select v-model:value="filters.type" placeholder="发票类型" allow-clear>
            <a-select-option :value="1">增值税普票</a-select-option>
            <a-select-option :value="2">增值税专票</a-select-option>
            <a-select-option :value="3">电子发票</a-select-option>
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
        <template v-else-if="column.key === 'amount'">
          <span class="amount">¥{{ record.amount }}</span>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">{{ record.statusText }}</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="viewDetail(record)" v-permission="'finance:invoice:detail'">详情</a-button>
            <a-button v-if="record.status === 0" type="link" size="small" style="color: #52c41a" @click="handleApprove(record)" v-permission="'finance:invoice:approve'">开票</a-button>
            <a-button v-if="record.status === 0" type="link" size="small" danger @click="handleReject(record)" v-permission="'finance:invoice:reject'">拒绝</a-button>
            <a-button v-if="record.status === 1" type="link" size="small" @click="handleShip(record)" v-permission="'finance:invoice:ship'">寄出</a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-drawer v-model:open="detailVisible" title="发票详情" width="600px">
      <a-descriptions v-if="currentRecord" :column="1" bordered size="small">
        <a-descriptions-item label="申请编号">{{ currentRecord.applyNo }}</a-descriptions-item>
        <a-descriptions-item label="关联订单">{{ currentRecord.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="申请人">{{ currentRecord.userName }}</a-descriptions-item>
        <a-descriptions-item label="发票类型">{{ currentRecord.typeText }}</a-descriptions-item>
        <a-descriptions-item label="发票抬头">{{ currentRecord.title }}</a-descriptions-item>
        <a-descriptions-item label="税号">{{ currentRecord.taxNo }}</a-descriptions-item>
        <a-descriptions-item label="开票金额">¥{{ currentRecord.amount }}</a-descriptions-item>
        <a-descriptions-item label="电子邮箱">{{ currentRecord.email }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ currentRecord.phone }}</a-descriptions-item>
        <a-descriptions-item label="地址">{{ currentRecord.address }}</a-descriptions-item>
        <a-descriptions-item label="开户银行">{{ currentRecord.bankName }}</a-descriptions-item>
        <a-descriptions-item label="银行账号">{{ currentRecord.bankAccount }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(currentRecord.status)">{{ currentRecord.statusText }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="发票号码">{{ currentRecord.invoiceNo || '-' }}</a-descriptions-item>
        <a-descriptions-item label="快递公司">{{ currentRecord.expressCompany || '-' }}</a-descriptions-item>
        <a-descriptions-item label="快递单号">{{ currentRecord.expressNo || '-' }}</a-descriptions-item>
        <a-descriptions-item label="申请时间">{{ currentRecord.createTime }}</a-descriptions-item>
      </a-descriptions>
    </a-drawer>

    <a-modal v-model:open="invoiceVisible" title="开具发票" @ok="handleInvoiceSubmit" @cancel="invoiceVisible = false" width="450px">
      <a-form layout="vertical">
        <a-form-item label="发票号码" required>
          <a-input v-model:value="invoiceNo" placeholder="请输入发票号码" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="invoiceRemark" :rows="2" placeholder="备注（可选）" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:open="shipVisible" title="发票寄出" @ok="handleShipSubmit" @cancel="shipVisible = false" width="450px">
      <a-form layout="vertical">
        <a-form-item label="快递公司" required>
          <a-select v-model:value="shipForm.company" placeholder="选择快递公司">
            <a-select-option value="顺丰速运">顺丰速运</a-select-option>
            <a-select-option value="京东物流">京东物流</a-select-option>
            <a-select-option value="圆通快递">圆通快递</a-select-option>
            <a-select-option value="中通快递">中通快递</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="快递单号" required>
          <a-input v-model:value="shipForm.trackingNo" placeholder="请输入快递单号" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:open="rejectVisible" title="拒绝申请" @ok="handleRejectSubmit" @cancel="rejectVisible = false" width="400px">
      <a-form layout="vertical">
        <a-form-item label="拒绝原因" required>
          <a-textarea v-model:value="rejectReason" :rows="3" placeholder="请输入拒绝原因" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import { getInvoiceList, getInvoiceDetail, reviewInvoice } from '@/api/finance'
import { useTable, usePermission } from '@/hooks'
import type { InvoiceRecord, ListParams } from '@/types'

const { hasPermission } = usePermission()

const { loading, tableData, pagination, filters, handleTableChange, handleSearch, handleReset, loadData } = useTable<InvoiceRecord>({
  fetchData: async (params: ListParams) => {
    const apiParams: Record<string, unknown> = { ...params }
    if (filters.keyword) apiParams.keyword = filters.keyword
    if (filters.status !== undefined) apiParams.status = filters.status
    if (filters.type !== undefined) apiParams.type = filters.type
    const res = await getInvoiceList(apiParams)
    return { data: res.data }
  },
  defaultParams: { keyword: '', status: undefined, type: undefined }
})

const detailVisible = ref(false)
const invoiceVisible = ref(false)
const shipVisible = ref(false)
const rejectVisible = ref(false)
const currentRecord = ref<InvoiceRecord | null>(null)
const invoiceNo = ref('')
const invoiceRemark = ref('')
const rejectReason = ref('')
const shipForm = reactive({ company: '', trackingNo: '' })

const columns = [
  { title: '申请编号', dataIndex: 'applyNo', width: 160 },
  { title: '关联订单', dataIndex: 'orderNo', width: 140 },
  { title: '申请人', dataIndex: 'userName', width: 90 },
  { title: '发票类型', key: 'type', width: 100 },
  { title: '发票抬头', dataIndex: 'title', width: 180 },
  { title: '税号', dataIndex: 'taxNo', width: 160 },
  { title: '金额', key: 'amount', width: 100 },
  { title: '状态', key: 'status', width: 90 },
  { title: '申请时间', dataIndex: 'createTime', width: 170 },
  { title: '操作', key: 'action', width: 180, fixed: 'right' as const }
]

function getStatusColor(status: number): string {
  const colors: Record<number, string> = { 0: 'orange', 1: 'green', 2: 'red', 3: 'blue' }
  return colors[status] || 'default'
}

async function viewDetail(record: InvoiceRecord) {
  currentRecord.value = record
  detailVisible.value = true
  const res = await getInvoiceDetail(record.id)
  if (res.data) currentRecord.value = res.data
}

function handleApprove(record: InvoiceRecord) {
  currentRecord.value = record
  invoiceNo.value = ''
  invoiceRemark.value = ''
  invoiceVisible.value = true
}

async function handleInvoiceSubmit() {
  if (!invoiceNo.value) { message.error('请输入发票号码'); return }
  await reviewInvoice(currentRecord.value!.id, { status: 1, remark: invoiceNo.value })
  message.success('开票成功')
  invoiceVisible.value = false
  loadData()
}

function handleReject(record: InvoiceRecord) {
  currentRecord.value = record
  rejectReason.value = ''
  rejectVisible.value = true
}

async function handleRejectSubmit() {
  if (!rejectReason.value) { message.error('请输入拒绝原因'); return }
  await reviewInvoice(currentRecord.value!.id, { status: 2, remark: rejectReason.value })
  message.success('已拒绝申请')
  rejectVisible.value = false
  loadData()
}

function handleShip(record: InvoiceRecord) {
  currentRecord.value = record
  Object.assign(shipForm, { company: '', trackingNo: '' })
  shipVisible.value = true
}

async function handleShipSubmit() {
  if (!shipForm.company || !shipForm.trackingNo) { message.error('请填写完整快递信息'); return }
  await reviewInvoice(currentRecord.value!.id, { status: 3, remark: `${shipForm.company}|${shipForm.trackingNo}` })
  message.success('已标记寄出')
  shipVisible.value = false
  loadData()
}

onMounted(() => { loadData() })
</script>

<style lang="scss" scoped>
.filter-bar { margin-bottom: 16px; }
.amount { color: #ff4d4f; font-weight: 600; }
</style>