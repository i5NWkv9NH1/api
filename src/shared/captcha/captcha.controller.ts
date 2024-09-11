import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Res,
  UseGuards
} from '@nestjs/common'
import { Throttle, ThrottlerGuard } from '@nestjs/throttler'
import { Response } from 'express'
import { CaptchaService } from './captcha.service'
import { InjectMeiliSearch } from 'nestjs-meilisearch'
import { MeiliSearch } from 'meilisearch'

interface GenerateCaptchaPayload {
  uniqueId: string
}

@Controller('captcha')
export class CaptchaController {
  protected logger = new Logger(CaptchaController.name)

  constructor(
    private readonly captchaService: CaptchaService,
    @InjectMeiliSearch()
    private searchService: MeiliSearch
  ) {}

  @Get()
  async test() {
    return this.searchService.getIndexes()
  }

  @Post('generate')
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 5, ttl: 60 }
  }) // 每60秒最多请求5次
  async generateCaptcha(
    @Body() data: GenerateCaptchaPayload,
    @Res() res: Response
  ) {
    if (!data.uniqueId) {
      throw new BadRequestException('uniqueId is required')
    }

    const captchaSvg = await this.captchaService.generateCaptcha(data.uniqueId)
    res.set('Content-Type', 'image/svg+xml')
    res.send(captchaSvg)
  }

  @Post('validate')
  async validateCaptcha(
    @Body() body: { uniqueId: string; captcha: string },
    @Res() res: Response
  ) {
    const { uniqueId, captcha } = body
    if (!uniqueId || !captcha) {
      throw new BadRequestException('uniqueId and captcha are required')
    }
    const isValid = await this.captchaService.validateCaptcha(uniqueId, captcha)

    if (isValid) {
      res.status(HttpStatus.OK).send({ message: 'Captcha valid' })
    } else {
      res.status(HttpStatus.BAD_REQUEST).send({ message: 'Invalid captcha' })
    }
  }
}
