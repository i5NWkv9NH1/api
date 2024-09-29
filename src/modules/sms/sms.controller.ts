import { Body, Controller, Post } from "@nestjs/common";
import { RealIP } from 'nestjs-real-ip';
import { SendSmsDto } from "./sms.dto";
import { SmsSerivce } from "./sms.service";

@Controller('sms')
export class SmsController {
  constructor(
    private readonly smsService: SmsSerivce
  ) { }

  @Post('send')
  async send(
    @RealIP() ip: string,
    // @Body() dto: SendSmsDto,
  ) {
    const dto = <SendSmsDto>{
      sourceIp: ip,
      signName: '阿里云短信测试',
      templateCode: 'SMS_154950909',
      templateParam: '{\"code\":\"1234\"}',
      phoneNumbers: '15697544151'
    }
    return await this.smsService.send(dto)
  }

  @Post('check')
  async check(@Body() dto: { phone: string }) {
    const { phone } = dto
    return await this.smsService.check(phone)
  }
}