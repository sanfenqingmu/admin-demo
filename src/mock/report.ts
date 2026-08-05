import Mock from 'mockjs'

const productNames = [
  'iPhone 15 Pro', 'MacBook Air M3', 'AirPods Pro 2', 'iPad Air', 'Apple Watch S9',
  'Nike Air Max 2024', 'Adidas Ultraboost', '纯棉短袖T恤', '智能手表', '蓝牙音箱',
  '游戏键盘', '机械鼠标', '保温杯', '双肩背包', '防晒霜',
  '洗面奶', '电动牙刷', '咖啡机', '空气净化器', '扫地机器人'
]
const categories = ['数码电子', '服装鞋帽', '家居日用', '美妆护肤', '食品饮料']

const salesRankingData: any[] = []
for (let i = 0; i < 20; i++) {
  const sales = Math.floor(Math.random() * 3000 + 200)
  const price = (Math.random() * 5000 + 50).toFixed(2)
  salesRankingData.push({
    id: i + 1,
    rank: i + 1,
    productName: productNames[i],
    category: categories[i % categories.length],
    sales,
    salesAmount: (sales * Number(price)).toFixed(2),
    price,
    stock: Math.floor(Math.random() * 500 + 50),
    refundRate: (Math.random() * 5).toFixed(1) + '%',
    conversionRate: (Math.random() * 20 + 5).toFixed(1) + '%'
  })
}

function generateTrendData(days: number) {
  const xData: string[] = []
  const orderCount: number[] = []
  const payAmount: number[] = []
  const refundAmount: number[] = []
  const newUsers: number[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    xData.push(`${d.getMonth() + 1}-${d.getDate()}`)
    orderCount.push(Math.floor(Math.random() * 500 + 100))
    payAmount.push(Math.floor(Math.random() * 80000 + 20000))
    refundAmount.push(Math.floor(Math.random() * 5000 + 500))
    newUsers.push(Math.floor(Math.random() * 200 + 50))
  }
  return { xData, orderCount, payAmount, refundAmount, newUsers }
}

export function setupReportMock() {
  Mock.mock(/\/api\/report\/sales-ranking/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const page = Number(query.get('page')) || 1
    const pageSize = Number(query.get('pageSize')) || 10
    const category = query.get('category')
    const sortField = query.get('sortField') || 'sales'
    const sortOrder = query.get('sortOrder') || 'desc'
    let list = [...salesRankingData]
    if (category) list = list.filter((s) => s.category === category)
    list.sort((a, b) => {
      const diff = a[sortField] - b[sortField]
      return sortOrder === 'desc' ? -diff : diff
    })
    list.forEach((item, idx) => { item.rank = idx + 1 })
    const start = (page - 1) * pageSize
    return { code: 200, message: '获取成功', data: { list: list.slice(start, start + pageSize), total: list.length } }
  })

  Mock.mock(/\/api\/report\/sales-ranking\/export/, 'get', () => ({ code: 200, message: '导出任务已创建', data: null }))

  Mock.mock(/\/api\/report\/transaction-stats/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const range = query.get('range') || 'week'
    const days = range === 'week' ? 7 : range === 'month' ? 30 : 90
    const trend = generateTrendData(days)
    const totalOrders = trend.orderCount.reduce((s, v) => s + v, 0)
    const totalAmount = trend.payAmount.reduce((s, v) => s + v, 0)
    const totalRefund = trend.refundAmount.reduce((s, v) => s + v, 0)
    const totalUsers = trend.newUsers.reduce((s, v) => s + v, 0)
    return {
      code: 200, message: '获取成功',
      data: {
        summary: {
          totalOrders, totalAmount: totalAmount.toFixed(2), totalRefund: totalRefund.toFixed(2),
          totalUsers, avgOrderAmount: (totalAmount / totalOrders).toFixed(2),
          refundRate: ((totalRefund / totalAmount) * 100).toFixed(2) + '%',
          payMethods: [
            { name: '微信支付', value: Math.floor(totalAmount * 0.45), percent: '45%' },
            { name: '支付宝', value: Math.floor(totalAmount * 0.35), percent: '35%' },
            { name: '银行卡', value: Math.floor(totalAmount * 0.15), percent: '15%' },
            { name: '余额支付', value: Math.floor(totalAmount * 0.05), percent: '5%' }
          ],
          orderStatus: [
            { name: '待付款', value: 450 },
            { name: '待发货', value: 680 },
            { name: '待收货', value: 520 },
            { name: '已完成', value: 1800 },
            { name: '已关闭', value: 120 }
          ]
        },
        trend
      }
    }
  })

  Mock.mock(/\/api\/report\/transaction-trend/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const range = query.get('range') || 'week'
    const days = range === 'week' ? 7 : range === 'month' ? 30 : 90
    return { code: 200, message: '获取成功', data: generateTrendData(days) }
  })

  Mock.mock(/\/api\/report\/transaction-stats\/export/, 'get', () => ({ code: 200, message: '导出任务已创建', data: null }))
}
