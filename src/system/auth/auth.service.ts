import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcrypt'
import { DEFAULT_EXPIRE, REFRESH_EXPIRE } from 'src/constants'
import { CaptchaService } from 'src/shared/captcha/captcha.service'
import { AccountService } from '../account/account.service'
import { Account } from '../account/entities/account.entity'
import { BlacklistedTokensService } from './blacklisted-token.service'
import { LogoutDto } from './dto/logout.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { SigninDto } from './dto/signin.dto'
import { SignupDto } from './dto/signup.dto'

@Injectable()
export class AuthService {
  protected logger = new Logger(AuthService.name)

  constructor(
    private readonly jwtService: JwtService,
    private readonly accountService: AccountService,
    private readonly blacklistedTokensService: BlacklistedTokensService,
    private readonly captchaService: CaptchaService
  ) {}

  private async validateCaptcha(uniqueId: string, captcha: string) {
    const isCaptchaValid = await this.captchaService.validateCaptcha(
      uniqueId,
      captcha
    )
    if (!isCaptchaValid) {
      throw new BadRequestException('Captcha code error')
    }
  }

  async signup(signupDto: SignupDto) {
    const { uniqueId, captcha, ...rest } = signupDto

    await this.validateCaptcha(uniqueId, captcha)

    const savedAccount = await this.accountService.create({ ...rest })
    if (!savedAccount) {
      throw new BadRequestException('Account could not be saved')
    }
    return await this.signin({
      account: {
        username: savedAccount.username,
        password: savedAccount.password
      },
      verify: { uniqueId, captcha }
    })
  }

  async signin(signinDto: SigninDto) {
    const {
      account,
      verify: { uniqueId, captcha }
    } = signinDto

    await this.validateCaptcha(uniqueId, captcha)

    const isExist = await this.accountService.findByUsername(account.username)

    if (!isExist || !(await compare(account.password, isExist.password))) {
      throw new BadRequestException('Username or Password incorrect')
    }

    const payload = { account: isExist, sub: isExist.id }
    const accessToken = this.generateToken(payload, DEFAULT_EXPIRE)
    const refreshToken = this.generateToken(payload, REFRESH_EXPIRE)
    // const permissions = await this.accountService.findPermissions(isExist)

    return {
      tokens: {
        accessToken,
        refreshToken
      },
      account: isExist
      // permissions
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto

    try {
      const payload = this.jwtService.verify(refreshToken)

      if (
        await this.blacklistedTokensService.isTokenBlacklisted(refreshToken)
      ) {
        throw new UnauthorizedException('Refresh token is blacklisted')
      }

      const newAccessToken = this.generateToken(
        { sub: payload.sub, account: payload.account },
        DEFAULT_EXPIRE
      )
      const newRefreshToken = this.generateToken(
        { sub: payload.sub, account: payload.account },
        REFRESH_EXPIRE
      )
      const permissions = await this.accountService.findPermissions(
        payload.account
      )

      return {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        },
        account: payload.account,
        permissions
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  generateToken(payload: any, expiresIn: string): string {
    return this.jwtService.sign(payload, { expiresIn })
  }

  async logout(loginDto: LogoutDto) {
    const { accessToken, refreshToken } = loginDto
    await this.blacklistToken(accessToken)
    await this.blacklistToken(refreshToken)
  }

  async blacklistToken(token: string): Promise<void> {
    const decodedToken = this.jwtService.decode(token) as any
    if (decodedToken && decodedToken.exp) {
      const expiry = decodedToken.exp - Math.floor(Date.now() / 1000)
      await this.blacklistedTokensService.addTokenToBlacklist(token, expiry)
    }
  }

  async findMe(_account: Account) {
    const account = await this.accountService.findOne(_account.id)
    const permissions = await this.accountService.findPermissions(account)

    return {
      permissions,
      account
    }
  }
}
