import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AccountService } from 'src/system/account/account.service'

/**
 * @see {Actions}
 */
@Injectable()
export class RolesGuard implements CanActivate {
  protected logger = new Logger(RolesGuard.name)
  constructor(
    private reflector: Reflector,
    private accountService: AccountService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler()
    )
    if (isPublic) {
      return true
    }

    const requiredActions = this.reflector.get<string[]>(
      'actions',
      context.getHandler()
    )
    if (!requiredActions) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const account = request.account

    if (!account) {
      throw new ForbiddenException('No account ID found in request')
    }

    const allowedActions = await this.accountService.getAllowActions(account)
    const hasPermission = requiredActions.every((action) =>
      allowedActions.includes(action)
    )

    if (!hasPermission) {
      throw new ForbiddenException('Access denied: insufficient permissions')
    }

    return hasPermission
  }
}
