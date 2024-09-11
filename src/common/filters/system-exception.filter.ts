/**
 * * @description This filter combines handling of TypeORM exceptions and general HTTP exceptions.
 * * It leverages `SystemHttpExceptionFilter` for general HTTP exceptions and custom handling for TypeORM errors.
 * * Since only one `APP_FILTER` can be registered per module, this approach consolidates both filters.
 *
 * TODO: Use this filter in the future to streamline exception handling.
 */

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  Injectable
} from '@nestjs/common'
import { QueryFailedError } from 'typeorm'
import { SystemHttpExceptionFilter } from './system-http-exception.filter'

@Injectable()
// @Catch(HttpException, QueryFailedError)
@Catch(HttpException, QueryFailedError)
export class SystemExceptionFilter implements ExceptionFilter {
  /**
   * **Constructor**: Injects the existing `SystemHttpExceptionFilter` for handling HTTP exceptions.
   *
   * @param {SystemHttpExceptionFilter} systemFilter - An instance of `SystemHttpExceptionFilter`.
   */
  // constructor(private readonly systemFilter: SystemHttpExceptionFilter) {}
  constructor(
    @Inject(SystemHttpExceptionFilter)
    private readonly systemFilter: SystemHttpExceptionFilter
  ) {}

  /**
   * **catch** method handles exceptions and formats the response based on the exception type.
   *
   * @param {HttpException | QueryFailedError} exception - The exception thrown by the application.
   * @param {ArgumentsHost} host - The context in which the exception was thrown.
   */
  catch(exception: HttpException | QueryFailedError, host: ArgumentsHost) {
    if (exception instanceof QueryFailedError) {
      // Handle TypeORM exceptions
      const ctx = host.switchToHttp()
      const response = ctx.getResponse()
      const request = ctx.getRequest()

      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database error',
        errors: {
          message: exception.message,
          detail: exception.query // Providing additional details about the query
        },
        timestamp: new Date().toISOString(), // Timestamp of the error occurrence
        path: request.url // URL of the request that caused the error
      })
    } else {
      // Delegate to existing filter for other exceptions
      this.systemFilter.catch(exception, host)
    }
  }
}
