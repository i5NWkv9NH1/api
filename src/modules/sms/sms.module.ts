import { Module } from "@nestjs/common";
import { AliCloudSmsService } from "./alicloud-sms.service";
import { SmsController } from "./sms.controller";
import { SmsSerivce } from "./sms.service";

@Module({
  providers: [AliCloudSmsService, SmsSerivce],
  exports: [AliCloudSmsService, SmsSerivce],
  controllers: [SmsController],
})
export class SmsModule { }