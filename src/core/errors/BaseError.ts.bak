/**
 * Base class for all application errors
 */
export abstract class BaseError extends Error {
  public readonly name: string;
  public readonly message: string;
  public readonly cause?: Error;
  public readonly timestamp: Date;

  constructor(name: string, message: string, cause?: Error) {
    super(message);
    this.name = name;
    this.message = message;
    this.cause = cause;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Returns a JSON representation of the error
   */
  public toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
      cause: this.cause?.message,
    };
  }

  /**
   * Returns a string representation of the error
   */
  public toString(): string {
    return `${this.name}: ${this.message}`;
  }
}

/**
 * Application-level errors
 */
export namespace AppError {
  /**
   * Unexpected error
   */
  export class UnexpectedError extends BaseError {
    constructor(error?: Error | string) {
      const message = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred';
      const cause = error instanceof Error ? error : undefined;
      super('UnexpectedError', message, cause);
    }
  }

  /**
   * Validation error
   */
  export class ValidationError extends BaseError {
    public readonly field?: string;

    constructor(message: string, field?: string) {
      super('ValidationError', message);
      this.field = field;
    }
  }

  /**
   * Not found error
   */
  export class NotFoundError extends BaseError {
    constructor(resource: string, identifier?: string) {
      const message = identifier 
        ? `${resource} with identifier '${identifier}' was not found`
        : `${resource} was not found`;
      super('NotFoundError', message);
    }
  }

  /**
   * Conflict error (409)
   */
  export class ConflictError extends BaseError {
    constructor(message: string) {
      super('ConflictError', message);
    }
  }

  /**
   * Forbidden error (403)
   */
  export class ForbiddenError extends BaseError {
    constructor(message = 'Access forbidden') {
      super('ForbiddenError', message);
    }
  }

  /**
   * Unauthorized error (401)
   */
  export class UnauthorizedError extends BaseError {
    constructor(message = 'Authentication required') {
      super('UnauthorizedError', message);
    }
  }

  /**
   * Bad request error (400)
   */
  export class BadRequestError extends BaseError {
    constructor(message: string) {
      super('BadRequestError', message);
    }
  }

  /**
   * Rate limit error (429)
   */
  export class RateLimitError extends BaseError {
    public readonly retryAfter?: number;

    constructor(retryAfter?: number) {
      const message = retryAfter 
        ? `Rate limit exceeded. Retry after ${retryAfter} seconds`
        : 'Rate limit exceeded';
      super('RateLimitError', message);
      this.retryAfter = retryAfter;
    }
  }

  /**
   * Network error
   */
  export class NetworkError extends BaseError {
    public readonly statusCode?: number;

    constructor(message: string, statusCode?: number) {
      super('NetworkError', message);
      this.statusCode = statusCode;
    }
  }

  /**
   * Timeout error
   */
  export class TimeoutError extends BaseError {
    constructor(operation: string, timeoutMs: number) {
      super('TimeoutError', `Operation '${operation}' timed out after ${timeoutMs}ms`);
    }
  }

  /**
   * Service unavailable error (503)
   */
  export class ServiceUnavailableError extends BaseError {
    constructor(service: string) {
      super('ServiceUnavailableError', `Service '${service}' is currently unavailable`);
    }
  }
}

/**
 * Domain-specific errors
 */
export namespace DomainError {
  /**
   * Business rule violation
   */
  export class BusinessRuleViolationError extends BaseError {
    constructor(rule: string, details?: string) {
      const message = details ? `${rule}: ${details}` : rule;
      super('BusinessRuleViolationError', message);
    }
  }

  /**
   * Invalid domain operation
   */
  export class InvalidOperationError extends BaseError {
    constructor(operation: string, reason: string) {
      super('InvalidOperationError', `Cannot perform operation '${operation}': ${reason}`);
    }
  }

  /**
   * Invariant violation
   */
  export class InvariantViolationError extends BaseError {
    constructor(invariant: string) {
      super('InvariantViolationError', `Invariant violation: ${invariant}`);
    }
  }
}

/**
 * Infrastructure errors
 */
export namespace InfrastructureError {
  /**
   * Database error
   */
  export class DatabaseError extends BaseError {
    constructor(operation: string, cause?: Error) {
      super('DatabaseError', `Database operation '${operation}' failed`, cause);
    }
  }

  /**
   * External service error
   */
  export class ExternalServiceError extends BaseError {
    public readonly service: string;

    constructor(service: string, message: string, cause?: Error) {
      super('ExternalServiceError', `External service '${service}': ${message}`, cause);
      this.service = service;
    }
  }

  /**
   * File system error
   */
  export class FileSystemError extends BaseError {
    constructor(operation: string, path: string, cause?: Error) {
      super('FileSystemError', `File system operation '${operation}' failed for path '${path}'`, cause);
    }
  }

  /**
   * Configuration error
   */
  export class ConfigurationError extends BaseError {
    constructor(key: string, message?: string) {
      const errorMessage = message || `Invalid configuration for key '${key}'`;
      super('ConfigurationError', errorMessage);
    }
  }
}