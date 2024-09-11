import { Module } from '@nestjs/common'
import { RedisConfigService } from 'src/core/services/redis-config.service'
import { CaptchaController } from './captcha.controller'
import { CaptchaService } from './captcha.service'

@Module({
  controllers: [CaptchaController],
  providers: [CaptchaService, RedisConfigService],
  exports: [CaptchaService]
})
export class CaptchaModule {}
