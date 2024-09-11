import { Module } from '@nestjs/common'
import { CaptchaModule } from 'src/shared/captcha/captcha.module'

@Module({
  imports: [CaptchaModule]
})
export class SharedModule {}
