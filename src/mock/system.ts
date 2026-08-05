import Mock from 'mockjs'

const accountList = Mock.mock({
  'list|15': [
    {
      'id|+1': 1,
      username: '@word(4, 8)',
      nickname: '@cname',
      email: '@email',
      phone: /1[3-9]\d{9}/,
      'status|1': [1, 0],
      'roles|1': [['管理员'], ['编辑员'], ['普通用户']],
      createTime: '@datetime'
    }
  ]
}).list

const roleList = [
  { id: 1, name: '超级管理员', code: 'admin', description: '拥有所有权限', status: 1, createTime: '2024-01-01 00:00:00' },
  { id: 2, name: '编辑员', code: 'editor', description: '可编辑内容', status: 1, createTime: '2024-01-02 00:00:00' },
  { id: 3, name: '普通用户', code: 'user', description: '仅可查看', status: 1, createTime: '2024-01-03 00:00:00' },
  { id: 4, name: '访客', code: 'guest', description: '只读权限', status: 0, createTime: '2024-01-04 00:00:00' }
]

const menuList = [
  {
    id: 1, parentId: 0, name: '仪表盘', type: 'menu', path: '/dashboard', component: 'views/dashboard/index', icon: 'DashboardOutlined', sort: 1, visible: true, status: 1
  },
  {
    id: 2, parentId: 0, name: '用户管理', type: 'menu', path: '/user', component: '', icon: 'UserOutlined', sort: 2, visible: true, status: 1,
    children: [
      { id: 21, parentId: 2, name: '用户列表', type: 'menu', path: '/user/list', component: 'views/user/list', icon: 'TeamOutlined', sort: 1, visible: true, status: 1 }
    ]
  },
  {
    id: 3, parentId: 0, name: '系统管理', type: 'menu', path: '/system', component: '', icon: 'SettingOutlined', sort: 3, visible: true, status: 1,
    children: [
      { id: 31, parentId: 3, name: '个人中心', type: 'menu', path: '/system/profile', component: 'views/system/profile', icon: 'UserOutlined', sort: 1, visible: true, status: 1 },
      { id: 32, parentId: 3, name: '账号管理', type: 'menu', path: '/system/account', component: 'views/system/account', icon: 'UserAddOutlined', sort: 2, visible: true, status: 1 },
      { id: 33, parentId: 3, name: '角色管理', type: 'menu', path: '/system/role', component: 'views/system/role', icon: 'SafetyOutlined', sort: 3, visible: true, status: 1 },
      { id: 34, parentId: 3, name: '菜单管理', type: 'menu', path: '/system/menu', component: 'views/system/menu', icon: 'MenuOutlined', sort: 4, visible: true, status: 1 },
      { id: 35, parentId: 3, name: '按钮权限', type: 'menu', path: '/system/permission', component: 'views/system/permission', icon: 'LockOutlined', sort: 5, visible: true, status: 1 },
      { id: 36, parentId: 3, name: '字典管理', type: 'menu', path: '/system/dict', component: 'views/system/dict', icon: 'BookOutlined', sort: 6, visible: true, status: 1 },
      { id: 37, parentId: 3, name: '基础设置', type: 'menu', path: '/system/settings', component: 'views/system/settings', icon: 'ToolOutlined', sort: 7, visible: true, status: 1 },
      {
        id: 38, parentId: 3, name: '日志管理', type: 'menu', path: '/system/log', component: '', icon: 'FileTextOutlined', sort: 8, visible: true, status: 1,
        children: [
          { id: 381, parentId: 38, name: '操作日志', type: 'menu', path: '/system/log/operation', component: 'views/system/logs/operation', icon: 'EditOutlined', sort: 1, visible: true, status: 1 },
          { id: 382, parentId: 38, name: '登录日志', type: 'menu', path: '/system/log/login', component: 'views/system/logs/login', icon: 'LoginOutlined', sort: 2, visible: true, status: 1 }
        ]
      }
    ]
  }
]

