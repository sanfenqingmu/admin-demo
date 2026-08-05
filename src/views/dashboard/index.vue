<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <a-row :gutter="16">
      <a-col :span="6" v-for="card in statCards" :key="card.title">
        <a-card class="stat-card" :bordered="false">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: card.bg }">
              <component :is="card.icon" />
            </div>
            <div class="stat-info">
              <div class="stat-title">{{ card.title }}</div>
              <div class="stat-value" :style="{ color: card.color }">{{ card.value }}</div>
              <div class="stat-trend">
                <span :class="card.trend > 0 ? 'trend-up' : 'trend-down'">
                  <ArrowUpOutlined v-if="card.trend > 0" />
                  <ArrowDownOutlined v-else />
                  {{ Math.abs(card.trend) }}%
                </span>
                <span class="trend-label">较昨日</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区域 -->
    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :span="16">
        <a-card title="销售额趋势" :bordered="false">
          <template #extra>
            <a-radio-group v-model:value="salesRange" button-style="solid" size="small" @change="initSalesChart">
              <a-radio-button value="week">近7天</a-radio-button>
              <a-radio-button value="month">近30天</a-radio-button>
            </a-radio-group>
          </template>
          <div ref="salesChartRef" style="height: 320px"></div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="订单状态分布" :bordered="false">
          <div ref="pieChartRef" style="height: 320px"></div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :span="12">
        <a-card title="分类销量统计" :bordered="false">
          <div ref="barChartRef" style="height: 300px"></div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="系统公告" :bordered="false">
          <a-timeline>
            <a-timeline-item v-for="(item, idx) in notices" :key="idx" :color="item.color">
              <p>{{ item.content }}</p>
              <p class="time">{{ item.time }}</p>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import {
  EyeOutlined, UserAddOutlined, ShoppingCartOutlined, DollarOutlined,
  ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons-vue'

const salesRange = ref('week')
const salesChartRef = ref<HTMLElement>()
const pieChartRef = ref<HTMLElement>()
const barChartRef = ref<HTMLElement>()
let salesChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null

const statCards = [
  { title: '今日访问', value: '12,543', icon: EyeOutlined, color: '#1677ff', bg: '#e6f4ff', trend: 12.5 },
  { title: '新增用户', value: '328', icon: UserAddOutlined, color: '#52c41a', bg: '#f6ffed', trend: 8.3 },
  { title: '订单数量', value: '1,892', icon: ShoppingCartOutlined, color: '#faad14', bg: '#fffbe6', trend: -2.1 },
  { title: '总营收', value: '¥98,654', icon: DollarOutlined, color: '#ff4d4f', bg: '#fff1f0', trend: 15.6 }
]

const notices = [
  { color: 'green', content: '系统升级完成，新增权限管理功能', time: '2024-01-15 10:30:00' },
  { color: 'blue', content: '新版本 v2.0.0 发布，优化商品管理体验', time: '2024-01-10 14:00:00' },
  { color: 'orange', content: '服务器维护通知：凌晨 2:00-4:00', time: '2024-01-05 08:00:00' },
  { color: 'gray', content: '新增财务管理模块，支持对账与发票管理', time: '2024-01-01 09:00:00' }
]

function initSalesChart() {
  if (!salesChartRef.value) return
  if (!salesChart) salesChart = echarts.init(salesChartRef.value)
  const days = salesRange.value === 'week' ? 7 : 30
  const xData: string[] = []
  const salesData: number[] = []
  const orderData: number[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    xData.push(`${d.getMonth() + 1}/${d.getDate()}`)
    salesData.push(Math.floor(Math.random() * 50000 + 20000))
    orderData.push(Math.floor(Math.random() * 200 + 50))
  }
  salesChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['销售额', '订单数'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '8%', top: '5%', containLabel: true },
    xAxis: { type: 'category', data: xData, boundaryGap: false },
    yAxis: [
      { type: 'value', name: '销售额(¥)', axisLabel: { formatter: '{value}' } },
      { type: 'value', name: '订单数', position: 'right' }
    ],
    series: [
      {
        name: '销售额', type: 'line', smooth: true, data: salesData, yAxisIndex: 0,
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(22,119,255,0.3)' }, { offset: 1, color: 'rgba(22,119,255,0)' }]) },
        itemStyle: { color: '#1677ff' }
      },
      { name: '订单数', type: 'line', smooth: true, data: orderData, yAxisIndex: 1, itemStyle: { color: '#52c41a' } }
    ]
  })
}

function initPieChart() {
  if (!pieChartRef.value) return
  pieChart = echarts.init(pieChartRef.value)
  pieChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, left: 'center' },
    series: [{
      type: 'pie', radius: ['40%', '70%'], center: ['50%', '45%'],
      label: { show: true, formatter: '{b}: {d}%' },
      data: [
        { value: 450, name: '待付款', itemStyle: { color: '#faad14' } },
        { value: 680, name: '待发货', itemStyle: { color: '#1677ff' } },
        { value: 520, name: '待收货', itemStyle: { color: '#13c2c2' } },
        { value: 1800, name: '已完成', itemStyle: { color: '#52c41a' } },
        { value: 120, name: '已关闭', itemStyle: { color: '#d9d9d9' } }
      ]
    }]
  })
}

function initBarChart() {
  if (!barChartRef.value) return
  barChart = echarts.init(barChartRef.value)
  barChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: ['数码电子', '服装鞋帽', '家居日用', '美妆护肤', '食品饮料', '运动户外'] },
    yAxis: { type: 'value', name: '销量' },
    series: [{
      type: 'bar', barWidth: '50%',
      data: [
        { value: 3200, itemStyle: { color: '#1677ff' } },
        { value: 2800, itemStyle: { color: '#52c41a' } },
        { value: 2100, itemStyle: { color: '#faad14' } },
        { value: 1800, itemStyle: { color: '#13c2c2' } },
        { value: 1500, itemStyle: { color: '#eb2f96' } },
        { value: 900, itemStyle: { color: '#722ed1' } }
      ],
      itemStyle: { borderRadius: [4, 4, 0, 0] }
    }]
  })
}

function handleResize() {
  salesChart?.resize()
  pieChart?.resize()
  barChart?.resize()
}

onMounted(() => {
  nextTick(() => {
    initSalesChart()
    initPieChart()
    initBarChart()
  })
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  salesChart?.dispose()
  pieChart?.dispose()
  barChart?.dispose()
})
</script>

<style lang="scss" scoped>
.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .stat-icon {
    width: 56px; height: 56px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; color: #fff; flex-shrink: 0;
  }
  .stat-info { flex: 1; }
  .stat-title { font-size: 13px; color: #999; margin-bottom: 4px; }
  .stat-value { font-size: 26px; font-weight: 700; line-height: 1.2; }
  .stat-trend { margin-top: 4px; font-size: 12px; }
  .trend-up { color: #52c41a; margin-right: 4px; }
  .trend-down { color: #ff4d4f; margin-right: 4px; }
  .trend-label { color: #999; }
}
.time { color: #999; font-size: 12px; margin: 4px 0 0; }
</style>
