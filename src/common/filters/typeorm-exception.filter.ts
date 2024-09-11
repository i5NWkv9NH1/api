import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus
} from '@nestjs/common'
import { Request, Response } from 'express'
import { QueryFailedError } from 'typeorm'
/**
 * * @description TypeOrmExceptionFilter handles exceptions related to TypeORM database operations.
 * * It provides a standardized error response format for database-related errors.
 */
@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  /**
   * **catch** method handles TypeORM exceptions and formats the response accordingly.
   *
   * @param {QueryFailedError} exception - The exception thrown by TypeORM.
   * @param {ArgumentsHost} host - The context in which the exception was thrown.
   */
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    // Extract information from exception message
    const errorMessage = exception.message || 'Database error'
    const errorQuery = exception.query || 'No query detail available'

    // Create a standardized error response format
    const errorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Database error',
      errors: {
        message: errorMessage,
        detail: errorQuery
      },
      timestamp: new Date().toISOString(),
      path: request.url
    }

    // Send the response with appropriate status code
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse)
  }
}
