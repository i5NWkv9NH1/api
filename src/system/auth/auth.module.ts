import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { CaptchaModule } from 'src/shared/captcha/captcha.module'
import { AccountModule } from '../account/account.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { BlacklistedTokensService } from './blacklisted-token.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { JwtStrategy } from './jwt.strategy'
import { RolesGuard } from './roles.guard'

@Global()
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') }
      }),
      inject: [ConfigService]
    }),
    CaptchaModule,
    AccountModule
  ],
  controllers: [AuthController],
  providers: [
    BlacklistedTokensService,
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard
  ],
  exports: [
    BlacklistedTokensService,
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    //
    AccountModule,
    JwtModule,
    PassportModule
  ]
})
export class AuthModule {}
