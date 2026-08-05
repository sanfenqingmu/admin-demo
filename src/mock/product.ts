import Mock from 'mockjs'

const categoryTree = [
  {
    id: 1, parentId: 0, name: '服装鞋包', sort: 1, status: 1,
    children: [
      { id: 11, parentId: 1, name: '男装', sort: 1, status: 1 },
      { id: 12, parentId: 1, name: '女装', sort: 2, status: 1 },
      { id: 13, parentId: 1, name: '运动鞋', sort: 3, status: 1 }
    ]
  },
  {
    id: 2, parentId: 0, name: '数码电器', sort: 2, status: 1,
    children: [
      { id: 21, parentId: 2, name: '手机', sort: 1, status: 1 },
      { id: 22, parentId: 2, name: '电脑', sort: 2, status: 1 },
      { id: 23, parentId: 2, name: '配件', sort: 3, status: 1 }
    ]
  },
  {
    id: 3, parentId: 0, name: '食品生鲜', sort: 3, status: 1,
    children: [
      { id: 31, parentId: 3, name: '零食', sort: 1, status: 1 },
      { id: 32, parentId: 3, name: '水果', sort: 2, status: 1 }
    ]
  }
]

const brandList = [
  { id: 1, name: 'Apple', logo: '', description: '苹果公司', sort: 1, status: 1, createTime: '2024-01-01 00:00:00' },
  { id: 2, name: '华为', logo: '', description: '华为技术有限公司', sort: 2, status: 1, createTime: '2024-01-02 00:00:00' },
  { id: 3, name: '小米', logo: '', description: '小米科技', sort: 3, status: 1, createTime: '2024-01-03 00:00:00' },
  { id: 4, name: 'Nike', logo: '', description: '耐克', sort: 4, status: 1, createTime: '2024-01-04 00:00:00' },
  { id: 5, name: 'Adidas', logo: '', description: '阿迪达斯', sort: 5, status: 0, createTime: '2024-01-05 00:00:00' }
]

const specList = [
  {
    id: 1, name: '颜色', values: [
      { id: 101, name: '红色' }, { id: 102, name: '蓝色' }, { id: 103, name: '黑色' }, { id: 104, name: '白色' }
    ]
  },
  {
    id: 2, name: '尺码', values: [
      { id: 201, name: 'S' }, { id: 202, name: 'M' }, { id: 203, name: 'L' }, { id: 204, name: 'XL' }
    ]
  },
  {
    id: 3, name: '容量', values: [
      { id: 301, name: '128GB' }, { id: 302, name: '256GB' }, { id: 303, name: '512GB' }, { id: 304, name: '1TB' }
    ]
  }
]

const productListData: any[] = []
const productNames = ['iPhone 15 Pro', 'MacBook Air M3', 'AirPods Pro', 'Apple Watch', 'iPad Pro', '小米14', '华为Mate60', 'Nike Air Max', 'Adidas Ultraboost', 'T恤短袖', '运动鞋', '牛仔裤']
for (let i = 0; i < 12; i++) {
  productListData.push({
    id: i + 1,
    name: productNames[i],
    categoryId: Math.floor(Math.random() * 3) + 1,
    categoryName: categoryTree[Math.floor(Math.random() * 3)].name,
    brandId: Math.floor(Math.random() * 5) + 1,
    brandName: brandList[Math.floor(Math.random() * 5)].name,
    price: (Math.random() * 10000 + 100).toFixed(2),
    stock: Math.floor(Math.random() * 1000),
    mainImage: '',
    status: Math.random() > 0.3 ? 1 : 0,
    sales: Math.floor(Math.random() * 500),
    createTime: Mock.Random.datetime()
  })
}

const recycleListData: any[] = []
for (let i = 0; i < 5; i++) {
  recycleListData.push({
    id: i + 100,
    name: '回收站商品 ' + (i + 1),
    categoryName: '服装鞋包',
    price: (Math.random() * 1000 + 50).toFixed(2),
    stock: Math.floor(Math.random() * 100),
    deletedAt: Mock.Random.datetime(),
    remainDays: Math.floor(Math.random() * 15) + 1
  })
}

const materialListData: any[] = []
const materialTypes = ['image', 'video', 'file']
for (let i = 0; i < 30; i++) {
  const type = materialTypes[Math.floor(Math.random() * materialTypes.length)]
  materialListData.push({
    id: i + 1,
    name: '素材_' + (i + 1) + (type === 'image' ? '.jpg' : type === 'video' ? '.mp4' : '.pdf'),
    type,
    size: (Math.random() * 10 + 0.5).toFixed(2) + 'MB',
    url: '',
    folderId: Math.floor(Math.random() * 3) + 1,
    createTime: Mock.Random.datetime()
  })
}

const materialFolders = [
  { id: 1, name: '商品图片', count: 15 },
  { id: 2, name: '广告素材', count: 8 },
  { id: 3, name: '视频素材', count: 7 }
]

