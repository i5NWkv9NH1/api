import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface'
import { AccountService } from 'src/system/account/account.service'
import { BlacklistedTokensService } from './blacklisted-token.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  protected logger = new Logger(JwtStrategy.name)

  constructor(
    protected readonly configService: ConfigService,
    private readonly accountService: AccountService,
    private readonly blacklistedTokensService: BlacklistedTokensService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')
    })

    this.logger.debug('Inject Jwt Strategy 🥵')
  }

  async validate(payload: JwtPayload) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(payload)

    if (await this.blacklistedTokensService.isTokenBlacklisted(token)) {
      throw new UnauthorizedException('Token has been blacklisted')
    }
    const account = await this.accountService.findOne(payload.sub)

    if (!account) {
      throw new UnauthorizedException('Account not found')
    }

    return account
  }
}
