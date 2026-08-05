import Mock from 'mockjs'

const freightList = [
  {
    id: 1, name: '全国包邮模板', type: 1, isDefault: true, status: 1,
    regions: [{ region: '全国', firstWeight: 1, firstFee: 0, continueWeight: 1, continueFee: 0 }],
    createTime: '2024-01-01 00:00:00'
  },
  {
    id: 2, name: '偏远地区运费', type: 2, isDefault: false, status: 1,
    regions: [
      { region: '新疆/西藏/青海', firstWeight: 1, firstFee: 15, continueWeight: 1, continueFee: 8 },
      { region: '内蒙古/甘肃/宁夏', firstWeight: 1, firstFee: 12, continueWeight: 1, continueFee: 6 }
    ],
    createTime: '2024-01-02 00:00:00'
  },
  {
    id: 3, name: '江浙沪模板', type: 1, isDefault: false, status: 1,
    regions: [
      { region: '江苏/浙江/上海', firstWeight: 1, firstFee: 6, continueWeight: 1, continueFee: 2 },
      { region: '其他地区', firstWeight: 1, firstFee: 10, continueWeight: 1, continueFee: 5 }
    ],
    createTime: '2024-01-03 00:00:00'
  },
  {
    id: 4, name: '大件商品模板', type: 3, isDefault: false, status: 0,
    regions: [{ region: '全国', firstWeight: 5, firstFee: 25, continueWeight: 1, continueFee: 3 }],
    createTime: '2024-01-04 00:00:00'
  }
]

const expressList = [
  { id: 1, name: '顺丰速运', code: 'SF', logo: '', phone: '95338', website: 'https://www.sf-express.com', sort: 1, status: 1, createTime: '2024-01-01 00:00:00' },
  { id: 2, name: '京东物流', code: 'JD', logo: '', phone: '950616', website: 'https://www.jdl.com', sort: 2, status: 1, createTime: '2024-01-01 00:00:00' },
  { id: 3, name: '圆通速递', code: 'YT', logo: '', phone: '95554', website: 'https://www.yto.net.cn', sort: 3, status: 1, createTime: '2024-01-01 00:00:00' },
  { id: 4, name: '中通快递', code: 'ZT', logo: '', phone: '95311', website: 'https://www.zto.com', sort: 4, status: 1, createTime: '2024-01-01 00:00:00' },
  { id: 5, name: '韵达快递', code: 'YD', logo: '', phone: '95546', website: 'https://www.yundaex.com', sort: 5, status: 1, createTime: '2024-01-01 00:00:00' },
  { id: 6, name: '申通快递', code: 'ST', logo: '', phone: '95543', website: 'https://www.sto.cn', sort: 6, status: 0, createTime: '2024-01-01 00:00:00' },
  { id: 7, name: '邮政EMS', code: 'EMS', logo: '', phone: '11183', website: 'https://www.ems.com.cn', sort: 7, status: 1, createTime: '2024-01-01 00:00:00' },
  { id: 8, name: '德邦快递', code: 'DB', logo: '', phone: '95353', website: 'https://www.deppon.com', sort: 8, status: 0, createTime: '2024-01-01 00:00:00' }
]

const productNames = ['iPhone 15 Pro', 'MacBook Air M3', 'AirPods Pro', 'Nike Air Max', 'Adidas Ultraboost', '纯棉T恤', '智能手表', '蓝牙音箱', '游戏键盘', '机械鼠标', '保温杯', '双肩背包']
const skuSpecs = ['红色/128GB', '蓝色/256GB', '黑色/512GB', '白色/S码', '白色/M码', '白色/L码', '黑色/标准版', '银色/Pro版']
const inventoryListData: any[] = []
for (let i = 0; i < 20; i++) {
  const stock = Math.floor(Math.random() * 200)
  inventoryListData.push({
    id: i + 1,
    productName: productNames[i % productNames.length],
    skuCode: 'SKU' + String(1000 + i),
    specText: skuSpecs[i % skuSpecs.length],
    stock,
    warningThreshold: 10,
    price: (Math.random() * 5000 + 50).toFixed(2),
    sales: Math.floor(Math.random() * 300),
    lastChangeTime: Mock.Random.datetime()
  })
}

