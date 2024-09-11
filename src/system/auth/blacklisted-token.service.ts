import { RedisService } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'
import type { Redis } from 'ioredis'

@Injectable()
export class BlacklistedTokensService {
  protected readonly redis: Redis

  constructor(readonly redisService: RedisService) {
    this.redis = redisService.getClient()
  }

  async addTokenToBlacklist(token: string, expiry: number): Promise<void> {
    await this.redis.set(token, 'blacklisted', 'EX', expiry)
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.redis.get(token)
    return result !== null
  }
}
