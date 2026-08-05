<template>
  <a-card>
    <div class="filter-bar">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-input v-model:value="filters.keyword" placeholder="搜索商品名称" allow-clear @pressEnter="handleSearch">
            <template #prefix><SearchOutlined /></template>
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-select v-model:value="filters.categoryId" placeholder="商品分类" allow-clear>
            <a-select-option v-for="cat in categoryOptions" :key="cat.id" :value="cat.id">{{ cat.name }}</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select v-model:value="filters.status" placeholder="商品状态" allow-clear>
            <a-select-option :value="1">上架</a-select-option>
            <a-select-option :value="0">下架</a-select-option>
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

    <div class="action-bar">
      <a-space>
        <a-button v-permission="'product:create'" type="primary" @click="goCreate"><PlusOutlined /> 新增商品</a-button>
        <a-dropdown>
          <a-button v-permission="'product:batch'" :disabled="selectedRowKeys.length === 0">
            批量操作 <DownOutlined />
          </a-button>
          <template #overlay>
            <a-menu @click="handleBatchAction">
              <a-menu-item key="on"><UpOutlined /> 批量上架</a-menu-item>
              <a-menu-item key="off"><DownOutlined /> 批量下架</a-menu-item>
              <a-menu-item key="stock"><InboxOutlined /> 批量改库存</a-menu-item>
              <a-menu-item key="price"><DollarOutlined /> 批量改价格</a-menu-item>
              <a-menu-item key="delete" danger v-permission="'product:batchDelete'"><DeleteOutlined /> 批量删除</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </a-space>
      <span class="selected-count" v-if="selectedCount > 0">已选 {{ selectedCount }} 项</span>
    </div>

    <a-table
      :columns="columns"
      :data-source="tableData"
      :loading="loading"
      :pagination="pagination"
      row-key="id"
      :row-selection="{ selectedRowKeys, onChange: setSelectedKeys }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'image'">
          <div class="product-image"><ShopOutlined /></div>
        </template>
        <template v-else-if="column.key === 'price'">
          <span class="price">¥{{ record.price }}</span>
        </template>
        <template v-else-if="column.key === 'stock'">
          <a-input-number v-model:value="record.stock" size="small" style="width: 100px" :min="0" @change="(v: number) => quickUpdateStock(record, v)" />
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="record.status === 1 ? 'green' : 'default'">{{ record.status === 1 ? '上架' : '下架' }}</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button v-permission="'product:edit'" type="link" size="small" @click="goEdit(record)">编辑</a-button>
            <a-button v-permission="'product:update'" type="link" size="small" @click="quickToggle(record)">{{ record.status === 1 ? '下架' : '上架' }}</a-button>
            <a-popconfirm title="确定删除？将移入回收站" @confirm="handleDelete(record)">
              <a-button v-permission="'product:delete'" type="link" size="small" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal v-model:open="batchStockVisible" title="批量修改库存" @ok="handleBatchStock" @cancel="batchStockVisible = false" width="400px">
      <a-form layout="vertical">
        <a-form-item label="新库存值">
          <a-input-number v-model:value="batchStockValue" :min="0" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:open="batchPriceVisible" title="批量修改价格" @ok="handleBatchPrice" @cancel="batchPriceVisible = false" width="400px">
      <a-form layout="vertical">
        <a-form-item label="新价格">
          <a-input-number v-model:value="batchPriceValue" :min="0" :precision="2" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { SearchOutlined, PlusOutlined, DownOutlined, UpOutlined, InboxOutlined, DollarOutlined, DeleteOutlined, ShopOutlined } from '@ant-design/icons-vue'
import { getProductList, batchUpdateStatus, batchUpdateStock, batchUpdatePrice, deleteProduct, getCategoryTree } from '@/api/product'
import { useTable, usePermission } from '@/hooks'
import type { ProductRecord, ListParams, ListResult } from '@/types'

const router = useRouter()
const { hasPermission } = usePermission()

