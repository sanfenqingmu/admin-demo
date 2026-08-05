import Mock from 'mockjs'
import { setupAuthMock } from './auth'
import { setupUserMock } from './user'
import { setupSystemMock } from './system'
import { setupProductMock } from './product'
import { setupMemberMock } from './member'
import { setupOrderMock } from './order'
import { setupLogisticsMock } from './logistics'
import { setupFinanceMock } from './finance'
import { setupReportMock } from './report'

const useMock = import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.DEV

if (useMock) {
  Mock.setup({
    timeout: '200-600'
  })
  setupAuthMock()
  setupUserMock()
  setupSystemMock()
  setupProductMock()
  setupMemberMock()
  setupOrderMock()
  setupLogisticsMock()
  setupFinanceMock()
  setupReportMock()
}
