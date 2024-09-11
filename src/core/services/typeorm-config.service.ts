import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm'

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('POSTGRES_HOST'),
      port: this.configService.get<number>('POSTGRES_PORT'),
      username: this.configService.get<string>('POSTGRES_USER'),
      password: this.configService.get<string>('POSTGRES_PASSWORD'),
      database: this.configService.get<string>('POSTGRES_DB'),
      autoLoadEntities: true,
      // migrations: ['src/migrations/*{.ts,.js}'],
      // logging: 'all',
      synchronize: true,
      // migrationsRun: true,
      // @ts-ignore
      seeds: ['src/seeds/**/*{.ts,.js}'],
      factories: ['src/factories/**/*{.ts,.js}']
    }
  }
}
