<template>
  <a-card>
    <div class="header-bar">
      <a-space>
        <a-input v-model:value="filters.keyword" placeholder="搜索商品名称" style="width: 200px" allow-clear @pressEnter="handleSearch">
          <template #prefix><SearchOutlined /></template>
        </a-input>
        <a-button type="primary" @click="handleSearch">搜索</a-button>
      </a-space>
      <a-space>
        <span class="warning-text">⚠ 回收站商品将在30天后永久删除</span>
        <a-popconfirm title="确定清空回收站？此操作不可恢复！" @confirm="handleClear">
          <a-button v-permission="'product:recycle:clear'" danger><DeleteOutlined /> 清空回收站</a-button>
        </a-popconfirm>
      </a-space>
    </div>

    <a-table :columns="columns" :data-source="tableData" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'price'">
          <span style="color: #ff4d4f">¥{{ record.price }}</span>
        </template>
        <template v-else-if="column.key === 'remainDays'">
          <a-tag :color="record.remainDays <= 3 ? 'red' : 'orange'">{{ record.remainDays }} 天</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button v-permission="'product:recycle:restore'" type="link" size="small" @click="handleRestore(record)">恢复</a-button>
            <a-popconfirm title="确定永久删除？" @confirm="handlePermanentDelete(record)">
              <a-button v-permission="'product:recycle:delete'" type="link" size="small" danger>永久删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { getRecycleList, restoreProduct, permanentDelete, clearRecycle } from '@/api/product'
import { useTable, usePermission } from '@/hooks'
import type { ListParams, ListResult } from '@/types'

const { hasPermission } = usePermission()

interface RecycleRecord {
  id: number; name: string; categoryName: string; price: string; stock: number; deletedAt: string; remainDays: number
}

async function fetchRecycleList(params: ListParams) {
  const res = await getRecycleList(params)
  return { data: res.data as ListResult<RecycleRecord> }
}

const { loading, tableData, pagination, filters, handleTableChange, handleSearch, refresh } = useTable<RecycleRecord>({
  fetchData: fetchRecycleList,
  defaultParams: { keyword: '' }
})

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '商品名称', dataIndex: 'name' },
  { title: '分类', dataIndex: 'categoryName', width: 120 },
  { title: '价格', dataIndex: 'price', width: 100, key: 'price' },
  { title: '库存', dataIndex: 'stock', width: 80 },
  { title: '删除时间', dataIndex: 'deletedAt', width: 170 },
  { title: '剩余天数', dataIndex: 'remainDays', width: 100, key: 'remainDays' },
  { title: '操作', key: 'action', width: 160 }
]

async function handleRestore(record: RecycleRecord) {
  await restoreProduct(record.id)
  message.success('商品已恢复')
  refresh()
}

async function handlePermanentDelete(record: RecycleRecord) {
  await permanentDelete(record.id)
  message.success('已永久删除')
  refresh()
}

function handleClear() {
  clearRecycle().then(() => { message.success('回收站已清空'); refresh() })
}
</script>

<style lang="scss" scoped>
.header-bar { display: flex; justify-content: space-between; margin-bottom: 16px; }
.warning-text { color: #faad14; font-size: 13px; }
</style>