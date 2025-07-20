import { BaseError, AppError } from './BaseError';
import { Result } from '../types/result';

/**
 * Error context for better error reporting
 */
export interface ErrorContext {
  userId?: string;
  operation?: string;
  metadata?: Record<string, any>;
  userAgent?: string;
  timestamp?: Date;
}

/**
 * Error reporting service interface
 */
export interface ErrorReportingService {
  captureError(error: Error, context?: ErrorContext): void;
  captureMessage(message: string, level: 'info' | 'warning' | 'error', context?: ErrorContext): void;
}

/**
 * Central error handler for the application
 */
export class ErrorHandler {
  private static reportingService?: ErrorReportingService;

  /**
   * Sets the error reporting service
   */
  public static setReportingService(service: ErrorReportingService): void {
    this.reportingService = service;
  }

  /**
   * Handles errors and converts them to Results
   */
  public static handle<T>(
    error: unknown,
    context?: ErrorContext
  ): Result<T, BaseError> {
    const handledError = this.normalizeError(error);
    
    // Report error to external service
    if (this.reportingService && !(handledError instanceof AppError.ValidationError)) {
      this.reportingService.captureError(handledError, context);
    }

    return Result.fail<T, BaseError>(handledError);
  }

  /**
   * Safely executes an async operation and handles errors
   */
  public static async safeAsync<T>(
    operation: () => Promise<T>,
    context?: ErrorContext
  ): Promise<Result<T, BaseError>> {
    try {
      const result = await operation();
      return Result.ok<T>(result);
    } catch (error) {
      return this.handle<T>(error, context);
    }
  }

  /**
   * Safely executes a sync operation and handles errors
   */
  public static safe<T>(
    operation: () => T,
    context?: ErrorContext
  ): Result<T, BaseError> {
    try {
      const result = operation();
      return Result.ok<T>(result);
    } catch (error) {
      return this.handle<T>(error, context);
    }
  }

  /**
   * Normalizes different error types to BaseError
   */
  private static normalizeError(error: unknown): BaseError {
    if (error instanceof BaseError) {
      return error;
    }

    if (error instanceof Error) {
      return new AppError.UnexpectedError(error);
    }

    if (typeof error === 'string') {
      return new AppError.UnexpectedError(error);
    }

    return new AppError.UnexpectedError('An unknown error occurred');
  }

  /**
   * Logs errors to console (development only)
   */
  public static logError(error: BaseError, context?: ErrorContext): void {
    if (__DEV__) {
      console.group(`🚨 ${error.name}`);
      console.error('Message:', error.message);
      console.error('Timestamp:', error.timestamp);
      
      if (context) {
        console.error('Context:', context);
      }
      
      if (error.cause) {
        console.error('Cause:', error.cause);
      }
      
      if (error.stack) {
        console.error('Stack:', error.stack);
      }
      
      console.groupEnd();
    }
  }

  /**
   * Creates user-friendly error messages
   */
  public static getUserMessage(error: BaseError): string {
    switch (error.name) {
      case 'ValidationError':
        return 'Please check your input and try again.';
      
      case 'NotFoundError':
        return 'The requested item could not be found.';
      
      case 'ConflictError':
        return 'This action conflicts with existing data.';
      
      case 'UnauthorizedError':
        return 'Please sign in to continue.';
      
      case 'ForbiddenError':
        return 'You do not have permission to perform this action.';
      
      case 'NetworkError':
        return 'Network error. Please check your connection and try again.';
      
      case 'TimeoutError':
        return 'The operation took too long. Please try again.';
      
      case 'ServiceUnavailableError':
        return 'Service is temporarily unavailable. Please try again later.';
      
      case 'RateLimitError':
        return 'Too many requests. Please wait a moment and try again.';
      
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  /**
   * Determines if an error should be retried
   */
  public static shouldRetry(error: BaseError, attemptCount: number): boolean {
    const maxRetries = 3;
    
    if (attemptCount >= maxRetries) {
      return false;
    }

    // Retry on network errors, timeouts, and service unavailable
    return error.name === 'NetworkError' || 
           error.name === 'TimeoutError' || 
           error.name === 'ServiceUnavailableError';
  }

  /**
   * Gets retry delay in milliseconds (exponential backoff)
   */
  public static getRetryDelay(attemptCount: number): number {
    return Math.min(1000 * Math.pow(2, attemptCount), 10000);
  }

  /**
   * Executes an operation with automatic retry logic
   */
  public static async withRetry<T>(
    operation: () => Promise<T>,
    context?: ErrorContext,
    maxRetries = 3
  ): Promise<Result<T, BaseError>> {
    let lastError: BaseError | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        return Result.ok<T>(result);
      } catch (error) {
        lastError = this.normalizeError(error);
        
        if (attempt === maxRetries || !this.shouldRetry(lastError, attempt)) {
          break;
        }
        
        const delay = this.getRetryDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Report error to external service
    if (this.reportingService && !(lastError instanceof AppError.ValidationError)) {
      this.reportingService.captureError(lastError!, context);
    }
    
    return Result.fail<T, BaseError>(lastError!);
  }
}