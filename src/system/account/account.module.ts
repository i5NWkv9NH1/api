import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ActionModule } from '../action/action.module'
import { MenuModule } from '../menu/menu.module'
import { OrganizationModule } from '../organization/organization.module'
import { AccountController } from './account.controller'
import { AccountService } from './account.service'
import { AccountProfile } from './entities/account-profile.entity'
import { Account } from './entities/account.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, AccountProfile]),
    ActionModule,
    OrganizationModule,
    MenuModule
  ],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService]
})
export class AccountModule {}
