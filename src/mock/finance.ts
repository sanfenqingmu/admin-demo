import Mock from 'mockjs'

const flowTypes = [
  { type: 'income', text: '收入', sources: ['订单支付', '充值收入', '退款退回', '平台补贴'] },
  { type: 'expense', text: '支出', sources: ['订单退款', '提现支出', '平台手续费', '佣金支出'] }
]
const payMethods = ['微信支付', '支付宝', '银行卡', '余额支付']

const flowListData: any[] = []
for (let i = 0; i < 40; i++) {
  const typeIdx = Math.random() > 0.3 ? 0 : 1
  const type = flowTypes[typeIdx]
  const source = type.sources[Math.floor(Math.random() * type.sources.length)]
  const amount = (Math.random() * 5000 + 10).toFixed(2)
  flowListData.push({
    id: i + 1,
    flowNo: 'FL' + (Date.now() - i * 3600000).toString().slice(-12),
    type: type.type,
    typeText: type.text,
    source,
    amount: typeIdx === 0 ? amount : '-' + amount,
    payMethod: payMethods[Math.floor(Math.random() * payMethods.length)],
    orderNo: 'ORD' + Math.floor(Math.random() * 900000 + 100000),
    userName: '用户' + Math.floor(Math.random() * 20 + 1),
    balance: (Math.random() * 100000).toFixed(2),
    remark: '',
    createTime: Mock.Random.datetime()
  })
}

const reconcileListData: any[] = []
for (let i = 0; i < 15; i++) {
  const date = new Date(Date.now() - i * 86400000)
  const dateStr = date.toISOString().slice(0, 10)
  const totalIncome = (Math.random() * 50000 + 5000).toFixed(2)
  const totalExpense = (Math.random() * 10000 + 500).toFixed(2)
  const orderCount = Math.floor(Math.random() * 100 + 10)
  const matched = Math.random() > 0.2
  reconcileListData.push({
    id: i + 1,
    batchNo: 'REC' + dateStr.replace(/-/g, ''),
    date: dateStr,
    totalIncome,
    totalExpense,
    netAmount: (Number(totalIncome) - Number(totalExpense)).toFixed(2),
    orderCount,
    matchedCount: matched ? orderCount : Math.floor(orderCount * 0.8),
    status: matched ? 1 : 0,
    statusText: matched ? '已对账' : '待对账',
    operator: '管理员',
    remark: '',
    createTime: Mock.Random.datetime()
  })
}

const invoiceListData: any[] = []
const invoiceTypes = [
  { type: 1, text: '增值税普票' },
  { type: 2, text: '增值税专票' },
  { type: 3, text: '电子发票' }
]
const invoiceStatuses = [
  { status: 0, text: '待审核' },
  { status: 1, text: '已开票' },
  { status: 2, text: '已拒绝' },
  { status: 3, text: '已寄出' }
]
const companyNames = ['北京科技有限公司', '上海贸易股份有限公司', '深圳电子科技有限公司', '广州广告传媒有限公司', '杭州网络科技有限公司']
for (let i = 0; i < 18; i++) {
  const typeIdx = Math.floor(Math.random() * 3)
  const statusIdx = Math.floor(Math.random() * 4)
  const amount = (Math.random() * 20000 + 100).toFixed(2)
  invoiceListData.push({
    id: i + 1,
    applyNo: 'INV' + (Date.now() - i * 86400000).toString().slice(-10),
    orderId: Math.floor(Math.random() * 25 + 1),
    orderNo: 'ORD' + Math.floor(Math.random() * 900000 + 100000),
    userName: '用户' + Math.floor(Math.random() * 20 + 1),
    type: invoiceTypes[typeIdx].type,
    typeText: invoiceTypes[typeIdx].text,
    title: companyNames[i % companyNames.length],
    taxNo: '91110000' + String(Math.floor(Math.random() * 100000000)).padStart(8, '0'),
    amount,
    email: 'finance@company.com',
    address: '北京市朝阳区科技园' + (i + 1) + '栋',
    phone: '010-' + String(Math.floor(Math.random() * 90000000 + 10000000)),
    bankName: '中国银行',
    bankAccount: '6228' + String(Math.floor(Math.random() * 100000000000000)).padStart(14, '0'),
    status: invoiceStatuses[statusIdx].status,
    statusText: invoiceStatuses[statusIdx].text,
    invoiceNo: statusIdx >= 1 ? 'INV' + Date.now() + i : '',
    expressCompany: statusIdx === 3 ? '顺丰速运' : '',
    expressNo: statusIdx === 3 ? 'SF' + String(Math.floor(Math.random() * 900000000 + 100000000)) : '',
    remark: '',
    createTime: Mock.Random.datetime()
  })
}

