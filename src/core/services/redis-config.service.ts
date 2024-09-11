import { RedisModuleOptions } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class RedisConfigService {
  constructor(private configService: ConfigService) {}

  createRedisOptions(): RedisModuleOptions {
    return {
      readyLog: true,
      config: {
        host: this.configService.get<string>('REDIS_HOST'),
        port: this.configService.get<number>('REDIS_PORT'),
        db: 0,
        lazyConnect: true,
        connectTimeout: 10000,
        maxRetriesPerRequest: 20,
        retryStrategy: (times) => {
          if (times > 5) {
            return null // 如果重试次数超过5次，则不再重试
          }
          return Math.min(times * 50, 2000) // 重试间隔时间
        }
      }
    }
  }
}
