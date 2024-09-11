import { Body, Logger, Post, Req, UseGuards } from '@nestjs/common'
import { Request } from 'express'
import { Public, SystemController } from 'src/common/decorators'
import { AuthService } from './auth.service'
import { LogoutDto } from './dto/logout.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { SigninDto } from './dto/signin.dto'
import { SignupDto } from './dto/signup.dto'
import { JwtAuthGuard } from './jwt-auth.guard'

@SystemController('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  protected logger = new Logger(AuthController.name)
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Public()
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto)
  }

  @Post('signin')
  @Public()
  async signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto)
  }

  @Post('refresh')
  @Public()
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto)
  }

  @Post('logout')
  async logout(@Body() logoutDto: LogoutDto) {
    const { accessToken, refreshToken } = logoutDto
    return this.authService.logout({ accessToken, refreshToken })
  }

  @Post('me')
  async findMe(@Req() req: Request) {
    const account = req.account
    return this.authService.findMe(account)
  }
}
