import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  ServeStaticModuleOptions,
  ServeStaticModuleOptionsFactory
} from '@nestjs/serve-static'
import { join } from 'path'
import { cwd } from 'process'

@Injectable()
export class ServeStaticConfigService
  implements ServeStaticModuleOptionsFactory
{
  constructor(private readonly configService: ConfigService) {}

  createLoggerOptions(): ServeStaticModuleOptions[] {
    const uploadPath = this.configService.get<string>('UPLOAD_PATH')
    const prefix = this.configService.get<string>('UPLOAD_PATH_PREFIX')

    if (!prefix) {
      throw new InternalServerErrorException(
        'UPLOAD_PATH_PREFIX should be provide in .env'
      )
    }

    return [
      {
        serveRoot: prefix,
        rootPath: join(cwd(), uploadPath)
      }
    ]
  }
}
