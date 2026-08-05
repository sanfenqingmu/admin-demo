<template>
  <a-card>
    <div class="filter-bar">
      <a-row justify="space-between" align="middle">
        <a-col>
          <a-radio-group v-model:value="range" button-style="solid" @change="fetchData">
            <a-radio-button value="week">近7天</a-radio-button>
            <a-radio-button value="month">近30天</a-radio-button>
            <a-radio-button value="quarter">近90天</a-radio-button>
          </a-radio-group>
        </a-col>
        <a-col>
          <a-space>
            <a-button @click="handleExport" v-permission="'report:export'"><DownloadOutlined /> 导出报表</a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <a-row :gutter="16" class="summary-cards">
      <a-col :span="4" v-for="card in summaryCards" :key="card.title">
        <a-card :bordered="false" class="stat-card">
          <div class="stat-icon" :style="{ background: card.bg, color: card.color }">
            <component :is="card.icon" />
          </div>
          <div class="stat-info">
            <div class="stat-title">{{ card.title }}</div>
            <div class="stat-value" :style="{ color: card.color }">{{ card.value }}</div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-card title="交易趋势" :bordered="false" style="margin-bottom: 16px">
      <div ref="trendChartRef" style="height: 350px"></div>
    </a-card>

    <a-row :gutter="16">
      <a-col :span="12">
        <a-card title="支付方式分布" :bordered="false">
          <div ref="payChartRef" style="height: 300px"></div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="订单状态分布" :bordered="false">
          <div ref="statusChartRef" style="height: 300px"></div>
        </a-card>
      </a-col>
    </a-row>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { message } from 'ant-design-vue'
import { DownloadOutlined, ShoppingCartOutlined, DollarOutlined, UndoOutlined, UserAddOutlined, PayCircleOutlined } from '@ant-design/icons-vue'
import { getTransactionStats, exportTransactionStats } from '@/api/report'
import { usePermission } from '@/hooks'
import type { TransactionSummary, TransactionTrend } from '@/types'

const { hasPermission } = usePermission()

const range = ref('week')
const trendChartRef = ref<HTMLElement>()
const payChartRef = ref<HTMLElement>()
const statusChartRef = ref<HTMLElement>()
let trendChart: echarts.ECharts | null = null
let payChart: echarts.ECharts | null = null
let statusChart: echarts.ECharts | null = null

const summaryCards = ref([
  { title: '订单总数', value: '0', icon: ShoppingCartOutlined, color: '#1677ff', bg: '#e6f4ff' },
  { title: '交易总额', value: '¥0', icon: DollarOutlined, color: '#52c41a', bg: '#f6ffed' },
  { title: '退款总额', value: '¥0', icon: UndoOutlined, color: '#ff4d4f', bg: '#fff1f0' },
  { title: '新增用户', value: '0', icon: UserAddOutlined, color: '#faad14', bg: '#fffbe6' },
  { title: '客单价', value: '¥0', icon: PayCircleOutlined, color: '#13c2c2', bg: '#e6fffb' },
  { title: '退款率', value: '0%', icon: PayCircleOutlined, color: '#722ed1', bg: '#f9f0ff' }
])

async function fetchData() {
  const res = await getTransactionStats({ range: range.value })
  const data = res.data
  summaryCards.value[0].value = String(data.summary.totalOrders)
  summaryCards.value[1].value = `¥${data.summary.totalAmount}`
  summaryCards.value[2].value = `¥${data.summary.totalRefund}`
  summaryCards.value[3].value = String(data.summary.totalUsers)
  summaryCards.value[4].value = `¥${data.summary.avgOrderAmount}`
  summaryCards.value[5].value = data.summary.refundRate

  nextTick(() => {
    initTrendChart(data.trend)
    initPayChart(data.summary.payMethods)
    initStatusChart(data.summary.orderStatus)
  })
}

function initTrendChart(trend: TransactionTrend) {
  if (!trendChartRef.value) return
  if (!trendChart) trendChart = echarts.init(trendChartRef.value)
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['订单数', '支付金额', '退款金额', '新增用户'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '8%', top: '5%', containLabel: true },
    xAxis: { type: 'category', data: trend.xData, boundaryGap: false },
    yAxis: [
      { type: 'value', name: '金额(¥)', position: 'left' },
      { type: 'value', name: '数量', position: 'right' }
    ],
    series: [
      { name: '支付金额', type: 'line', smooth: true, data: trend.payAmount, yAxisIndex: 0,
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(82,196,26,0.3)' }, { offset: 1, color: 'rgba(82,196,26,0)' }]) },
        itemStyle: { color: '#52c41a' } },
      { name: '退款金额', type: 'line', smooth: true, data: trend.refundAmount, yAxisIndex: 0, itemStyle: { color: '#ff4d4f' } },
      { name: '订单数', type: 'line', smooth: true, data: trend.orderCount, yAxisIndex: 1, itemStyle: { color: '#1677ff' } },
      { name: '新增用户', type: 'line', smooth: true, data: trend.newUsers, yAxisIndex: 1, itemStyle: { color: '#faad14' } }
    ]
  })
}

function initPayChart(payMethods: Array<{ name: string; value: number; percent: string }>) {
  if (!payChartRef.value) return
  if (!payChart) payChart = echarts.init(payChartRef.value)
  payChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
    legend: { bottom: 0, left: 'center' },
    series: [{
      type: 'pie', radius: ['40%', '70%'], center: ['50%', '45%'],
      label: { formatter: '{b}\n{d}%' },
      data: payMethods.map((p, idx) => ({
        value: p.value, name: p.name,
        itemStyle: { color: ['#1677ff', '#52c41a', '#faad14', '#13c2c2'][idx] }
      }))
    }]
  })
}

function initStatusChart(orderStatus: Array<{ name: string; value: number }>) {
  if (!statusChartRef.value) return
  if (!statusChart) statusChart = echarts.init(statusChartRef.value)
  statusChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: orderStatus.map((s) => s.name) },
    yAxis: { type: 'value', name: '订单数' },
    series: [{
      type: 'bar', barWidth: '50%',
      data: orderStatus.map((s, idx) => ({
        value: s.value,
        itemStyle: { color: ['#faad14', '#1677ff', '#13c2c2', '#52c41a', '#d9d9d9'][idx], borderRadius: [4, 4, 0, 0] }
      })),
      label: { show: true, position: 'top' }
    }]
  })
}

async function handleExport() {
  await exportTransactionStats({ range: range.value })
  message.success('导出任务已创建')
}

function handleResize() { trendChart?.resize(); payChart?.resize(); statusChart?.resize() }

onMounted(() => { fetchData(); window.addEventListener('resize', handleResize) })
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose(); payChart?.dispose(); statusChart?.dispose()
})
</script>

<style lang="scss" scoped>
.filter-bar { margin-bottom: 16px; }
.summary-cards { margin-bottom: 16px; }
.stat-card {
  :deep(.ant-card-body) { padding: 16px; display: flex; align-items: center; gap: 12px; }
}
.stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
.stat-info { flex: 1; min-width: 0; }
.stat-title { font-size: 12px; color: #999; margin-bottom: 2px; }
.stat-value { font-size: 20px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>