const permissionList = [
  { id: 1, menuId: 21, menuName: '用户列表', name: '查看用户', code: 'user:view', identifier: 'btn-view-user', sort: 1, status: 1 },
  { id: 2, menuId: 21, menuName: '用户列表', name: '新增用户', code: 'user:add', identifier: 'btn-add-user', sort: 2, status: 1 },
  { id: 3, menuId: 21, menuName: '用户列表', name: '编辑用户', code: 'user:edit', identifier: 'btn-edit-user', sort: 3, status: 1 },
  { id: 4, menuId: 21, menuName: '用户列表', name: '删除用户', code: 'user:delete', identifier: 'btn-delete-user', sort: 4, status: 1 },
  { id: 5, menuId: 32, menuName: '账号管理', name: '查看账号', code: 'account:view', identifier: 'btn-view-account', sort: 1, status: 1 },
  { id: 6, menuId: 32, menuName: '账号管理', name: '新增账号', code: 'account:add', identifier: 'btn-add-account', sort: 2, status: 1 },
  { id: 7, menuId: 32, menuName: '账号管理', name: '编辑账号', code: 'account:edit', identifier: 'btn-edit-account', sort: 3, status: 1 },
  { id: 8, menuId: 33, menuName: '角色管理', name: '查看角色', code: 'role:view', identifier: 'btn-view-role', sort: 1, status: 1 },
  { id: 9, menuId: 33, menuName: '角色管理', name: '分配权限', code: 'role:perm', identifier: 'btn-assign-perm', sort: 2, status: 1 },
  { id: 10, menuId: 34, menuName: '菜单管理', name: '管理菜单', code: 'menu:manage', identifier: 'btn-manage-menu', sort: 1, status: 1 },
  { id: 11, menuId: 35, menuName: '按钮权限', name: '管理权限', code: 'perm:manage', identifier: 'btn-manage-perm', sort: 1, status: 1 }
]

const dictTypeList = [
  { id: 1, name: '订单状态', code: 'order_status', description: '订单相关状态' },
  { id: 2, name: '商品上下架', code: 'product_status', description: '商品上架/下架' },
  { id: 3, name: '支付方式', code: 'pay_method', description: '各种支付方式' },
  { id: 4, name: '用户状态', code: 'user_status', description: '账号启用/禁用' },
  { id: 5, name: '系统开关', code: 'sys_switch', description: '通用启用/禁用' }
]

const dictItemMap: Record<number, any[]> = {
  1: [
    { id: 101, typeId: 1, label: '待支付', value: '0', color: 'orange', sort: 1 },
    { id: 102, typeId: 1, label: '已支付', value: '1', color: 'blue', sort: 2 },
    { id: 103, typeId: 1, label: '已发货', value: '2', color: 'green', sort: 3 },
    { id: 104, typeId: 1, label: '已完成', value: '3', color: 'green', sort: 4 },
    { id: 105, typeId: 1, label: '已取消', value: '-1', color: 'red', sort: 5 }
  ],
  2: [
    { id: 201, typeId: 2, label: '已上架', value: '1', color: 'green', sort: 1 },
    { id: 202, typeId: 2, label: '已下架', value: '0', color: 'gray', sort: 2 }
  ],
  3: [
    { id: 301, typeId: 3, label: '微信支付', value: 'wechat', color: 'green', sort: 1 },
    { id: 302, typeId: 3, label: '支付宝', value: 'alipay', color: 'blue', sort: 2 },
    { id: 303, typeId: 3, label: '银联', value: 'unionpay', color: 'red', sort: 3 },
    { id: 304, typeId: 3, label: '货到付款', value: 'cod', color: 'orange', sort: 4 }
  ],
  4: [
    { id: 401, typeId: 4, label: '启用', value: '1', color: 'green', sort: 1 },
    { id: 402, typeId: 4, label: '禁用', value: '0', color: 'red', sort: 2 }
  ],
  5: [
    { id: 501, typeId: 5, label: '开启', value: '1', color: 'green', sort: 1 },
    { id: 502, typeId: 5, label: '关闭', value: '0', color: 'gray', sort: 2 }
  ]
}

const operationLogList: any[] = []
const operationModules = ['登录', '用户管理', '角色管理', '菜单管理', '系统设置']
const operationActions = ['新增', '编辑', '删除', '查询', '登录', '退出']
const operationMethods = ['GET', 'POST', 'PUT', 'DELETE']
const operationIps = ['192.168.1.100', '10.0.0.55', '172.16.0.88']
for (let i = 0; i < 30; i++) {
  const status = Math.random() > 0.2 ? 1 : 0
  operationLogList.push({
    id: i + 1,
    username: Mock.Random.cname(),
    module: operationModules[Math.floor(Math.random() * operationModules.length)],
    action: operationActions[Math.floor(Math.random() * operationActions.length)],
    method: operationMethods[Math.floor(Math.random() * operationMethods.length)],
    url: '/api/system/' + Mock.Random.word(4, 8),
    params: Mock.Random.string(10, 40),
    ip: operationIps[Math.floor(Math.random() * operationIps.length)],
    costTime: Mock.Random.integer(10, 500),
    status,
    errorMsg: status === 0 ? '参数错误' : '',
    createTime: Mock.Random.datetime()
  })
}

