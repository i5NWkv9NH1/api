import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'
import { GlobalInterceptor } from './common/interceptors/global.interceptor'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    snapshot: true
  })

  app.enableCors({
    origin: true
  })
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true
    })
  )
  // TODO: build custom logger implement nest.js and pino
  // app.useLogger(app.get(Logger))x
  app.useGlobalInterceptors(new GlobalInterceptor())
  app.useGlobalFilters(new GlobalExceptionFilter())
  app.setGlobalPrefix('api')
  await app.listen(3200)
}
bootstrap()
