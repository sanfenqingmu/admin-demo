<template>
  <a-card>
    <a-tabs v-model:active-key="activeTab" @change="handleTabChange">
      <a-tab-pane key="inventory" tab="SKU 库存管理">
        <div class="filter-bar">
          <a-row :gutter="16">
            <a-col :span="6">
              <a-input v-model:value="filters.keyword" placeholder="搜索商品名称/SKU编码" allow-clear @pressEnter="handleSearch">
                <template #prefix><SearchOutlined /></template>
              </a-input>
            </a-col>
            <a-col :span="18">
              <a-space>
                <a-button type="primary" @click="handleSearch">搜索</a-button>
                <a-button @click="handleReset">重置</a-button>
                <a-button :disabled="selectedRowKeys.length === 0" @click="batchVisible = true" v-permission="'logistics:inventory:batch'"><DatabaseOutlined /> 批量改库存</a-button>
              </a-space>
            </a-col>
          </a-row>
        </div>

        <a-table :columns="inventoryColumns" :data-source="tableData" :loading="loading" :pagination="pagination" row-key="id"
          :row-selection="{ selectedRowKeys, onChange: setSelectedKeys }" @change="handleTableChange">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'stock'">
              <a-input-number v-model:value="record.stock" size="small" style="width: 100px" :min="0" @pressEnter="(v: number) => quickUpdateStock(record, v)" />
            </template>
            <template v-else-if="column.key === 'stockStatus'">
              <a-tag :color="record.stock <= record.warningThreshold ? 'red' : record.stock <= 50 ? 'orange' : 'green'">
                {{ record.stock <= record.warningThreshold ? '库存不足' : record.stock <= 50 ? '偏低' : '正常' }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'price'">
              <span class="price">¥{{ record.price }}</span>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="handleUpdateStock(record)" v-permission="'logistics:inventory:adjust'">调整库存</a-button>
                <a-button type="link" size="small" @click="handleSetWarning(record)" v-permission="'logistics:inventory:warning'">预警设置</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="flow" tab="库存变动记录">
        <div class="filter-bar">
          <a-row :gutter="16">
            <a-col :span="6">
              <a-input v-model:value="filters.keyword" placeholder="搜索商品/SKU" allow-clear @pressEnter="handleSearch">
                <template #prefix><SearchOutlined /></template>
              </a-input>
            </a-col>
            <a-col :span="4">
              <a-select v-model:value="filters.type" placeholder="变动类型" allow-clear>
                <a-select-option value="in">入库</a-select-option>
                <a-select-option value="out">出库</a-select-option>
                <a-select-option value="adjust">调整</a-select-option>
                <a-select-option value="return">退货入库</a-select-option>
              </a-select>
            </a-col>
            <a-col :span="14">
              <a-space>
                <a-button type="primary" @click="handleSearch">搜索</a-button>
                <a-button @click="handleReset">重置</a-button>
                <a-button @click="exportFlow" v-permission="'logistics:inventory:export'">导出记录</a-button>
              </a-space>
            </a-col>
          </a-row>
        </div>

        <a-table :columns="flowColumns" :data-source="tableData" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'type'">
              <a-tag :color="getFlowTypeColor(record.type)">{{ record.typeText }}</a-tag>
            </template>
            <template v-else-if="column.key === 'change'">
              <span :class="record.change > 0 ? 'text-green' : 'text-red'">{{ record.change > 0 ? '+' : '' }}{{ record.change }}</span>
            </template>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="warning" tab="库存预警">
        <div class="warning-tip">
          <WarningOutlined /> 以下商品库存已低于预警阈值，请及时补货
        </div>
        <a-table :columns="warningColumns" :data-source="tableData" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'stock'">
              <span class="text-red">{{ record.stock }}</span>
            </template>
            <template v-else-if="column.key === 'warningThreshold'">
              {{ record.warningThreshold }}
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="handleUpdateStock(record)" v-permission="'logistics:inventory:adjust'">立即补货</a-button>
                <a-button type="link" size="small" @click="handleSetWarning(record)" v-permission="'logistics:inventory:warning'">调整阈值</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>

    <a-modal v-model:open="stockVisible" title="调整库存" @ok="handleStockSubmit" @cancel="stockVisible = false" width="450px">
      <div v-if="currentItem" class="stock-preview">
        <p><strong>商品：</strong>{{ currentItem.productName }}</p>
        <p><strong>规格：</strong>{{ currentItem.specText }}（{{ currentItem.skuCode }}）</p>
        <p><strong>当前库存：</strong>{{ currentItem.stock }}</p>
      </div>
      <a-divider />
      <a-form layout="vertical">
        <a-form-item label="调整类型">
          <a-radio-group v-model:value="stockForm.type">
            <a-radio value="in">入库（+）</a-radio>
            <a-radio value="out">出库（-）</a-radio>
            <a-radio value="adjust">直接设置</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="数量">
          <a-input-number v-model:value="stockForm.amount" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="stockForm.remark" :rows="2" placeholder="请输入备注（可选）" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:open="batchVisible" title="批量修改库存" @ok="handleBatchSubmit" @cancel="batchVisible = false" width="400px">
      <a-alert :message="`将对 ${selectedRowKeys.length} 个 SKU 进行操作`" type="info" show-icon style="margin-bottom: 16px" />
      <a-form layout="vertical">
        <a-form-item label="设置库存为">
          <a-input-number v-model:value="batchStockValue" :min="0" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:open="warningVisible" title="库存预警设置" @ok="handleWarningSubmit" @cancel="warningVisible = false" width="400px">
      <a-form layout="vertical">
        <a-form-item label="预警阈值">
          <a-input-number v-model:value="warningThreshold" :min="0" style="width: 100%" />
          <p class="form-tip">当库存低于此值时将触发预警</p>
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, DatabaseOutlined, WarningOutlined } from '@ant-design/icons-vue'
import { getInventoryList, updateStock, batchUpdateStock, getStockFlowList, getWarningList, setWarningThreshold } from '@/api/logistics'
import { useTable, usePermission } from '@/hooks'
import type { InventoryRecord, StockFlowRecord, ListParams } from '@/types'

