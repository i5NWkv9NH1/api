import { IsNotEmpty, IsString } from 'class-validator'
import { CreateAccountDto } from 'src/system/account/dto/create-account.dto'

export class SignupDto extends CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  uniqueId: string

  @IsString()
  @IsNotEmpty()
  captcha: string
}