async function fetchProductList(params: ListParams) {
  const res = await getProductList(params)
  return { data: res.data as ListResult<ProductRecord> }
}

const { loading, tableData, pagination, filters, selectedRowKeys, selectedCount, handleTableChange, handleSearch, handleReset, setSelectedKeys, refresh } = useTable<ProductRecord>({
  fetchData: fetchProductList,
  defaultParams: { keyword: '', categoryId: undefined as number | undefined, status: undefined as number | undefined }
})

const categoryOptions = ref<any[]>([])
const batchStockVisible = ref(false)
const batchPriceVisible = ref(false)
const batchStockValue = ref(0)
const batchPriceValue = ref(0)

const columns = [
  { title: '图片', key: 'image', width: 80 },
  { title: '商品名称', dataIndex: 'name', width: 200 },
  { title: '分类', dataIndex: 'categoryName', width: 120 },
  { title: '品牌', dataIndex: 'brandName', width: 120 },
  { title: '价格', key: 'price', width: 100 },
  { title: '库存', key: 'stock', width: 120 },
  { title: '销量', dataIndex: 'sales', width: 80 },
  { title: '状态', key: 'status', width: 80 },
  { title: '创建时间', dataIndex: 'createTime', width: 170 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' as const }
]

async function loadCategories() {
  const res = await getCategoryTree()
  categoryOptions.value = flattenTree(res.data)
}

function flattenTree(tree: any[]): any[] {
  const result: any[] = []
  for (const item of tree) {
    result.push({ id: item.id, name: item.name })
    if (item.children) result.push(...flattenTree(item.children))
  }
  return result
}

function goCreate() { router.push('/product/create') }
function goEdit(record: ProductRecord) { router.push(`/product/edit/${record.id}`) }

async function quickToggle(record: ProductRecord) {
  const newStatus = record.status === 1 ? 0 : 1
  await batchUpdateStatus([record.id], newStatus)
  message.success(newStatus === 1 ? '已上架' : '已下架')
  record.status = newStatus
}

async function quickUpdateStock(record: ProductRecord, value: number) {
  if (value === undefined || value === null) return
  await batchUpdateStock({ ids: [record.id], stock: value })
  message.success('库存已更新')
}

async function handleDelete(record: ProductRecord) {
  await deleteProduct(record.id)
  message.success('已移入回收站')
  refresh()
}

function handleBatchAction({ key }: { key: string }) {
  if (selectedRowKeys.value.length === 0) return
  switch (key) {
    case 'on':
      batchUpdateStatus(selectedRowKeys.value as number[], 1).then(() => { message.success('批量上架成功'); refresh() })
      break
    case 'off':
      batchUpdateStatus(selectedRowKeys.value as number[], 0).then(() => { message.success('批量下架成功'); refresh() })
      break
    case 'stock':
      batchStockValue.value = 0
      batchStockVisible.value = true
      break
    case 'price':
      batchPriceValue.value = 0
      batchPriceVisible.value = true
      break
    case 'delete':
      deleteProduct(selectedRowKeys.value[0] as number).then(() => { message.success('已删除'); selectedRowKeys.value = []; refresh() })
      break
  }
}

async function handleBatchStock() {
  await batchUpdateStock({ ids: selectedRowKeys.value as number[], stock: batchStockValue.value })
  message.success('批量更新成功')
  batchStockVisible.value = false
  refresh()
}

async function handleBatchPrice() {
  await batchUpdatePrice({ ids: selectedRowKeys.value as number[], price: batchPriceValue.value })
  message.success('批量更新成功')
  batchPriceVisible.value = false
  refresh()
}

onMounted(() => { loadCategories() })
</script>

<style lang="scss" scoped>
.filter-bar { margin-bottom: 16px; }
.action-bar { display: flex; justify-content: space-between; margin-bottom: 16px; }
.selected-count { color: #1677ff; }
.product-image { width: 50px; height: 50px; background: #f5f5f5; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #999; }
.price { color: #ff4d4f; font-weight: 600; }
</style>