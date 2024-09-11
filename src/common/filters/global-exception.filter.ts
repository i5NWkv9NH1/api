import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common'
import { Request, Response } from 'express'
import { QueryFailedError } from 'typeorm'

/**
 * * @description GlobalExceptionFilter handles exceptions for the entire application.
 * * It manages both TypeORM exceptions and general HTTP exceptions.
 */
// @Catch(HttpException, QueryFailedError)
@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
  protected logger = new Logger(GlobalExceptionFilter.name)
  /**
   * **catch** method handles exceptions and formats the response based on the exception type.
   *
   * @param {HttpException | QueryFailedError} exception - The exception thrown by the application.
   * @param {ArgumentsHost} host - The context in which the exception was thrown.
   */
  catch(exception: HttpException | QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR
    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Database error' }
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message
    this.logger.error(
      `HTTP ${status} - ${message} - ${request.method} ${request.url}`
    )
    response.status(status).json({
      success: false,
      message: Array.isArray(message) ? message.join(', ') : message,
      statusCode: status,
      errors: Array.isArray(message) ? message : null,
      meta: {
        processedBy: 'Nest.js API', // Add additional metadata here
        version: '1.0'
      },
      timestamp: new Date().toISOString(), // Timestamp of the error occurrence
      path: request.url // URL of the request that caused the error
    })
  }
}
