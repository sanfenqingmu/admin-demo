import Mock from 'mockjs'

const levelList = [
  { id: 1, name: '普通会员', level: 1, minPoints: 0, maxPoints: 999, discount: 1.0, status: 1, icon: '', benefits: '基础权益', createTime: '2024-01-01 00:00:00' },
  { id: 2, name: '银卡会员', level: 2, minPoints: 1000, maxPoints: 4999, discount: 0.95, status: 1, icon: '', benefits: '9.5折优惠、专属客服', createTime: '2024-01-01 00:00:00' },
  { id: 3, name: '金卡会员', level: 3, minPoints: 5000, maxPoints: 19999, discount: 0.9, status: 1, icon: '', benefits: '9折优惠、生日礼包、免费配送', createTime: '2024-01-01 00:00:00' },
  { id: 4, name: '钻石会员', level: 4, minPoints: 20000, maxPoints: 999999, discount: 0.85, status: 1, icon: '', benefits: '8.5折优惠、专属活动、优先购买', createTime: '2024-01-01 00:00:00' }
]

const memberListData: any[] = []
const nickNames = ['小明', '小红', '张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二']
for (let i = 0; i < 20; i++) {
  const status = Math.random() > 0.2 ? 1 : 0
  const level = Math.floor(Math.random() * 4) + 1
  memberListData.push({
    id: i + 1,
    nickname: nickNames[i % nickNames.length] + (i + 1),
    avatar: '',
    phone: '138****' + String(1000 + i).padStart(4, '0'),
    levelId: level,
    levelName: levelList[level - 1].name,
    points: Math.floor(Math.random() * 30000),
    balance: (Math.random() * 5000).toFixed(2),
    totalSpent: (Math.random() * 100000).toFixed(2),
    orderCount: Math.floor(Math.random() * 50),
    status,
    registerTime: Mock.Random.datetime(),
    lastLoginTime: Mock.Random.datetime()
  })
}

const pointsFlowData: any[] = []
const pointsTypes = [
  { type: 'earn', text: '消费获得' },
  { type: 'earn', text: '签到奖励' },
  { type: 'earn', text: '活动奖励' },
  { type: 'spend', text: '积分抵扣' },
  { type: 'spend', text: '积分兑换' },
  { type: 'adjust', text: '管理员调整' }
]
for (let i = 0; i < 30; i++) {
  const member = memberListData[Math.floor(Math.random() * memberListData.length)]
  const type = pointsTypes[Math.floor(Math.random() * pointsTypes.length)]
  pointsFlowData.push({
    id: i + 1,
    memberId: member.id,
    memberName: member.nickname,
    type: type.type,
    typeText: type.text,
    points: type.type === 'spend' ? -(Math.floor(Math.random() * 500) + 10) : Math.floor(Math.random() * 1000) + 10,
    balance: Math.floor(Math.random() * 30000),
    remark: '',
    createTime: Mock.Random.datetime()
  })
}

const balanceFlowData: any[] = []
const balanceTypes = [
  { type: 'recharge', text: '充值' },
  { type: 'consume', text: '消费' },
  { type: 'refund', text: '退款' },
  { type: 'adjust', text: '管理员调整' }
]
for (let i = 0; i < 30; i++) {
  const member = memberListData[Math.floor(Math.random() * memberListData.length)]
  const type = balanceTypes[Math.floor(Math.random() * balanceTypes.length)]
  const amount = (Math.random() * 2000 + 10).toFixed(2)
  balanceFlowData.push({
    id: i + 1,
    memberId: member.id,
    memberName: member.nickname,
    type: type.type,
    typeText: type.text,
    amount: type.type === 'consume' || type.type === 'refund' ? `-${amount}` : amount,
    balance: (Math.random() * 5000).toFixed(2),
    remark: '',
    createTime: Mock.Random.datetime()
  })
}

