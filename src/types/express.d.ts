import { Account } from 'src/system/account/entities/account.entity'

declare global {
  namespace Express {
    interface Request {
      account?: Account // 将 User 类型定义为可选的，具体可以根据你的需求调整
      allowedActions?: string[] // 根据实际情况调整
    }
  }
}
