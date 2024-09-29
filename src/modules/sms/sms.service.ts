import { Injectable } from "@nestjs/common";
import { AliCloudSmsService } from "./alicloud-sms.service";
import { SendSmsDto } from "./sms.dto";

@Injectable()
export class SmsSerivce {
  constructor(
    private readonly aliCloudSmsService: AliCloudSmsService
  ) { }

  async send(dto: SendSmsDto) {
    return await this.aliCloudSmsService.send(dto)
  }

  async check(phone: string) {
    return await this.aliCloudSmsService.check(phone)
  }
}