const { hasPermission } = usePermission()

const activeTab = ref('inventory')
const selectedRowKeys = ref<(string | number)[]>([])
const stockVisible = ref(false)
const batchVisible = ref(false)
const warningVisible = ref(false)
const currentItem = ref<InventoryRecord | null>(null)
const batchStockValue = ref(0)
const warningThreshold = ref(10)
const stockForm = reactive({ type: 'in', amount: 0, remark: '' })

const { loading, tableData, pagination, filters, handleTableChange, handleSearch, handleReset, loadData } = useTable({
  fetchData: async (params: ListParams) => {
    const apiParams: Record<string, unknown> = { ...params }
    if (filters.keyword) apiParams.keyword = filters.keyword
    if (filters.type) apiParams.type = filters.type
    if (activeTab.value === 'inventory') {
      const res = await getInventoryList(apiParams)
      return { data: res.data }
    } else if (activeTab.value === 'flow') {
      const res = await getStockFlowList(apiParams)
      return { data: res.data }
    } else {
      const res = await getWarningList(apiParams)
      return { data: res.data }
    }
  },
  defaultParams: { keyword: '', type: undefined }
})

const inventoryColumns = [
  { title: 'ID', dataIndex: 'id', width: 60 },
  { title: '商品名称', dataIndex: 'productName', width: 160 },
  { title: 'SKU编码', dataIndex: 'skuCode', width: 120 },
  { title: '规格', dataIndex: 'specText', width: 140 },
  { title: '价格', key: 'price', width: 100 },
  { title: '库存', key: 'stock', width: 120 },
  { title: '预警阈值', dataIndex: 'warningThreshold', width: 90 },
  { title: '状态', key: 'stockStatus', width: 90 },
  { title: '销量', dataIndex: 'sales', width: 80 },
  { title: '最后变动', dataIndex: 'lastChangeTime', width: 170 },
  { title: '操作', key: 'action', width: 160, fixed: 'right' as const }
]

