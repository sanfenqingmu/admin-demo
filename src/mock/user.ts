import Mock from 'mockjs'

const userList = Mock.mock({
  'list|10': [
    {
      'id|+1': 1,
      username: '@word(3, 8)',
      nickname: '@cname',
      email: '@email',
      'status|1': [1, 0],
      createTime: '@datetime'
    }
  ]
}).list

export function setupUserMock() {
  Mock.mock(/\/api\/user\/list/, 'get', (options: any) => {
    const body = JSON.parse(options.body || '{}')
    const page = body.page || 1
    const pageSize = body.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const list = userList.slice(start, end)

    return {
      code: 200,
      message: '获取成功',
      data: {
        list,
        total: userList.length,
        page,
        pageSize
      }
    }
  })

  Mock.mock(/\/api\/user\/create/, 'post', () => {
    return {
      code: 200,
      message: '创建成功',
      data: { id: userList.length + 1 }
    }
  })

  Mock.mock(/\/api\/user\/update\/\d+/, 'put', () => {
    return {
      code: 200,
      message: '更新成功',
      data: null
    }
  })

  Mock.mock(/\/api\/user\/delete\/\d+/, 'delete', () => {
    return {
      code: 200,
      message: '删除成功',
      data: null
    }
  })
}
