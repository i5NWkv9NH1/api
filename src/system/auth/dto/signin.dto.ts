import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator'

export class VerifyDto {
  @IsUUID()
  @IsNotEmpty()
  uniqueId: string

  @IsString()
  @Length(4, 4)
  @IsNotEmpty()
  captcha: string
}

export class SigninAccountDto {
  @IsString()
  @IsNotEmpty()
  username: string

  @IsString()
  @IsNotEmpty()
  password: string
}

export class SigninDto {
  account: SigninAccountDto
  verify: VerifyDto
}
