import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { Account } from 'src/system/account/entities/account.entity'
import { Action } from 'src/system/action/entities/action.entity'

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  code: string

  @IsArray()
  @IsOptional()
  account?: Account[] = []

  @IsArray()
  @IsOptional()
  actions?: Action[] = []
}
