// Mock API 主入口文件
import onboardMocks from './js/applicant.js'
import allocateMocks from './js/allocate.js'
import evaluateMocks from './js/evaluate.js'
import offerMocks from './js/offer.js'

// 合并所有Mock API
export default [
  ...onboardMocks,
  ...allocateMocks,
  ...evaluateMocks,
  ...offerMocks
]
