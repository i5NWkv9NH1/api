import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable()
export class GlobalInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const statusCode = context.switchToHttp().getResponse().statusCode
        // Example of how you might populate the meta or pagination fields
        const meta = { processedBy: 'Nest.js', version: '1.0' }
        return new Response<T>(
          data,
          'Request successful',
          statusCode,
          null,
          meta
        )
      })
    )
  }
}

class Response<T> {
  result: T
  message: string
  statusCode: number
  errors?: any
  timestamp: string // To include the response timestamp
  meta?: {
    processedBy: string
    version: string
  } // For additional metadata

  constructor(
    result: T,
    message = '',
    statusCode = 200,
    errors = null,
    meta = null
  ) {
    this.result = result
    this.message = message
    this.statusCode = statusCode
    this.errors = errors
    this.meta = meta
    this.timestamp = new Date().toISOString() // Automatically set the timestamp
  }
}
