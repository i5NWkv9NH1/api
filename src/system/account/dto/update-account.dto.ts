import { IsArray, IsOptional } from 'class-validator'
import { CreateAccountDto } from './create-account.dto'

export class UpdateAccountDto extends CreateAccountDto {
  @IsOptional()
  @IsArray()
  organizationIds: string[]
}
