import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MeiliModuleOptions } from 'nestjs-meilisearch'

@Injectable()
export class MeiliSearchConfigService {
  constructor(private readonly configService: ConfigService) {}
  createMeiliOptions(): MeiliModuleOptions {
    const port = this.configService.get<number>('MEILI_PORT')
    const host = `http://127.0.0.1:${port}`
    return {
      host,
      apiKey: this.configService.get<string>('MEILI_API_KEY')
    }
  }
}
