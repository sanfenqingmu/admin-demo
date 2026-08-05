import Mock from 'mockjs'

const orderListData: any[] = []
const orderProducts = [
  { name: 'iPhone 15 Pro', price: 8999 },
  { name: 'MacBook Air M3', price: 9499 },
  { name: 'AirPods Pro', price: 1899 },
  { name: 'Nike Air Max 2024', price: 899 },
  { name: 'Adidas Ultraboost', price: 1299 },
  { name: '纯棉短袖T恤', price: 99 },
  { name: '智能手表', price: 2499 },
  { name: '蓝牙音箱', price: 599 },
  { name: '游戏键盘', price: 799 },
  { name: '机械鼠标', price: 299 }
]
const statuses = [
  { status: 0, text: '待付款', color: 'orange' },
  { status: 1, text: '待发货', color: 'blue' },
  { status: 2, text: '待收货', color: 'cyan' },
  { status: 3, text: '已完成', color: 'green' },
  { status: 4, text: '已关闭', color: 'default' }
]
const receivers = ['张三', '李四', '王五', '赵六', '钱七', '孙八']
for (let i = 0; i < 25; i++) {
  const statusIdx = Math.min(Math.floor(i / 5), 4)
  const product = orderProducts[Math.floor(Math.random() * orderProducts.length)]
  const qty = Math.floor(Math.random() * 3) + 1
  orderListData.push({
    id: i + 1,
    orderNo: 'ORD' + (Date.now() - i * 86400000).toString().slice(-10),
    status: statuses[statusIdx].status,
    statusText: statuses[statusIdx].text,
    receiver: receivers[i % receivers.length],
    phone: '138****' + String(1000 + i).padStart(4, '0'),
    address: '广东省深圳市南山区科技园' + (i + 1) + '栋',
    productName: product.name,
    productImage: '',
    price: product.price,
    quantity: qty,
    amount: (product.price * qty).toFixed(2),
    payMethod: ['微信支付', '支付宝', '银行卡'][Math.floor(Math.random() * 3)],
    remark: '',
    createTime: Mock.Random.datetime(),
    payTime: statuses[statusIdx].status >= 1 ? Mock.Random.datetime() : '',
    shipTime: statuses[statusIdx].status >= 2 ? Mock.Random.datetime() : ''
  })
}

const afterSaleListData: any[] = []
const afterSaleTypes = [
  { type: 1, text: '仅退款' },
  { type: 2, text: '退货退款' },
  { type: 3, text: '换货' }
]
const afterSaleStatuses = [
  { status: 0, text: '待审核' },
  { status: 1, text: '已同意' },
  { status: 2, text: '已拒绝' },
  { status: 3, text: '处理中' },
  { status: 4, text: '已完成' }
]
const reasons = ['商品质量问题', '商品与描述不符', '发错货', '不想要了', '其他原因']
for (let i = 0; i < 15; i++) {
  const order = orderListData[i % orderListData.length]
  const typeIdx = Math.floor(Math.random() * 3)
  const statusIdx = Math.floor(Math.random() * 5)
  afterSaleListData.push({
    id: i + 1,
    orderId: order.id,
    orderNo: order.orderNo,
    productName: order.productName,
    type: afterSaleTypes[typeIdx].type,
    typeText: afterSaleTypes[typeIdx].text,
    status: afterSaleStatuses[statusIdx].status,
    statusText: afterSaleStatuses[statusIdx].text,
    reason: reasons[Math.floor(Math.random() * reasons.length)],
    description: '',
    amount: order.amount,
    images: [],
    createTime: Mock.Random.datetime()
  })
}

const reviewListData: any[] = []
const reviewContents = [
  '东西很好用，质量不错！',
  '发货很快，包装也很好，五星好评！',
  '和描述的一样，值得购买',
  '用了一段时间来评价，非常满意',
  '性价比很高，推荐购买',
  '一般吧，没有想象中那么好',
  '做工精细，款式好看',
  '物流很快，第二天就到了',
  '客服态度很好，耐心解答问题',
  '会回购的，品质有保障'
]
for (let i = 0; i < 20; i++) {
  const order = orderListData[i % orderListData.length]
  const rating = Math.floor(Math.random() * 3) + 3
  reviewListData.push({
    id: i + 1,
    orderId: order.id,
    orderNo: order.orderNo,
    productName: order.productName,
    userName: '用户' + (i + 1),
    rating,
    content: reviewContents[i % reviewContents.length],
    images: [],
    reply: Math.random() > 0.5 ? '感谢您的评价，我们会继续努力！' : '',
    isHidden: false,
    createTime: Mock.Random.datetime()
  })
}

