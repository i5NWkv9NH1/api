import { IsNotEmpty, IsUUID } from 'class-validator'

export class CreateCaptchaDto {
  @IsUUID()
  @IsNotEmpty()
  uniqueId: string
}
