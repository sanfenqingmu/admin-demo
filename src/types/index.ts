export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  roles: string[]
  permissions: string[]
}

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  userInfo: UserInfo
}

export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

export interface ListResult<T = unknown> {
  list: T[]
  total: number
}

export interface ListParams {
  page?: number
  pageSize?: number
  [key: string]: unknown
}

export interface MenuItem {
  key: string
  title: string
  icon?: string
  path?: string
  children?: MenuItem[]
}

export interface PaginationState {
  current: number
  pageSize: number
  total: number
  showSizeChanger: boolean
  showTotal: (total: number) => string
}

export interface TableFetchParams {
  page: number
  pageSize: number
  [key: string]: unknown
}

export type OrderStatus = 0 | 1 | 2 | 3 | 4

export interface OrderRecord {
  id: number
  orderNo: string
  status: OrderStatus
  statusText: string
  receiver: string
  phone: string
  address: string
  productName: string
  productImage: string
  price: number
  quantity: number
  amount: string
  payMethod: string
  remark: string
  createTime: string
  payTime: string
  shipTime: string
}

export interface AfterSaleRecord {
  id: number
  orderId: number
  orderNo: string
  productName: string
  type: number
  typeText: string
  status: number
  statusText: string
  reason: string
  description: string
  amount: string
  images: string[]
  createTime: string
}

export interface ReviewRecord {
  id: number
  orderId: number
  orderNo: string
  productName: string
  userName: string
  rating: number
  content: string
  images: string[]
  reply: string
  isHidden: boolean
  createTime: string
}

export interface ConsultRecord {
  id: number
  userName: string
  productName: string
  question: string
  reply: string
  status: number
  createTime: string
}

export interface MemberRecord {
  id: number
  username: string
  nickname: string
  avatar: string
  level: number
  levelName: string
  points: number
  balance: string
  totalSpent: string
  orderCount: number
  status: number
  registerTime: string
}

export interface MemberLevel {
  id: number
  name: string
  minPoints: number
  maxPoints: number
  discount: number
  benefits: string
  status: number
}

export interface FlowRecord {
  id: number
  flowNo: string
  type: 'income' | 'expense'
  typeText: string
  source: string
  amount: string
  payMethod: string
  orderNo: string
  userName: string
  balance: string
  remark: string
  createTime: string
}

export interface StockFlowRecord {
  id: number
  skuId: number
  productName: string
  skuCode: string
  specText: string
  type: string
  typeText: string
  change: number
  beforeStock: number
  afterStock: number
  reason: string
  operator: string
  createTime: string
}

export interface InventoryRecord {
  id: number
  productName: string
  skuCode: string
  specText: string
  stock: number
  warningThreshold: number
  price: string
  sales: number
  lastChangeTime: string
}

export interface InvoiceRecord {
  id: number
  applyNo: string
  orderId: number
  orderNo: string
  userName: string
  type: number
  typeText: string
  title: string
  taxNo: string
  amount: string
  email: string
  address: string
  phone: string
  bankName: string
  bankAccount: string
  status: number
  statusText: string
  invoiceNo: string
  expressCompany: string
  expressNo: string
  remark: string
  createTime: string
}

export interface ReconcileRecord {
  id: number
  batchNo: string
  date: string
  totalIncome: string
  totalExpense: string
  netAmount: string
  orderCount: number
  matchedCount: number
  status: number
  statusText: string
  operator: string
  remark: string
  createTime: string
}

export interface SalesRankingRecord {
  id: number
  rank: number
  productName: string
  category: string
  sales: number
  salesAmount: string
  price: string
  stock: number
  refundRate: string
  conversionRate: string
}

export interface TransactionSummary {
  totalOrders: number
  totalAmount: string
  totalRefund: string
  totalUsers: number
  avgOrderAmount: string
  refundRate: string
  payMethods: Array<{ name: string; value: number; percent: string }>
  orderStatus: Array<{ name: string; value: number }>
}

export interface TransactionTrend {
  xData: string[]
  orderCount: number[]
  payAmount: number[]
  refundAmount: number[]
  newUsers: number[]
}

export interface SelectOption {
  label: string
  value: string | number
}

export interface ProductRecord {
  id: number
  name: string
  categoryId: number
  categoryName: string
  brandId: number
  brandName: string
  price: string
  stock: number
  mainImage: string
  status: number
  sales: number
  createTime: string
}

export interface CategoryRecord {
  id: number
  parentId: number
  name: string
  sort: number
  status: number
  children?: CategoryRecord[]
}

export interface BrandRecord {
  id: number
  name: string
  logo: string
  description: string
  sort: number
  status: number
  createTime: string
}

export interface SpecRecord {
  id: number
  name: string
  values: { id: number; name: string }[]
}
