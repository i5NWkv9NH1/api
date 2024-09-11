import { Module } from '@nestjs/common'
import { AccountModule } from './account/account.module'
import { ActionModule } from './action/action.module'
import { AuthModule } from './auth/auth.module'
import { MenuModule } from './menu/menu.module'
import { OrganizationModule } from './organization/organization.module'
import { RoleModule } from './role/role.module'

@Module({
  imports: [
    AuthModule,
    AccountModule,
    ActionModule,
    MenuModule,
    RoleModule,
    OrganizationModule
  ]
})
export class SystemModule {}
