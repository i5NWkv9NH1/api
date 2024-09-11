import type { JwtPayload as Payload } from 'jsonwebtoken'
import { Account } from 'src/system/account/entities/account.entity'

export interface JwtPayload extends Payload {
  sub: string
  account: Account
  [key: string]: any
}
