import { applyDecorators, Controller } from '@nestjs/common'

export function CloudController(path: string) {
  return applyDecorators(Controller(`business/cloud/${path}`))
}
