import { Type } from 'class-transformer'
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator'
import { Organization } from 'src/system/organization/entities/organization.entity'
import { Role } from 'src/system/role/entities/role.entity'
import { AccountProfile } from '../entities/account-profile.entity'
import { CreateProfileDto } from './create-profile.dto'

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  username: string

  @IsString()
  @IsNotEmpty()
  password: string

  @IsOptional()
  @IsArray()
  roles?: Role[]

  @IsOptional()
  @IsArray()
  organizations: Organization[]

  @IsOptional()
  @ValidateNested()
  @Type(() => AccountProfile)
  profile?: CreateProfileDto
}