const loginLogList: any[] = []
const loginIps = ['192.168.1.100', '10.0.0.55', '172.16.0.88', '127.0.0.1']
const browsers = ['Chrome', 'Firefox', 'Edge', 'Safari']
const osList = ['Windows 10', 'macOS 14', 'Ubuntu 22.04', 'iOS 17']
for (let i = 0; i < 20; i++) {
  const status = Math.random() > 0.15 ? 1 : 0
  loginLogList.push({
    id: i + 1,
    username: Mock.Random.word(4, 8),
    ip: loginIps[Math.floor(Math.random() * loginIps.length)],
    browser: browsers[Math.floor(Math.random() * browsers.length)],
    os: osList[Math.floor(Math.random() * osList.length)],
    status,
    failReason: status === 0 ? '密码错误' : '',
    loginTime: Mock.Random.datetime()
  })
}

const settingsData = {
  siteName: '后台管理系统',
  logo: '/logo.png',
  favicon: '/favicon.ico',
  icp: '京ICP备00000000号',
  copyright: '© 2024 Admin System',
  customerService: '400-888-8888',
  customerEmail: 'service@example.com',
  uploadDriver: 'local',
  uploadExts: ['jpg', 'png', 'gif'],
  uploadMaxSize: 10,
  uploadPath: '/uploads',
  timezone: 'Asia/Shanghai',
  language: 'zh-CN',
  dateFormat: 'YYYY-MM-DD',
  logEnabled: true,
  logDays: 30,
  sessionTimeout: 30
}

const profileData = {
  id: 1,
  username: 'admin',
  nickname: '管理员',
  email: 'admin@example.com',
  phone: '13800138000'
}

