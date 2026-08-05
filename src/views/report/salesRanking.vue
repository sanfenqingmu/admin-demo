<template>
  <a-card>
    <div class="filter-bar">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-select v-model:value="filters.category" placeholder="商品分类" allow-clear style="width: 100%">
            <a-select-option value="数码电子">数码电子</a-select-option>
            <a-select-option value="服装鞋帽">服装鞋帽</a-select-option>
            <a-select-option value="家居日用">家居日用</a-select-option>
            <a-select-option value="美妆护肤">美妆护肤</a-select-option>
            <a-select-option value="食品饮料">食品饮料</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select v-model:value="filters.sortField" style="width: 100%">
            <a-select-option value="sales">按销量排序</a-select-option>
            <a-select-option value="salesAmount">按销售额排序</a-select-option>
            <a-select-option value="conversionRate">按转化率排序</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="12">
          <a-space>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
            <a-button @click="handleExport" v-permission="'report:export'"><DownloadOutlined /> 导出</a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <a-card title="销量 Top 5" :bordered="false" style="margin-bottom: 16px">
      <div ref="topChartRef" style="height: 280px"></div>
    </a-card>

    <a-table :columns="columns" :data-source="tableData" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'rank'">
          <div class="rank-badge" :class="'rank-' + (record.rank <= 3 ? record.rank : 'normal')">
            {{ record.rank }}
          </div>
        </template>
        <template v-else-if="column.key === 'salesAmount'">
          <span class="amount">¥{{ record.salesAmount }}</span>
        </template>
        <template v-else-if="column.key === 'price'">
          <span>¥{{ record.price }}</span>
        </template>
        <template v-else-if="column.key === 'salesBar'">
          <a-progress :percent="getSalesPercent(record.sales)" :show-info="false" :stroke-color="record.rank <= 3 ? '#1677ff' : '#d9d9d9'" size="small" />
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { message } from 'ant-design-vue'
import { DownloadOutlined } from '@ant-design/icons-vue'
import { getSalesRanking, exportSalesRanking } from '@/api/report'
import { useTable, usePermission } from '@/hooks'
import type { SalesRankingRecord, ListParams } from '@/types'

const { hasPermission } = usePermission()

const topChartRef = ref<HTMLElement>()
let topChart: echarts.ECharts | null = null

const { loading, tableData, pagination, filters, handleTableChange, handleSearch, handleReset, loadData } = useTable<SalesRankingRecord>({
  fetchData: async (params: ListParams) => {
    const apiParams: Record<string, unknown> = { ...params, sortField: filters.sortField, sortOrder: 'desc' }
    if (filters.category) apiParams.category = filters.category
    const res = await getSalesRanking(apiParams)
    nextTick(() => initTopChart())
    return { data: res.data }
  },
  defaultParams: { category: undefined, sortField: 'sales' }
})

const columns = [
  { title: '排名', key: 'rank', width: 70, fixed: 'left' as const },
  { title: '商品名称', dataIndex: 'productName', width: 180 },
  { title: '分类', dataIndex: 'category', width: 100 },
  { title: '销量', dataIndex: 'sales', width: 100, sorter: true },
  { title: '销量占比', key: 'salesBar', width: 180 },
  { title: '销售额', key: 'salesAmount', width: 130, sorter: true },
  { title: '单价', key: 'price', width: 100 },
  { title: '库存', dataIndex: 'stock', width: 80 },
  { title: '退款率', dataIndex: 'refundRate', width: 90 },
  { title: '转化率', dataIndex: 'conversionRate', width: 90 }
]

function getSalesPercent(sales: number): number {
  const max = Math.max(...tableData.value.map((d) => d.sales), 1)
  return Math.round((sales / max) * 100)
}

function initTopChart() {
  if (!topChartRef.value) return
  if (!topChart) topChart = echarts.init(topChartRef.value)
  const top5 = tableData.value.slice(0, 5)
  topChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '8%', bottom: '3%', top: '5%', containLabel: true },
    xAxis: { type: 'value', name: '销量' },
    yAxis: { type: 'category', data: top5.map((d) => d.productName).reverse(), axisLabel: { width: 120, overflow: 'truncate' } },
    series: [{
      type: 'bar', barWidth: '60%',
      data: top5.map((d) => d.sales).reverse(),
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#1677ff' }, { offset: 1, color: '#69b1ff' }
        ])
      },
      label: { show: true, position: 'right', formatter: '{c}' }
    }]
  })
}

async function handleExport() {
  await exportSalesRanking(filters)
  message.success('导出任务已创建')
}

function handleResize() { topChart?.resize() }

onMounted(() => { loadData(); window.addEventListener('resize', handleResize) })
onUnmounted(() => { window.removeEventListener('resize', handleResize); topChart?.dispose() })
</script>

<style lang="scss" scoped>
.filter-bar { margin-bottom: 16px; }
.amount { color: #ff4d4f; font-weight: 600; }
.rank-badge {
  width: 28px; height: 28px; border-radius: 50%; display: inline-flex;
  align-items: center; justify-content: center; font-weight: 700; font-size: 14px;
}
.rank-1 { background: #ffd700; color: #fff; }
.rank-2 { background: #c0c0c0; color: #fff; }
.rank-3 { background: #cd7f32; color: #fff; }
.rank-normal { background: #f0f0f0; color: #666; }
</style>