export function setupProductMock() {
  Mock.mock(/\/api\/product\/category\/tree/, 'get', () => ({ code: 200, message: '获取成功', data: categoryTree }))
  Mock.mock(/\/api\/product\/category\/create/, 'post', () => ({ code: 200, message: '创建成功', data: { id: Date.now() } }))
  Mock.mock(/\/api\/product\/category\/update\/\d+/, 'put', () => ({ code: 200, message: '更新成功', data: null }))
  Mock.mock(/\/api\/product\/category\/delete\/\d+/, 'delete', () => ({ code: 200, message: '删除成功', data: null }))

  Mock.mock(/\/api\/product\/brand\/list/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const keyword = query.get('keyword') || ''
    let list = brandList
    if (keyword) list = list.filter((b) => b.name.includes(keyword))
    return { code: 200, message: '获取成功', data: { list, total: list.length } }
  })
  Mock.mock(/\/api\/product\/brand\/create/, 'post', () => ({ code: 200, message: '创建成功', data: { id: Date.now() } }))
  Mock.mock(/\/api\/product\/brand\/update\/\d+/, 'put', () => ({ code: 200, message: '更新成功', data: null }))
  Mock.mock(/\/api\/product\/brand\/delete\/\d+/, 'delete', () => ({ code: 200, message: '删除成功', data: null }))

  Mock.mock(/\/api\/product\/spec\/list/, 'get', () => ({ code: 200, message: '获取成功', data: specList }))
  Mock.mock(/\/api\/product\/spec\/create/, 'post', () => ({ code: 200, message: '创建成功', data: { id: Date.now() } }))
  Mock.mock(/\/api\/product\/spec\/update\/\d+/, 'put', () => ({ code: 200, message: '更新成功', data: null }))
  Mock.mock(/\/api\/product\/spec\/delete\/\d+/, 'delete', () => ({ code: 200, message: '删除成功', data: null }))

  Mock.mock(/\/api\/product\/spec\/\d+\/values/, 'get', (options: any) => {
    const match = options.url.match(/\/spec\/(\d+)\/values/)
    const specId = Number(match?.[1] || 0)
    const spec = specList.find((s) => s.id === specId)
    return { code: 200, message: '获取成功', data: spec?.values || [] }
  })
  Mock.mock(/\/api\/product\/spec\/\d+\/values/, 'post', () => ({ code: 200, message: '创建成功', data: { id: Date.now() } }))
  Mock.mock(/\/api\/product\/spec\/\d+\/values\/\d+/, 'delete', () => ({ code: 200, message: '删除成功', data: null }))

  Mock.mock(/\/api\/product\/list/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const page = Number(query.get('page')) || 1
    const pageSize = Number(query.get('pageSize')) || 10
    const keyword = query.get('keyword') || ''
    const categoryId = query.get('categoryId')
    const status = query.get('status')
    let list = productListData
    if (keyword) list = list.filter((p) => p.name.includes(keyword))
    if (categoryId) list = list.filter((p) => p.categoryId === Number(categoryId))
    if (status !== null && status !== undefined) list = list.filter((p) => p.status === Number(status))
    const start = (page - 1) * pageSize
    return { code: 200, message: '获取成功', data: { list: list.slice(start, start + pageSize), total: list.length } }
  })

  Mock.mock(/\/api\/product\/detail\/\d+/, 'get', (options: any) => {
    const id = Number(options.url.match(/\/detail\/(\d+)/)?.[1] || 0)
    const product = productListData.find((p) => p.id === id)
    return {
      code: 200, message: '获取成功',
      data: product ? {
        ...product,
        description: Mock.Random.cparagraph(5, 10),
        images: ['', '', ''],
        skuList: [
          { id: 1, specText: '红色 / 128GB', price: product.price, stock: 50, skuCode: 'SKU001' },
          { id: 2, specText: '蓝色 / 256GB', price: (Number(product.price) + 200).toFixed(2), stock: 30, skuCode: 'SKU002' }
        ]
      } : null
    }
  })

  Mock.mock(/\/api\/product\/create/, 'post', () => ({ code: 200, message: '创建成功', data: { id: Date.now() } }))
  Mock.mock(/\/api\/product\/update\/\d+/, 'put', () => ({ code: 200, message: '更新成功', data: null }))
  Mock.mock(/\/api\/product\/delete\/\d+/, 'delete', () => ({ code: 200, message: '删除成功', data: null }))
  Mock.mock(/\/api\/product\/batch\/status/, 'put', () => ({ code: 200, message: '操作成功', data: null }))
  Mock.mock(/\/api\/product\/batch\/stock/, 'put', () => ({ code: 200, message: '操作成功', data: null }))
  Mock.mock(/\/api\/product\/batch\/price/, 'put', () => ({ code: 200, message: '操作成功', data: null }))

  Mock.mock(/\/api\/product\/recycle\/list/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const page = Number(query.get('page')) || 1
    const pageSize = Number(query.get('pageSize')) || 10
    const start = (page - 1) * pageSize
    return { code: 200, message: '获取成功', data: { list: recycleListData.slice(start, start + pageSize), total: recycleListData.length } }
  })
  Mock.mock(/\/api\/product\/recycle\/restore\/\d+/, 'put', () => ({ code: 200, message: '恢复成功', data: null }))
  Mock.mock(/\/api\/product\/recycle\/delete\/\d+/, 'delete', () => ({ code: 200, message: '删除成功', data: null }))
  Mock.mock(/\/api\/product\/recycle\/clear/, 'delete', () => ({ code: 200, message: '清空成功', data: null }))

  Mock.mock(/\/api\/product\/material\/list/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const page = Number(query.get('page')) || 1
    const pageSize = Number(query.get('pageSize')) || 20
    const folderId = query.get('folderId')
    let list = materialListData
    if (folderId) list = list.filter((m) => m.folderId === Number(folderId))
    const start = (page - 1) * pageSize
    return { code: 200, message: '获取成功', data: { list: list.slice(start, start + pageSize), total: list.length } }
  })
  Mock.mock(/\/api\/product\/material\/upload/, 'post', () => ({ code: 200, message: '上传成功', data: { id: Date.now(), url: '' } }))
  Mock.mock(/\/api\/product\/material\/delete\/\d+/, 'delete', () => ({ code: 200, message: '删除成功', data: null }))
  Mock.mock(/\/api\/product\/material\/move\/\d+/, 'put', () => ({ code: 200, message: '移动成功', data: null }))
  Mock.mock(/\/api\/product\/material\/folders/, 'get', () => ({ code: 200, message: '获取成功', data: materialFolders }))
}
