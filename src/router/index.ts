import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useUserStore } from '@/store/user'

NProgress.configure({ showSpinner: false })

const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', hidden: true }
  },
  {
    path: '/',
    component: () => import('@/layouts/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'DashboardOutlined' }
      },
      {
        path: 'user',
        name: 'User',
        meta: { title: '用户管理', icon: 'UserOutlined' },
        children: [
          {
            path: 'list',
            name: 'UserList',
            component: () => import('@/views/user/list.vue'),
            meta: { title: '用户列表', icon: 'TeamOutlined' }
          }
        ]
      },
      {
        path: 'system',
        name: 'System',
        meta: { title: '系统管理', icon: 'SettingOutlined' },
        children: [
          {
            path: 'profile',
            name: 'Profile',
            component: () => import('@/views/system/profile.vue'),
            meta: { title: '个人中心', icon: 'UserOutlined' }
          },
          {
            path: 'account',
            name: 'Account',
            component: () => import('@/views/system/account.vue'),
            meta: { title: '账号管理', icon: 'UserAddOutlined' }
          },
          {
            path: 'role',
            name: 'Role',
            component: () => import('@/views/system/role.vue'),
            meta: { title: '角色管理', icon: 'SafetyOutlined' }
          },
          {
            path: 'menu',
            name: 'Menu',
            component: () => import('@/views/system/menu.vue'),
            meta: { title: '菜单管理', icon: 'MenuOutlined' }
          },
          {
            path: 'permission',
            name: 'Permission',
            component: () => import('@/views/system/permission.vue'),
            meta: { title: '按钮权限', icon: 'LockOutlined' }
          },
          {
            path: 'dict',
            name: 'Dict',
            component: () => import('@/views/system/dict.vue'),
            meta: { title: '字典管理', icon: 'BookOutlined' }
          },
          {
            path: 'settings',
            name: 'Settings',
            component: () => import('@/views/system/settings.vue'),
            meta: { title: '基础设置', icon: 'ToolOutlined' }
          },
          {
            path: 'log',
            name: 'Log',
            meta: { title: '日志管理', icon: 'FileTextOutlined' },
            children: [
              {
                path: 'operation',
                name: 'OperationLog',
                component: () => import('@/views/system/logs/operation.vue'),
                meta: { title: '操作日志', icon: 'EditOutlined' }
              },
              {
                path: 'login',
                name: 'LoginLog',
                component: () => import('@/views/system/logs/login.vue'),
                meta: { title: '登录日志', icon: 'LoginOutlined' }
              }
            ]
          }
        ]
      },
      {
        path: 'product',
        name: 'Product',
        meta: { title: '商品中心', icon: 'ShoppingOutlined' },
        children: [
          {
            path: 'list',
            name: 'ProductList',
            component: () => import('@/views/product/list.vue'),
            meta: { title: '商品列表', icon: 'AppstoreOutlined' }
          },
          {
            path: 'create',
            name: 'ProductCreate',
            component: () => import('@/views/product/editor.vue'),
            meta: { title: '新增商品', icon: 'PlusOutlined', hidden: true }
          },
          {
            path: 'edit/:id',
            name: 'ProductEdit',
            component: () => import('@/views/product/editor.vue'),
            meta: { title: '编辑商品', icon: 'EditOutlined', hidden: true }
          },
          {
            path: 'category',
            name: 'ProductCategory',
            component: () => import('@/views/product/category.vue'),
            meta: { title: '分类管理', icon: 'BlockOutlined' }
          },
          {
            path: 'brand',
            name: 'Brand',
            component: () => import('@/views/product/brand.vue'),
            meta: { title: '品牌管理', icon: 'ShopOutlined' }
          },
          {
            path: 'spec',
            name: 'Spec',
            component: () => import('@/views/product/spec.vue'),
            meta: { title: '规格管理', icon: 'TagsOutlined' }
          },
          {
            path: 'recycle',
            name: 'ProductRecycle',
            component: () => import('@/views/product/recycle.vue'),
            meta: { title: '回收站', icon: 'DeleteOutlined' }
          },
          {
            path: 'material',
            name: 'Material',
            component: () => import('@/views/product/material.vue'),
            meta: { title: '素材图库', icon: 'PictureOutlined' }
          }
        ]
      },
      {
        path: 'member',
        name: 'Member',
        meta: { title: '会员中心', icon: 'TeamOutlined' },
        children: [
          {
            path: 'list',
            name: 'MemberList',
            component: () => import('@/views/member/list.vue'),
            meta: { title: '会员列表', icon: 'UserOutlined' }
          },
          {
            path: 'level',
            name: 'MemberLevel',
            component: () => import('@/views/member/level.vue'),
            meta: { title: '等级配置', icon: 'CrownOutlined' }
          },
          {
            path: 'flow',
            name: 'MemberFlow',
            component: () => import('@/views/member/flow.vue'),
            meta: { title: '流水查询', icon: 'WalletOutlined' }
          }
        ]
      },
      {
        path: 'order',
        name: 'Order',
        meta: { title: '订单中心', icon: 'FileTextOutlined' },
        children: [
          {
            path: 'list',
            name: 'OrderList',
            component: () => import('@/views/order/list.vue'),
            meta: { title: '订单列表', icon: 'UnorderedListOutlined' }
          },
          {
            path: 'detail/:id',
            name: 'OrderDetail',
            component: () => import('@/views/order/detail.vue'),
            meta: { title: '订单详情', icon: 'ProfileOutlined', hidden: true }
          },
          {
            path: 'after-sale',
            name: 'AfterSale',
            component: () => import('@/views/order/afterSale.vue'),
            meta: { title: '售后管理', icon: 'UndoOutlined' }
          },
          {
            path: 'review',
            name: 'Review',
            component: () => import('@/views/order/review.vue'),
            meta: { title: '评价管理', icon: 'MessageOutlined' }
          },
          {
            path: 'consult',
            name: 'Consult',
            component: () => import('@/views/order/consult.vue'),
            meta: { title: '咨询管理', icon: 'QuestionCircleOutlined' }
          }
        ]
      },
      {
        path: 'logistics',
        name: 'Logistics',
        meta: { title: '物流库存', icon: 'CarOutlined' },
        children: [
          {
            path: 'freight',
            name: 'Freight',
            component: () => import('@/views/logistics/freight.vue'),
            meta: { title: '运费模板', icon: 'CalculatorOutlined' }
          },
          {
            path: 'express',
            name: 'Express',
            component: () => import('@/views/logistics/express.vue'),
            meta: { title: '快递公司', icon: 'DeliveredProcedureOutlined' }
          },
          {
            path: 'inventory',
            name: 'Inventory',
            component: () => import('@/views/logistics/inventory.vue'),
            meta: { title: '库存管理', icon: 'DatabaseOutlined' }
          }
        ]
      },
      {
        path: 'finance',
        name: 'Finance',
        meta: { title: '财务管理', icon: 'AccountBookOutlined' },
        children: [
          {
            path: 'flow',
            name: 'FinanceFlow',
            component: () => import('@/views/finance/flow.vue'),
            meta: { title: '资金流水', icon: 'FundOutlined' }
          },
          {
            path: 'reconcile',
            name: 'Reconcile',
            component: () => import('@/views/finance/reconcile.vue'),
            meta: { title: '对账列表', icon: 'AuditOutlined' }
          },
          {
            path: 'invoice',
            name: 'Invoice',
            component: () => import('@/views/finance/invoice.vue'),
            meta: { title: '发票管理', icon: 'FileProtectOutlined' }
          }
        ]
      },
      {
        path: 'report',
        name: 'Report',
        meta: { title: '数据报表', icon: 'BarChartOutlined' },
        children: [
          {
            path: 'sales-ranking',
            name: 'SalesRanking',
            component: () => import('@/views/report/salesRanking.vue'),
            meta: { title: '销量排行', icon: 'TrophyOutlined' }
          },
          {
            path: 'transaction',
            name: 'TransactionStats',
            component: () => import('@/views/report/transaction.vue'),
            meta: { title: '交易统计', icon: 'RiseOutlined' }
          }
        ]
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

const whiteList = ['/login', '/404']

router.beforeEach(async (to, _from) => {
  NProgress.start()
  const userStore = useUserStore()

  if (userStore.token) {
    if (to.path === '/login') {
      return { path: '/' }
    }
    if (!userStore.userInfo) {
      try {
        await userStore.fetchUserInfo()
      } catch {
        await userStore.logout()
        NProgress.done()
        return `/login?redirect=${to.path}`
      }
    }
    return true
  } else {
    if (whiteList.includes(to.path)) {
      return true
    }
    NProgress.done()
    return `/login?redirect=${to.path}`
  }
})

router.afterEach((to) => {
  NProgress.done()
  document.title = `${to.meta.title || ''} - ${import.meta.env.VITE_APP_TITLE}`
})

export default router
