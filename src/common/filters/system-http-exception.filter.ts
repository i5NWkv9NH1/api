// src/common/filters/http-exception.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable
} from '@nestjs/common'
import { Request, Response } from 'express'
/**
 * **SystemHttpExceptionFilter** is a custom exception filter for handling HTTP exceptions in a NestJS application.
 * It formats the error response in a consistent structure.
 *
 * @example
 * // Usage
 * @Module({
 *   providers: [
 *     {
 *       provide: APP_FILTER,
 *       useClass: SystemHttpExceptionFilter, // Registering the filter
 *     },
 *   ],
 * })
 * export class AppModule {}
 */
@Injectable()
@Catch(HttpException)
export class SystemHttpExceptionFilter implements ExceptionFilter {
  /**
   * **catch** method is invoked when an HTTP exception is thrown.
   * It formats the response with additional metadata and error details.
   *
   * @param {HttpException} exception - The exception thrown by the application.
   * @param {ArgumentsHost} host - The context in which the exception was thrown.
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    // Switch to HTTP context to get request and response objects
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()

    // Get the status code from the exception
    const status = exception.getStatus()

    // Get the response details from the exception
    const exceptionResponse = exception.getResponse()
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message

    // Send a formatted error response
    response.status(status).json({
      success: false,
      messages: Array.isArray(message) ? message.join(', ') : message,
      statusCode: status,
      errors: Array.isArray(message) ? message : null,
      meta: {
        processedBy: 'System API', // Add additional metadata here
        version: '1.0'
      },
      result: null,
      timestamp: new Date().toISOString(), // Include timestamp
      path: request.url // Include the path of the request
    })
  }
}
