/**
 * Centralized Logger Utility
 *
 * Provides structured logging with different transports for dev/prod
 */

import { Logger as NestLogger } from '@nestjs/common';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export interface LogMetadata {
  [key: string]: any;
}

export interface LogContext {
  service?: string;
  userId?: string;
  requestId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

/**
 * Application Logger
 *
 * Wraps NestJS logger with additional structured logging capabilities
 */
export class AppLogger extends NestLogger {
  /**
   * Log an informational message
   */
  info(message: string, context?: LogContext): void {
    this.log(this.formatMessage(message, context));
  }

  /**
   * Log an error
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const formattedMessage = this.formatMessage(message, {
      ...context,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    });

    super.error(formattedMessage, error?.stack);
  }

  /**
   * Log a warning
   */
  warn(message: string, context?: LogContext): void {
    super.warn(this.formatMessage(message, context));
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: LogContext): void {
    super.debug(this.formatMessage(message, context));
  }

  /**
   * Log a verbose message
   */
  verbose(message: string, context?: LogContext): void {
    super.verbose(this.formatMessage(message, context));
  }

  /**
   * Format log message with context
   */
  private formatMessage(message: string, context?: LogContext): string {
    if (!context || Object.keys(context).length === 0) {
      return message;
    }

    const contextStr = JSON.stringify(context);
    return `${message} ${contextStr}`;
  }

  /**
   * Log HTTP request
   */
  logRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    userId?: string
  ): void {
    const level = this.getLogLevelForStatus(statusCode);
    const message = `${method} ${path} ${statusCode} ${duration}ms`;

    const context: LogContext = {
      method,
      path,
      statusCode,
      duration,
      userId,
    };

    switch (level) {
      case LogLevel.ERROR:
        this.error(message, undefined, context);
        break;
      case LogLevel.WARN:
        this.warn(message, context);
        break;
      default:
        this.info(message, context);
    }
  }

  /**
   * Log database query (for slow query detection)
   */
  logQuery(query: string, duration: number, params?: any[]): void {
    if (duration > 1000) {
      // Log slow queries (>1s)
      this.warn('Slow query detected', {
        query: this.sanitizeQuery(query),
        duration,
        params: params?.length,
      });
    } else if (process.env.NODE_ENV === 'development') {
      this.debug('Database query', {
        query: this.sanitizeQuery(query),
        duration,
      });
    }
  }

  /**
   * Log AI model usage
   */
  logAIUsage(
    model: string,
    tokens: number,
    cost: number,
    duration: number,
    userId?: string
  ): void {
    this.info('AI model usage', {
      model,
      tokens,
      cost,
      duration,
      userId,
    });
  }

  /**
   * Log affiliate click
   */
  logAffiliateClick(
    productId: string,
    network: string,
    userId?: string
  ): void {
    this.info('Affiliate click', {
      productId,
      network,
      userId,
    });
  }

  /**
   * Get appropriate log level based on HTTP status code
   */
  private getLogLevelForStatus(statusCode: number): LogLevel {
    if (statusCode >= 500) {
      return LogLevel.ERROR;
    }
    if (statusCode >= 400) {
      return LogLevel.WARN;
    }
    return LogLevel.INFO;
  }

  /**
   * Sanitize query for logging (remove sensitive data)
   */
  private sanitizeQuery(query: string): string {
    // Remove potential passwords, tokens, etc.
    return query
      .replace(/password\s*=\s*'[^']*'/gi, "password='***'")
      .replace(/token\s*=\s*'[^']*'/gi, "token='***'");
  }
}

/**
 * Create a logger instance for a specific context
 */
export function createLogger(context: string): AppLogger {
  return new AppLogger(context);
}

/**
 * Global logger instance
 */
export const logger = new AppLogger('Application');
