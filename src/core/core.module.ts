import { RedisModule, RedisService } from '@liaoliaots/nestjs-redis'
import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ServeStaticModule } from '@nestjs/serve-static'
import { ThrottlerModule } from '@nestjs/throttler'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MeiliSearchModule } from 'nestjs-meilisearch'
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis'
import { MeiliSearchConfigService } from './services/meilisearch-config.service'
import { RedisConfigService } from './services/redis-config.service'
import { ServeStaticConfigService } from './services/serve-static-config.service'
import { TypeOrmConfigService } from './services/typeorm-config.service'

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      useClass: ServeStaticConfigService
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService
    }),
    // TODO: As a global module which can be inject anywhere service
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useClass: RedisConfigService
    }),
    MeiliSearchModule.forRootAsync({
      imports: [ConfigModule],
      useClass: MeiliSearchConfigService
    }),
    EventEmitterModule.forRoot({ global: true }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService, RedisService],
      useFactory: (config: ConfigService, redisService: RedisService) => {
        const redis = redisService.getClient()
        return {
          throttlers: [
            {
              name: 'default',
              ttl: config.get('THROTTLE_TTL') || 60,
              limit: config.get('THROTTLE_LIMIT') || 5
            }
          ],
          storage: new ThrottlerStorageRedisService(redis)
        }
      }
    })
  ],
  exports: [ConfigModule, RedisModule, EventEmitterModule]
})
export class CoreModule {}
