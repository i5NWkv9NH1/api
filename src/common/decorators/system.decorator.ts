import { applyDecorators, Controller } from '@nestjs/common'

export function SystemController(path: string) {
  return applyDecorators(Controller(`system/${path}`))
}
