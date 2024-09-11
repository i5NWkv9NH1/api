import { SetMetadata } from '@nestjs/common'

// export type ActionCode = 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE'
export const Actions = (...actions: string[]) => SetMetadata('actions', actions)
