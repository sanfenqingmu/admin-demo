<template>
  <a-card>
    <div class="filter-bar">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-input v-model:value="filters.keyword" placeholder="搜索昵称/手机号" allow-clear @pressEnter="handleSearch">
            <template #prefix><SearchOutlined /></template>
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-select v-model:value="filters.status" placeholder="账号状态" allow-clear>
            <a-select-option :value="1">正常</a-select-option>
            <a-select-option :value="0">已冻结</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select v-model:value="filters.levelId" placeholder="会员等级" allow-clear>
            <a-select-option v-for="lv in levelOptions" :key="lv.id" :value="lv.id">{{ lv.name }}</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="10">
          <a-space>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <a-table :columns="columns" :data-source="tableData" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'avatar'">
          <div class="avatar-placeholder"><UserOutlined /></div>
        </template>
        <template v-else-if="column.key === 'level'">
          <a-tag :color="getLevelColor(record.levelId)">{{ record.levelName }}</a-tag>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="record.status === 1 ? 'green' : 'red'">{{ record.status === 1 ? '正常' : '已冻结' }}</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="viewDetail(record)" v-permission="'member:detail'">详情</a-button>
            <a-button type="link" size="small" @click="viewOrders(record)" v-permission="'member:orders'">订单</a-button>
            <a-button v-if="record.status === 1" type="link" size="small" danger @click="handleFreeze(record)" v-permission="'member:freeze'">冻结</a-button>
            <a-button v-else type="link" size="small" style="color: #52c41a" @click="handleUnfreeze(record)" v-permission="'member:unfreeze'">解禁</a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-drawer v-model:open="detailVisible" title="会员详情" width="600px">
      <a-descriptions v-if="currentMember" :column="2" bordered size="small">
        <a-descriptions-item label="ID">{{ currentMember.id }}</a-descriptions-item>
        <a-descriptions-item label="昵称">{{ currentMember.nickname }}</a-descriptions-item>
        <a-descriptions-item label="手机号">{{ currentMember.phone }}</a-descriptions-item>
        <a-descriptions-item label="等级">{{ currentMember.levelName }}</a-descriptions-item>
        <a-descriptions-item label="积分">{{ currentMember.points }}</a-descriptions-item>
        <a-descriptions-item label="余额">¥{{ currentMember.balance }}</a-descriptions-item>
        <a-descriptions-item label="累计消费">¥{{ currentMember.totalSpent }}</a-descriptions-item>
        <a-descriptions-item label="订单数">{{ currentMember.orderCount }}</a-descriptions-item>
        <a-descriptions-item label="注册时间" :span="2">{{ currentMember.registerTime }}</a-descriptions-item>
        <a-descriptions-item label="最后登录" :span="2">{{ currentMember.lastLoginTime }}</a-descriptions-item>
      </a-descriptions>
    </a-drawer>

    <a-drawer v-model:open="orderVisible" title="会员订单" width="700px">
      <div v-if="currentMember" style="margin-bottom: 12px; color: #666;">会员：{{ currentMember.nickname }}</div>
      <a-table :columns="orderColumns" :data-source="orderList" :pagination="false" row-key="id" size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 0 ? 'orange' : record.status === 1 ? 'blue' : 'green'">
              {{ record.status === 0 ? '待付款' : record.status === 1 ? '已付款' : '已完成' }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </a-drawer>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, UserOutlined } from '@ant-design/icons-vue'
import { getMemberList, freezeMember, unfreezeMember, getMemberOrders, getLevelList } from '@/api/member'
import { useTable, usePermission } from '@/hooks'
import type { MemberRecord as MemberRecordType, MemberLevel, ListParams } from '@/types'

interface MemberRecord extends MemberRecordType {
  phone: string
  levelId: number
  lastNameTime: string
}

const { hasPermission } = usePermission()

const { loading, tableData, pagination, filters, handleTableChange, handleSearch, handleReset, loadData } = useTable<MemberRecord>({
  fetchData: async (params: ListParams) => {
    const res = await getMemberList(params)
    return { data: res.data }
  },
  defaultParams: { keyword: '', status: undefined, levelId: undefined }
})

const levelOptions = ref<MemberLevel[]>([])
const currentMember = ref<MemberRecord | null>(null)
const detailVisible = ref(false)
const orderVisible = ref(false)
const orderList = ref<any[]>([])

const columns = [
  { title: '头像', key: 'avatar', width: 80 },
  { title: '昵称', dataIndex: 'nickname', width: 120 },
  { title: '手机号', dataIndex: 'phone', width: 130 },
  { title: '等级', key: 'level', width: 110 },
  { title: '积分', dataIndex: 'points', width: 100 },
  { title: '余额', dataIndex: 'balance', width: 100, customRender: ({ record }: { record: MemberRecord }) => `¥${record.balance}` },
  { title: '累计消费', dataIndex: 'totalSpent', width: 110, customRender: ({ record }: { record: MemberRecord }) => `¥${record.totalSpent}` },
  { title: '订单数', dataIndex: 'orderCount', width: 80 },
  { title: '状态', key: 'status', width: 80 },
  { title: '注册时间', dataIndex: 'registerTime', width: 170 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' as const }
]

const orderColumns = [
  { title: '订单号', dataIndex: 'orderNo' },
  { title: '商品', dataIndex: 'productName' },
  { title: '金额', dataIndex: 'amount', customRender: ({ record }: { record: any }) => `¥${record.amount}` },
  { title: '状态', key: 'status', width: 80 },
  { title: '下单时间', dataIndex: 'createTime' }
]

function getLevelColor(levelId: number): string {
  const colors: Record<number, string> = { 1: 'default', 2: 'blue', 3: 'orange', 4: 'red' }
  return colors[levelId] || 'default'
}

async function loadLevels() {
  const res = await getLevelList()
  levelOptions.value = res.data
}

function viewDetail(record: MemberRecord) {
  currentMember.value = record
  detailVisible.value = true
}

async function viewOrders(record: MemberRecord) {
  currentMember.value = record
  orderVisible.value = true
  const res = await getMemberOrders(record.id)
  orderList.value = res.data.list
}

async function handleFreeze(record: MemberRecord) {
  await freezeMember(record.id)
  message.success('已冻结该会员')
  loadData()
}

async function handleUnfreeze(record: MemberRecord) {
  await unfreezeMember(record.id)
  message.success('已解除冻结')
  loadData()
}

onMounted(() => { loadLevels() })
</script>

<style lang="scss" scoped>
.filter-bar { margin-bottom: 16px; }
.avatar-placeholder { width: 40px; height: 40px; background: #f5f5f5; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #999; font-size: 20px; }
</style>