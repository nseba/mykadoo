import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.getErrorMessage(exception);
    const errorResponse = this.buildErrorResponse(exception, request, status, message);

    // Log error with appropriate level
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : exception
      );
    } else if (status >= 400) {
      this.logger.warn(
        `${request.method} ${request.url} - ${message}`
      );
    }

    response.status(status).json(errorResponse);
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return response;
      }
      if (typeof response === 'object' && response !== null && 'message' in response) {
        const responseObj = response as { message: unknown };
        return Array.isArray(responseObj.message)
          ? responseObj.message.join(', ')
          : String(responseObj.message);
      }
    }

    if (exception instanceof Error) {
      // Make error messages user-friendly
      return this.sanitizeErrorMessage(exception.message);
    }

    return 'An unexpected error occurred';
  }

  private sanitizeErrorMessage(message: string): string {
    // Convert technical errors to user-friendly messages
    const errorMap: Record<string, string> = {
      'ECONNREFUSED': 'Unable to connect to the service. Please try again later.',
      'ETIMEDOUT': 'Request timed out. Please try again.',
      'ENOTFOUND': 'Service not found. Please check your configuration.',
      'Breaker is open': 'Service is temporarily unavailable. Please try again in a few moments.',
      'Rate limit exceeded': 'Too many requests. Please slow down and try again later.',
      'Unauthorized': 'Authentication required. Please log in.',
      'Forbidden': 'You do not have permission to access this resource.',
      'Not Found': 'The requested resource was not found.',
    };

    // Check for known error patterns
    for (const [pattern, userMessage] of Object.entries(errorMap)) {
      if (message.includes(pattern)) {
        return userMessage;
      }
    }

    // Don't expose internal implementation details
    if (message.includes('Prisma') || message.includes('SQL')) {
      return 'A database error occurred. Please try again later.';
    }

    if (message.includes('Redis')) {
      return 'A caching error occurred. Please try again later.';
    }

    // Return sanitized message
    return message.length > 200 ? message.substring(0, 197) + '...' : message;
  }

  private buildErrorResponse(
    exception: unknown,
    request: Request,
    status: number,
    message: string
  ) {
    const errorResponse: any = {
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Add validation errors if present
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && 'errors' in response) {
        errorResponse.errors = response.errors;
      }
    }

    // In development, include stack trace
    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      errorResponse.stack = exception.stack;
      errorResponse.originalMessage = exception.message;
    }

    return errorResponse;
  }
}
