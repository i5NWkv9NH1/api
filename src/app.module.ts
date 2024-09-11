import { Module } from '@nestjs/common'
import { CoreModule } from './core/core.module'
import { BusinessModule } from './modules/business.module'
import { SharedModule } from './shared/shared.module'
import { SystemModule } from './system/system.module'

@Module({
  imports: [
    CoreModule,
    //
    SharedModule,
    SystemModule,
    BusinessModule
  ]
})
export class AppModule {}