export function setupMemberMock() {
  Mock.mock(/\/api\/member\/list/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const page = Number(query.get('page')) || 1
    const pageSize = Number(query.get('pageSize')) || 10
    const keyword = query.get('keyword') || ''
    const status = query.get('status')
    const levelId = query.get('levelId')
    let list = memberListData
    if (keyword) list = list.filter((m) => m.nickname.includes(keyword) || m.phone.includes(keyword))
    if (status !== null && status !== undefined) list = list.filter((m) => m.status === Number(status))
    if (levelId) list = list.filter((m) => m.levelId === Number(levelId))
    const start = (page - 1) * pageSize
    return { code: 200, message: '获取成功', data: { list: list.slice(start, start + pageSize), total: list.length } }
  })

  Mock.mock(/\/api\/member\/detail\/\d+/, 'get', (options: any) => {
    const id = Number(options.url.match(/\/detail\/(\d+)/)?.[1] || 0)
    const member = memberListData.find((m) => m.id === id)
    return { code: 200, message: '获取成功', data: member }
  })

  Mock.mock(/\/api\/member\/freeze\/\d+/, 'put', () => ({ code: 200, message: '冻结成功', data: null }))
  Mock.mock(/\/api\/member\/unfreeze\/\d+/, 'put', () => ({ code: 200, message: '解禁成功', data: null }))

  Mock.mock(/\/api\/member\/\d+\/orders/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const page = Number(query.get('page')) || 1
    const pageSize = Number(query.get('pageSize')) || 10
    const start = (page - 1) * pageSize
    const orders: any[] = []
    for (let i = 0; i < 5; i++) {
      orders.push({
        id: i + 1,
        orderNo: 'ORD' + Date.now() + i,
        productName: '商品' + (i + 1),
        amount: (Math.random() * 1000 + 50).toFixed(2),
        status: Math.floor(Math.random() * 3),
        createTime: Mock.Random.datetime()
      })
    }
    return { code: 200, message: '获取成功', data: { list: orders.slice(start, start + pageSize), total: orders.length } }
  })

  Mock.mock(/\/api\/member\/level\/list/, 'get', () => ({ code: 200, message: '获取成功', data: levelList }))
  Mock.mock(/\/api\/member\/level\/create/, 'post', () => ({ code: 200, message: '创建成功', data: { id: Date.now() } }))
  Mock.mock(/\/api\/member\/level\/update\/\d+/, 'put', () => ({ code: 200, message: '更新成功', data: null }))
  Mock.mock(/\/api\/member\/level\/delete\/\d+/, 'delete', () => ({ code: 200, message: '删除成功', data: null }))

  Mock.mock(/\/api\/member\/points\/flow/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const page = Number(query.get('page')) || 1
    const pageSize = Number(query.get('pageSize')) || 10
    const keyword = query.get('keyword') || ''
    const type = query.get('type')
    let list = pointsFlowData
    if (keyword) list = list.filter((f) => f.memberName.includes(keyword))
    if (type) list = list.filter((f) => f.type === type)
    const start = (page - 1) * pageSize
    return { code: 200, message: '获取成功', data: { list: list.slice(start, start + pageSize), total: list.length } }
  })

  Mock.mock(/\/api\/member\/balance\/flow/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const page = Number(query.get('page')) || 1
    const pageSize = Number(query.get('pageSize')) || 10
    const keyword = query.get('keyword') || ''
    const type = query.get('type')
    let list = balanceFlowData
    if (keyword) list = list.filter((f) => f.memberName.includes(keyword))
    if (type) list = list.filter((f) => f.type === type)
    const start = (page - 1) * pageSize
    return { code: 200, message: '获取成功', data: { list: list.slice(start, start + pageSize), total: list.length } }
  })

  Mock.mock(/\/api\/member\/options/, 'get', () => {
    const options = memberListData.map((m) => ({ id: m.id, name: m.nickname }))
    return { code: 200, message: '获取成功', data: options }
  })
}