const flowColumns = [
  { title: 'ID', dataIndex: 'id', width: 60 },
  { title: '商品', dataIndex: 'productName', width: 150 },
  { title: 'SKU', dataIndex: 'skuCode', width: 120 },
  { title: '规格', dataIndex: 'specText', width: 130 },
  { title: '变动类型', key: 'type', width: 100 },
  { title: '变动数量', key: 'change', width: 100 },
  { title: '变动前', dataIndex: 'beforeStock', width: 80 },
  { title: '变动后', dataIndex: 'afterStock', width: 80 },
  { title: '原因', dataIndex: 'reason', width: 120 },
  { title: '操作人', dataIndex: 'operator', width: 90 },
  { title: '时间', dataIndex: 'createTime', width: 170 }
]

const warningColumns = [
  { title: 'ID', dataIndex: 'id', width: 60 },
  { title: '商品名称', dataIndex: 'productName', width: 160 },
  { title: 'SKU编码', dataIndex: 'skuCode', width: 120 },
  { title: '规格', dataIndex: 'specText', width: 140 },
  { title: '当前库存', key: 'stock', width: 100 },
  { title: '预警阈值', key: 'warningThreshold', width: 100 },
  { title: '价格', dataIndex: 'price', width: 100, customRender: ({ record }: { record: InventoryRecord }) => `¥${record.price}` },
  { title: '销量', dataIndex: 'sales', width: 80 },
  { title: '最后变动', dataIndex: 'lastChangeTime', width: 170 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' as const }
]

function getFlowTypeColor(type: string): string {
  const colors: Record<string, string> = { in: 'green', out: 'red', adjust: 'blue', return: 'orange' }
  return colors[type] || 'default'
}

function setSelectedKeys(keys: Array<string | number>) {
  selectedRowKeys.value = keys
}

function handleTabChange() {
  pagination.current = 1
  filters.keyword = ''
  filters.type = undefined
  loadData()
}

async function quickUpdateStock(record: InventoryRecord, value: number) {
  if (value === undefined || value === null) return
  await updateStock(record.id, { stock: value, remark: '行内快速修改' })
  message.success('库存已更新')
}

function handleUpdateStock(record: InventoryRecord) {
  currentItem.value = record
  Object.assign(stockForm, { type: 'in', amount: 0, remark: '' })
  stockVisible.value = true
}

async function handleStockSubmit() {
  let newStock = stockForm.amount
  if (stockForm.type === 'out') newStock = currentItem.value.stock - stockForm.amount
  else if (stockForm.type === 'adjust') newStock = stockForm.amount
  else newStock = currentItem.value.stock + stockForm.amount
  if (newStock < 0) { message.error('库存不能为负数'); return }
  await updateStock(currentItem.value.id, { stock: newStock, remark: stockForm.remark || '手动调整' })
  message.success('库存调整成功')
  stockVisible.value = false
  loadData()
}

async function handleBatchSubmit() {
  await batchUpdateStock({ ids: selectedRowKeys.value, stock: batchStockValue.value })
  message.success('批量更新成功')
  batchVisible.value = false
  selectedRowKeys.value = []
  loadData()
}

function handleSetWarning(record: InventoryRecord) {
  currentItem.value = record
  warningThreshold.value = record.warningThreshold
  warningVisible.value = true
}

async function handleWarningSubmit() {
  await setWarningThreshold(currentItem.value.id, warningThreshold.value)
  message.success('预警阈值已设置')
  warningVisible.value = false
  loadData()
}

function exportFlow() { message.success('导出任务已创建') }

onMounted(() => { loadData() })
</script>

<style lang="scss" scoped>
.filter-bar { margin-bottom: 16px; }
.warning-tip { background: #fff7e6; border: 1px solid #ffd591; border-radius: 6px; padding: 12px 16px; margin-bottom: 16px; color: #fa8c16; display: flex; align-items: center; gap: 8px; }
.price { color: #ff4d4f; font-weight: 600; }
.text-green { color: #52c41a; font-weight: 500; }
.text-red { color: #ff4d4f; font-weight: 500; }
.stock-preview { background: #fafafa; padding: 12px; border-radius: 6px; }
.stock-preview p { margin: 4px 0; }
.form-tip { color: #999; font-size: 12px; margin: 4px 0 0; }
</style>