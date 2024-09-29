import { Module } from '@nestjs/common';
import { SmsModule } from './sms/sms.module';

@Module({
  imports: [SmsModule]
})
export class BusinessModule { }