const stockFlowData: any[] = []
const flowTypes = [
  { type: 'in', text: '入库' },
  { type: 'out', text: '出库' },
  { type: 'adjust', text: '调整' },
  { type: 'return', text: '退货入库' }
]
const flowReasons = ['采购入库', '订单出库', '盘点调整', '退货入库', '报损出库', '初始库存']
for (let i = 0; i < 30; i++) {
  const item = inventoryListData[Math.floor(Math.random() * inventoryListData.length)]
  const type = flowTypes[Math.floor(Math.random() * flowTypes.length)]
  const change = type.type === 'in' || type.type === 'return' ? Math.floor(Math.random() * 100) + 10 : -(Math.floor(Math.random() * 50) + 1)
  stockFlowData.push({
    id: i + 1,
    skuId: item.id,
    productName: item.productName,
    skuCode: item.skuCode,
    specText: item.specText,
    type: type.type,
    typeText: type.text,
    change,
    beforeStock: Math.floor(Math.random() * 200),
    afterStock: 0,
    reason: flowReasons[Math.floor(Math.random() * flowReasons.length)],
    operator: '管理员',
    createTime: Mock.Random.datetime()
  })
}
stockFlowData.forEach((f) => { f.afterStock = f.beforeStock + f.change })

export function setupLogisticsMock() {
  Mock.mock(/\/api\/logistics\/freight\/list/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const keyword = query.get('keyword') || ''
    let list = freightList
    if (keyword) list = list.filter((f) => f.name.includes(keyword))
    return { code: 200, message: '获取成功', data: { list, total: list.length } }
  })
  Mock.mock(/\/api\/logistics\/freight\/create/, 'post', () => ({ code: 200, message: '创建成功', data: { id: Date.now() } }))
  Mock.mock(/\/api\/logistics\/freight\/update\/\d+/, 'put', () => ({ code: 200, message: '更新成功', data: null }))
  Mock.mock(/\/api\/logistics\/freight\/delete\/\d+/, 'delete', () => ({ code: 200, message: '删除成功', data: null }))

  Mock.mock(/\/api\/logistics\/express\/list/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const keyword = query.get('keyword') || ''
    let list = expressList
    if (keyword) list = list.filter((e) => e.name.includes(keyword) || e.code.includes(keyword))
    return { code: 200, message: '获取成功', data: { list, total: list.length } }
  })
  Mock.mock(/\/api\/logistics\/express\/create/, 'post', () => ({ code: 200, message: '创建成功', data: { id: Date.now() } }))
  Mock.mock(/\/api\/logistics\/express\/update\/\d+/, 'put', () => ({ code: 200, message: '更新成功', data: null }))
  Mock.mock(/\/api\/logistics\/express\/delete\/\d+/, 'delete', () => ({ code: 200, message: '删除成功', data: null }))

  Mock.mock(/\/api\/logistics\/inventory\/list/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const page = Number(query.get('page')) || 1
    const pageSize = Number(query.get('pageSize')) || 10
    const keyword = query.get('keyword') || ''
    let list = inventoryListData
    if (keyword) list = list.filter((i) => i.productName.includes(keyword) || i.skuCode.includes(keyword))
    const start = (page - 1) * pageSize
    return { code: 200, message: '获取成功', data: { list: list.slice(start, start + pageSize), total: list.length } }
  })
  Mock.mock(/\/api\/logistics\/inventory\/update\/\d+/, 'put', () => ({ code: 200, message: '库存更新成功', data: null }))
  Mock.mock(/\/api\/logistics\/inventory\/batch-update/, 'put', () => ({ code: 200, message: '批量更新成功', data: null }))

  Mock.mock(/\/api\/logistics\/inventory\/flow/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const page = Number(query.get('page')) || 1
    const pageSize = Number(query.get('pageSize')) || 10
    const keyword = query.get('keyword') || ''
    const type = query.get('type')
    let list = stockFlowData
    if (keyword) list = list.filter((f) => f.productName.includes(keyword) || f.skuCode.includes(keyword))
    if (type) list = list.filter((f) => f.type === type)
    const start = (page - 1) * pageSize
    return { code: 200, message: '获取成功', data: { list: list.slice(start, start + pageSize), total: list.length } }
  })

  Mock.mock(/\/api\/logistics\/inventory\/warning/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const page = Number(query.get('page')) || 1
    const pageSize = Number(query.get('pageSize')) || 10
    const list = inventoryListData.filter((i) => i.stock <= i.warningThreshold)
    const start = (page - 1) * pageSize
    return { code: 200, message: '获取成功', data: { list: list.slice(start, start + pageSize), total: list.length } }
  })
  Mock.mock(/\/api\/logistics\/inventory\/warning-threshold\/\d+/, 'put', () => ({ code: 200, message: '预警阈值已设置', data: null }))
}