export function setupSystemMock() {
  Mock.mock(/\/api\/system\/profile/, 'get', () => ({ code: 200, message: '获取成功', data: profileData }))
  Mock.mock(/\/api\/system\/profile/, 'put', () => ({ code: 200, message: '更新成功', data: null }))
  Mock.mock(/\/api\/system\/password/, 'put', () => ({ code: 200, message: '修改成功', data: null }))

  Mock.mock(/\/api\/system\/account\/list/, 'get', (options: any) => {
    const body = JSON.parse(options.body || '{}')
    const page = body.page || 1
    const pageSize = body.pageSize || 10
    const keyword = body.keyword || ''
    let list = accountList
    if (keyword) {
      list = list.filter((item: any) => item.username.includes(keyword) || item.nickname.includes(keyword))
    }
    const start = (page - 1) * pageSize
    return { code: 200, message: '获取成功', data: { list: list.slice(start, start + pageSize), total: list.length } }
  })
  Mock.mock(/\/api\/system\/account\/create/, 'post', () => ({ code: 200, message: '创建成功', data: { id: Date.now() } }))
  Mock.mock(/\/api\/system\/account\/update\/\d+/, 'put', () => ({ code: 200, message: '更新成功', data: null }))
  Mock.mock(/\/api\/system\/account\/delete\/\d+/, 'delete', () => ({ code: 200, message: '删除成功', data: null }))

  Mock.mock(/\/api\/system\/role\/list/, 'get', () => ({ code: 200, message: '获取成功', data: roleList }))
  Mock.mock(/\/api\/system\/role\/create/, 'post', () => ({ code: 200, message: '创建成功', data: { id: Date.now() } }))
  Mock.mock(/\/api\/system\/role\/update\/\d+/, 'put', () => ({ code: 200, message: '更新成功', data: null }))
  Mock.mock(/\/api\/system\/role\/delete\/\d+/, 'delete', () => ({ code: 200, message: '删除成功', data: null }))

  const rolePermissions: Record<number, string[]> = {
    1: ['menu-1', 'menu-2', 'menu-21', 'menu-3', 'menu-31', 'menu-32', 'menu-33', 'menu-34', 'menu-35', 'menu-36', 'menu-37', 'menu-38', 'menu-381', 'menu-382',
        'perm-1', 'perm-2', 'perm-3', 'perm-4', 'perm-5', 'perm-6', 'perm-7', 'perm-8', 'perm-9', 'perm-10', 'perm-11'],
    2: ['menu-1', 'menu-2', 'menu-21', 'perm-1', 'perm-3'],
    3: ['menu-1', 'perm-1']
  }
  Mock.mock(/\/api\/system\/role\/\d+\/permissions/, 'get', (options: any) => {
    const match = options.url.match(/\/role\/(\d+)\/permissions/)
    const roleId = Number(match?.[1] || 0)
    return { code: 200, message: '获取成功', data: rolePermissions[roleId] || [] }
  })
  Mock.mock(/\/api\/system\/role\/\d+\/permissions/, 'put', (options: any) => {
    const match = options.url.match(/\/role\/(\d+)\/permissions/)
    const roleId = Number(match?.[1] || 0)
    const body = JSON.parse(options.body || '{}')
    rolePermissions[roleId] = body.permissionKeys || []
    return { code: 200, message: '保存成功', data: null }
  })

  Mock.mock(/\/api\/system\/menu\/list/, 'get', () => ({ code: 200, message: '获取成功', data: menuList }))
  Mock.mock(/\/api\/system\/menu\/create/, 'post', () => ({ code: 200, message: '创建成功', data: { id: Date.now() } }))
  Mock.mock(/\/api\/system\/menu\/update\/\d+/, 'put', () => ({ code: 200, message: '更新成功', data: null }))
  Mock.mock(/\/api\/system\/menu\/delete\/\d+/, 'delete', () => ({ code: 200, message: '删除成功', data: null }))

  Mock.mock(/\/api\/system\/permission\/list/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const menuId = query.get('menuId')
    const keyword = query.get('keyword')
    let list = permissionList
    if (menuId) list = list.filter((p: any) => p.menuId === Number(menuId))
    if (keyword) list = list.filter((p: any) => p.name.includes(keyword) || p.code.includes(keyword))
    return { code: 200, message: '获取成功', data: { list, total: list.length } }
  })
  Mock.mock(/\/api\/system\/permission\/create/, 'post', () => ({ code: 200, message: '创建成功', data: { id: Date.now() } }))
  Mock.mock(/\/api\/system\/permission\/update\/\d+/, 'put', () => ({ code: 200, message: '更新成功', data: null }))
  Mock.mock(/\/api\/system\/permission\/delete\/\d+/, 'delete', () => ({ code: 200, message: '删除成功', data: null }))

  Mock.mock(/\/api\/system\/dict\/type\/list/, 'get', () => ({ code: 200, message: '获取成功', data: dictTypeList }))
  Mock.mock(/\/api\/system\/dict\/type\/create/, 'post', () => ({ code: 200, message: '创建成功', data: { id: Date.now() } }))
  Mock.mock(/\/api\/system\/dict\/type\/update\/\d+/, 'put', () => ({ code: 200, message: '更新成功', data: null }))
  Mock.mock(/\/api\/system\/dict\/type\/delete\/\d+/, 'delete', () => ({ code: 200, message: '删除成功', data: null }))

  Mock.mock(/\/api\/system\/dict\/item\/list/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const typeId = Number(query.get('typeId')) || 0
    const list = dictItemMap[typeId] || []
    return { code: 200, message: '获取成功', data: { list, total: list.length } }
  })
  Mock.mock(/\/api\/system\/dict\/item\/create/, 'post', () => ({ code: 200, message: '创建成功', data: { id: Date.now() } }))
  Mock.mock(/\/api\/system\/dict\/item\/update\/\d+/, 'put', () => ({ code: 200, message: '更新成功', data: null }))
  Mock.mock(/\/api\/system\/dict\/item\/delete\/\d+/, 'delete', () => ({ code: 200, message: '删除成功', data: null }))

  Mock.mock(/\/api\/system\/settings/, 'get', () => ({ code: 200, message: '获取成功', data: settingsData }))
  Mock.mock(/\/api\/system\/settings/, 'put', () => ({ code: 200, message: '更新成功', data: null }))

  Mock.mock(/\/api\/log\/operation\/list/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const page = Number(query.get('page')) || 1
    const pageSize = Number(query.get('pageSize')) || 10
    const keyword = query.get('keyword') || ''
    const module = query.get('module') || ''
    let list = operationLogList
    if (keyword) list = list.filter((l: any) => l.username.includes(keyword) || l.module.includes(keyword))
    if (module) list = list.filter((l: any) => l.module === module)
    const start = (page - 1) * pageSize
    return { code: 200, message: '获取成功', data: { list: list.slice(start, start + pageSize), total: list.length } }
  })
  Mock.mock(/\/api\/log\/operation\/delete/, 'delete', () => ({ code: 200, message: '删除成功', data: null }))

  Mock.mock(/\/api\/log\/login\/list/, 'get', (options: any) => {
    const query = new URLSearchParams(options.url.split('?')[1] || '')
    const page = Number(query.get('page')) || 1
    const pageSize = Number(query.get('pageSize')) || 10
    const keyword = query.get('keyword') || ''
    const status = query.get('status')
    let list = loginLogList
    if (keyword) list = list.filter((l: any) => l.username.includes(keyword) || l.ip.includes(keyword))
    if (status !== null && status !== undefined) list = list.filter((l: any) => l.status === Number(status))
    const start = (page - 1) * pageSize
    return { code: 200, message: '获取成功', data: { list: list.slice(start, start + pageSize), total: list.length } }
  })
  Mock.mock(/\/api\/log\/login\/delete/, 'delete', () => ({ code: 200, message: '删除成功', data: null }))
}