export function setupFinanceMock() {
  Mock.mock(/\/api\/finance\/flow\/list/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const page = Number(query.get('page')) || 1
    const pageSize = Number(query.get('pageSize')) || 10
    const keyword = query.get('keyword') || ''
    const type = query.get('type')
    const startDate = query.get('startDate')
    const endDate = query.get('endDate')
    let list = flowListData
    if (keyword) list = list.filter((f) => f.flowNo.includes(keyword) || f.orderNo.includes(keyword) || f.userName.includes(keyword))
    if (type) list = list.filter((f) => f.type === type)
    if (startDate) list = list.filter((f) => f.createTime >= startDate)
    if (endDate) list = list.filter((f) => f.createTime <= endDate)
    const start = (page - 1) * pageSize
    return { code: 200, message: '获取成功', data: { list: list.slice(start, start + pageSize), total: list.length } }
  })

  Mock.mock(/\/api\/finance\/flow\/summary/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const startDate = query.get('startDate')
    const endDate = query.get('endDate')
    let list = flowListData
    if (startDate) list = list.filter((f) => f.createTime >= startDate)
    if (endDate) list = list.filter((f) => f.createTime <= endDate)
    const totalIncome = list.filter((f) => f.type === 'income').reduce((sum, f) => sum + Number(f.amount), 0)
    const totalExpense = list.filter((f) => f.type === 'expense').reduce((sum, f) => sum + Math.abs(Number(f.amount)), 0)
    return {
      code: 200, message: '获取成功',
      data: {
        totalIncome: totalIncome.toFixed(2),
        totalExpense: totalExpense.toFixed(2),
        netAmount: (totalIncome - totalExpense).toFixed(2),
        totalCount: list.length
      }
    }
  })

  Mock.mock(/\/api\/finance\/flow\/export/, 'get', () => ({ code: 200, message: '导出任务已创建', data: null }))

  Mock.mock(/\/api\/finance\/reconcile\/list/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const page = Number(query.get('page')) || 1
    const pageSize = Number(query.get('pageSize')) || 10
    const status = query.get('status')
    const startDate = query.get('startDate')
    const endDate = query.get('endDate')
    let list = reconcileListData
    if (status !== null && status !== undefined) list = list.filter((r) => r.status === Number(status))
    if (startDate) list = list.filter((r) => r.date >= startDate)
    if (endDate) list = list.filter((r) => r.date <= endDate)
    const start = (page - 1) * pageSize
    return { code: 200, message: '获取成功', data: { list: list.slice(start, start + pageSize), total: list.length } }
  })

  Mock.mock(/\/api\/finance\/reconcile\/detail\/\d+/, 'get', (options: any) => {
    const id = Number(options.url.match(/\/detail\/(\d+)/)?.[1] || 0)
    const record = reconcileListData.find((r) => r.id === id)
    const details: any[] = []
    for (let i = 0; i < 5; i++) {
      details.push({
        id: i + 1,
        orderNo: 'ORD' + Math.floor(Math.random() * 900000 + 100000),
        amount: (Math.random() * 2000 + 50).toFixed(2),
        payMethod: payMethods[Math.floor(Math.random() * payMethods.length)],
        orderTime: Mock.Random.datetime(),
        payTime: Mock.Random.datetime(),
        matched: Math.random() > 0.2
      })
    }
    return { code: 200, message: '获取成功', data: { ...record, details } }
  })

  Mock.mock(/\/api\/finance\/reconcile\/review\/\d+/, 'put', () => ({ code: 200, message: '对账成功', data: null }))

  Mock.mock(/\/api\/finance\/invoice\/list/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const page = Number(query.get('page')) || 1
    const pageSize = Number(query.get('pageSize')) || 10
    const keyword = query.get('keyword') || ''
    const status = query.get('status')
    const type = query.get('type')
    let list = invoiceListData
    if (keyword) list = list.filter((i) => i.title.includes(keyword) || i.applyNo.includes(keyword) || i.orderNo.includes(keyword))
    if (status !== null && status !== undefined) list = list.filter((i) => i.status === Number(status))
    if (type) list = list.filter((i) => i.type === Number(type))
    const start = (page - 1) * pageSize
    return { code: 200, message: '获取成功', data: { list: list.slice(start, start + pageSize), total: list.length } }
  })

  Mock.mock(/\/api\/finance\/invoice\/detail\/\d+/, 'get', (options: any) => {
    const id = Number(options.url.match(/\/detail\/(\d+)/)?.[1] || 0)
    const record = invoiceListData.find((i) => i.id === id)
    return { code: 200, message: '获取成功', data: record }
  })

  Mock.mock(/\/api\/finance\/invoice\/review\/\d+/, 'put', () => ({ code: 200, message: '操作成功', data: null }))
}
