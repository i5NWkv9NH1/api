import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private logger = new Logger(JwtAuthGuard.name)
  constructor(
    private readonly jwtService: JwtService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler()
    )
    if (isPublic) {
      return true
    }

    const request: Request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization

    if (!authHeader) {
      throw new UnauthorizedException('No token provided')
    }

    try {
      const token = authHeader.split(' ')[1]
      const payload = await this.jwtService.verifyAsync(token)
      request.account = payload.account
      return true
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