const consultListData: any[] = []
const consultQuestions = [
  '这个商品有现货吗？',
  '能便宜点吗？',
  '支持什么付款方式？',
  '发货用什么快递？',
  '多久能收到货？',
  '有赠品吗？',
  '能开发票吗？',
  '保修多久？',
  '可以退换货吗？',
  '有优惠券吗？'
]
for (let i = 0; i < 15; i++) {
  const product = orderProducts[i % orderProducts.length]
  consultListData.push({
    id: i + 1,
    userName: '用户' + (i + 1),
    productName: product.name,
    question: consultQuestions[i % consultQuestions.length],
    reply: Math.random() > 0.5 ? '亲，有的哦，现在拍下即可享受优惠！' : '',
    status: Math.random() > 0.3 ? 1 : 0,
    createTime: Mock.Random.datetime()
  })
}

export function setupOrderMock() {
  Mock.mock(/\/api\/order\/list/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const page = Number(query.get('page')) || 1
    const pageSize = Number(query.get('pageSize')) || 10
    const keyword = query.get('keyword') || ''
    const status = query.get('status')
    const startDate = query.get('startDate')
    const endDate = query.get('endDate')
    let list = orderListData
    if (keyword) list = list.filter((o) => o.orderNo.includes(keyword) || o.receiver.includes(keyword))
    if (status !== null && status !== undefined) list = list.filter((o) => o.status === Number(status))
    if (startDate) list = list.filter((o) => o.createTime >= startDate)
    if (endDate) list = list.filter((o) => o.createTime <= endDate)
    const start = (page - 1) * pageSize
    return { code: 200, message: '获取成功', data: { list: list.slice(start, start + pageSize), total: list.length } }
  })

  Mock.mock(/\/api\/order\/detail\/\d+/, 'get', (options: any) => {
    const id = Number(options.url.match(/\/detail\/(\d+)/)?.[1] || 0)
    const order = orderListData.find((o) => o.id === id)
    return { code: 200, message: '获取成功', data: order }
  })

  Mock.mock(/\/api\/order\/ship\/\d+/, 'put', () => ({ code: 200, message: '发货成功', data: null }))
  Mock.mock(/\/api\/order\/remark\/\d+/, 'put', () => ({ code: 200, message: '备注成功', data: null }))
  Mock.mock(/\/api\/order\/close\/\d+/, 'put', () => ({ code: 200, message: '关闭成功', data: null }))

  Mock.mock(/\/api\/order\/after-sale\/list/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const page = Number(query.get('page')) || 1
    const pageSize = Number(query.get('pageSize')) || 10
    const status = query.get('status')
    let list = afterSaleListData
    if (status !== null && status !== undefined) list = list.filter((a) => a.status === Number(status))
    const start = (page - 1) * pageSize
    return { code: 200, message: '获取成功', data: { list: list.slice(start, start + pageSize), total: list.length } }
  })
  Mock.mock(/\/api\/order\/after-sale\/review\/\d+/, 'put', () => ({ code: 200, message: '审核成功', data: null }))

  Mock.mock(/\/api\/order\/review\/list/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const page = Number(query.get('page')) || 1
    const pageSize = Number(query.get('pageSize')) || 10
    const keyword = query.get('keyword') || ''
    const hasReply = query.get('hasReply')
    let list = reviewListData
    if (keyword) list = list.filter((r) => r.content.includes(keyword) || r.userName.includes(keyword))
    if (hasReply === 'yes') list = list.filter((r) => r.reply)
    if (hasReply === 'no') list = list.filter((r) => !r.reply)
    const start = (page - 1) * pageSize
    return { code: 200, message: '获取成功', data: { list: list.slice(start, start + pageSize), total: list.length } }
  })
  Mock.mock(/\/api\/order\/review\/reply\/\d+/, 'put', () => ({ code: 200, message: '回复成功', data: null }))
  Mock.mock(/\/api\/order\/review\/hide\/\d+/, 'put', () => ({ code: 200, message: '操作成功', data: null }))

  Mock.mock(/\/api\/order\/consult\/list/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const page = Number(query.get('page')) || 1
    const pageSize = Number(query.get('pageSize')) || 10
    const keyword = query.get('keyword') || ''
    const status = query.get('status')
    let list = consultListData
    if (keyword) list = list.filter((c) => c.question.includes(keyword) || c.userName.includes(keyword))
    if (status !== null && status !== undefined) list = list.filter((c) => c.status === Number(status))
    const start = (page - 1) * pageSize
    return { code: 200, message: '获取成功', data: { list: list.slice(start, start + pageSize), total: list.length } }
  })
  Mock.mock(/\/api\/order\/consult\/reply\/\d+/, 'put', () => ({ code: 200, message: '回复成功', data: null }))
  Mock.mock(/\/api\/order\/consult\/delete\/\d+/, 'delete', () => ({ code: 200, message: '删除成功', data: null }))
}
