import Client from '@alicloud/dysmsapi20170525';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as dayjs from 'dayjs';
import { Redis } from 'ioredis';
import { isEmpty } from 'lodash';
import { RedisSendSmsDto, SendSmsDto } from './sms.dto';

@Injectable()
export class AliCloudSmsService {
  private client: Client
  private logger: Logger
  private redis: Redis

  constructor(
    private readonly configService: ConfigService,
    private readonly redisSerivce: RedisService
  ) {
    this.redis = this.redisSerivce.getClient()
    this.logger = new Logger(AliCloudSmsService.name)
    // @ts-ignore
    this.client = new Client({
      accessKeyId: this.configService.get<string>('ACCESS_KEY_ID' || ''),
      accessKeySecret: this.configService.get<string>('ACCESS_KEY_SECRET' || ''),
    })
  }

  async send(dto: SendSmsDto) {
    const { signName, templateCode, templateParam, phoneNumbers, sourceIp } = dto
    this.logger.debug(dto)
    // @ts-ignore
    const { body: { code, message, bizId }, statusCode } = await this.client.sendSms({
      signName,
      templateCode,
      templateParam,
      phoneNumbers,
    })

    try {
      if (statusCode === 200 ||
        code === 'OK' ||
        message === 'OK'
      ) {
        await this.redis.set(`sms-${phoneNumbers}`, JSON.stringify({
          phoneNumbers,
          signName,
          templateCode,
          templateParam,
          bizId,
          sendDate: dayjs(Date(), 'YYMMDD')
        }))
        return {
          success: 'ok',
          message: 'Success'
        }
      }
    } catch (error) {
      this.logger.debug(error)
      throw new BadRequestException({
        error,
        message: message || 'Error'
      })
    }
  }

  async check(phone: string) {
    const { phoneNumbers, bizId, sendDate } = await this.getSendFromRedis(phone)
    // @ts-ignore
    return this.client.querySendDetails({
      phoneNumber: phoneNumbers, bizId, sendDate, pageSize: 50, currentPage: 1
    })
  }

  async getSendFromRedis(phone: string): Promise<RedisSendSmsDto> {
    const value = await this.redis.get(`sms-${phone}`)
    if (!value) return
    try {
      const obj = JSON.parse(value)
      if (isEmpty(obj)) {
        throw new BadRequestException({
          success: null,
          message: 'Get sms from redis failed',
        })
      }
      return obj
    } catch (error) {
      throw new BadRequestException({
        success: null,
        message: error,
        error
      })
    }
  }
}