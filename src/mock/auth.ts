import Mock from 'mockjs'

export function setupAuthMock() {
  Mock.mock(/\/api\/auth\/login/, 'post', () => {
    return {
      code: 200,
      message: '登录成功',
      data: {
        token: 'mock-token-' + Date.now(),
        userInfo: {
          id: 1,
          username: 'admin',
          nickname: '管理员',
          avatar: '',
          roles: ['admin'],
          permissions: ['*']
        }
      }
    }
  })

  Mock.mock(/\/api\/auth\/logout/, 'post', () => {
    return {
      code: 200,
      message: '退出成功',
      data: null
    }
  })

  Mock.mock(/\/api\/auth\/userinfo/, 'get', () => {
    return {
      code: 200,
      message: '获取成功',
      data: {
        id: 1,
        username: 'admin',
        nickname: '管理员',
        avatar: '',
        roles: ['admin'],
        permissions: ['*']
      }
    }
  })

  Mock.mock(/\/api\/auth\/menus/, 'get', () => {
    return {
      code: 200,
      message: '获取成功',
      data: [
        {
          key: 'dashboard',
          title: '仪表盘',
          icon: 'DashboardOutlined',
          path: '/dashboard'
        },
        {
          key: 'user',
          title: '用户管理',
          icon: 'UserOutlined',
          children: [
            {
              key: 'user-list',
              title: '用户列表',
              path: '/user/list'
            }
          ]
        },
        {
          key: 'system',
          title: '系统管理',
          icon: 'SettingOutlined',
          children: [
            {
              key: 'system-config',
              title: '系统配置',
              path: '/system/config'
            }
          ]
        }
      ]
    }
  })
}
