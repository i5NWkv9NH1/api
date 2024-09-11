import { IsEnum, IsOptional, IsString } from 'class-validator'
import { Gender, Status } from 'src/common/enums'

export class CreateProfileDto {
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender

  @IsOptional()
  @IsEnum(Status)
  state?: Status

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsString()
  email?: string

  @IsOptional()
  @IsString()
  avatarUrl?: string

  @IsOptional()
  @IsString()
  bannerUrl?: string

  @IsOptional()
  @IsString()
  bio?: string

  @IsOptional()
  @IsString()
  website?: string

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsString({ each: true })
  socialMediaLinks?: Record<string, string> // JSON 字段
}

export class UpdateProfileDto extends CreateProfileDto {}
