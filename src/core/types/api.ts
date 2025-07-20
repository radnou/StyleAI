import { Result } from './result';

/**
 * Base interface for all use cases
 */
export interface UseCase<IRequest, IResponse> {
  execute(request: IRequest): Promise<IResponse> | IResponse;
}

/**
 * Base interface for repositories
 */
export interface Repository {
  // Common repository methods can be added here
}

/**
 * Base interface for domain services
 */
export interface DomainService {
  // Common domain service methods can be added here
}

/**
 * Common pagination parameters
 */
export interface PaginationParams {
  limit: number;
  offset: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Common API response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

/**
 * Common query filters
 */
export interface QueryFilters {
  [key: string]: any;
}

/**
 * Common sorting options
 */
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Event bus interface for domain events
 */
export interface EventBus {
  publish<T>(event: T): Promise<void>;
  subscribe<T>(eventType: string, handler: (event: T) => Promise<void>): void;
}

/**
 * Logger interface
 */
export interface Logger {
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

/**
 * Cache interface
 */
export interface Cache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * File storage interface
 */
export interface FileStorage {
  upload(file: File, path: string): Promise<string>;
  download(path: string): Promise<Blob>;
  delete(path: string): Promise<void>;
  getPublicUrl(path: string): string;
}

/**
 * Notification service interface
 */
export interface NotificationService {
  sendEmail(to: string, subject: string, body: string): Promise<Result<void>>;
  sendPush(userId: string, title: string, body: string): Promise<Result<void>>;
  sendSMS(phone: string, message: string): Promise<Result<void>>;
}

/**
 * Analytics service interface
 */
export interface AnalyticsService {
  track(event: string, properties?: Record<string, any>): void;
  identify(userId: string, traits?: Record<string, any>): void;
  page(name: string, properties?: Record<string, any>): void;
}

/**
 * HTTP client interface
 */
export interface HttpClient {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  put<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, config?: RequestConfig): Promise<T>;
  patch<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
}

/**
 * HTTP request configuration
 */
export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  params?: Record<string, any>;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Command interface for CQRS pattern
 */
export interface Command {
  commandId: string;
  timestamp: Date;
}

/**
 * Query interface for CQRS pattern
 */
export interface Query {
  queryId: string;
  timestamp: Date;
}