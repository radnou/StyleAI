import { Result } from '@core/types/result';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (identifier: string, action: string) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  resetOnWindowEnd?: boolean;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Rate limit entry
 */
interface RateLimitEntry {
  count: number;
  windowStart: number;
  lastRequestTime: number;
  requests: number[];
}

/**
 * Rate limiter implementation for authentication operations
 * Provides protection against brute force attacks and API abuse
 */
export class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeDefaultConfigs();
    this.startCleanupInterval();
  }

  /**
   * Initialize default rate limit configurations
   */
  private initializeDefaultConfigs(): void {
    // Login attempts: 5 per 15 minutes
    this.configs.set('login', {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      skipSuccessfulRequests: true,
    });

    // Registration: 3 per hour
    this.configs.set('register', {
      maxRequests: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
    });

    // Password reset: 3 per hour
    this.configs.set('password_reset', {
      maxRequests: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
    });

    // Email verification: 5 per hour
    this.configs.set('email_verification', {
      maxRequests: 5,
      windowMs: 60 * 60 * 1000, // 1 hour
    });

    // Profile updates: 10 per 5 minutes
    this.configs.set('profile_update', {
      maxRequests: 10,
      windowMs: 5 * 60 * 1000, // 5 minutes
    });

    // General API: 100 per minute
    this.configs.set('api', {
      maxRequests: 100,
      windowMs: 60 * 1000, // 1 minute
    });

    // Failed login attempts (more strict): 3 per 15 minutes
    this.configs.set('failed_login', {
      maxRequests: 3,
      windowMs: 15 * 60 * 1000, // 15 minutes
      skipSuccessfulRequests: false,
    });

    // Account lockout: 1 per day (for severe violations)
    this.configs.set('account_lockout', {
      maxRequests: 1,
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
    });
  }

  /**
   * Set or update rate limit configuration for an action
   */
  setConfig(action: string, config: RateLimitConfig): void {
    this.configs.set(action, config);
  }

  /**
   * Get rate limit configuration for an action
   */
  getConfig(action: string): RateLimitConfig | null {
    return this.configs.get(action) || null;
  }

  /**
   * Check if request is allowed under rate limits
   */
  async isAllowed(
    action: string, 
    identifier: string, 
    isSuccess?: boolean
  ): Promise<Result<RateLimitResult, string>> {
    try {
      const config = this.configs.get(action);
      if (!config) {
        return Result.fail(`No rate limit configuration found for action: ${action}`);
      }

      const key = this.generateKey(identifier, action, config);
      const now = Date.now();
      
      let entry = this.store.get(key);
      
      // Initialize or reset entry if window has passed
      if (!entry || (now - entry.windowStart) >= config.windowMs) {
        entry = {
          count: 0,
          windowStart: now,
          lastRequestTime: now,
          requests: [],
        };
        this.store.set(key, entry);
      }

      // Check if request should be counted
      const shouldCount = this.shouldCountRequest(config, isSuccess);
      
      if (shouldCount) {
        // Check if limit would be exceeded
        if (entry.count >= config.maxRequests) {
          const resetTime = entry.windowStart + config.windowMs;
          const retryAfter = Math.ceil((resetTime - now) / 1000);
          
          return Result.ok({
            allowed: false,
            limit: config.maxRequests,
            remaining: 0,
            resetTime,
            retryAfter,
          });
        }

        // Record the request
        entry.count++;
        entry.lastRequestTime = now;
        entry.requests.push(now);
        
        // Clean old requests (sliding window)
        entry.requests = entry.requests.filter(time => (now - time) < config.windowMs);
        entry.count = entry.requests.length;
      }

      const resetTime = entry.windowStart + config.windowMs;
      const remaining = Math.max(0, config.maxRequests - entry.count);

      return Result.ok({
        allowed: true,
        limit: config.maxRequests,
        remaining,
        resetTime,
      });
    } catch (error: any) {
      return Result.fail(`Rate limit check failed: ${error.message}`);
    }
  }

  /**
   * Record a request (increments counter)
   */
  async recordRequest(
    action: string, 
    identifier: string, 
    isSuccess?: boolean
  ): Promise<Result<void, string>> {
    const result = await this.isAllowed(action, identifier, isSuccess);
    if (result.isFailure) {
      return Result.fail(result.getError());
    }

    const rateLimitResult = result.getValue();
    if (!rateLimitResult.allowed) {
      return Result.fail(`Rate limit exceeded for action: ${action}`);
    }

    return Result.ok(undefined);
  }

  /**
   * Get current rate limit status
   */
  async getStatus(action: string, identifier: string): Promise<Result<RateLimitResult, string>> {
    try {
      const config = this.configs.get(action);
      if (!config) {
        return Result.fail(`No rate limit configuration found for action: ${action}`);
      }

      const key = this.generateKey(identifier, action, config);
      const entry = this.store.get(key);
      const now = Date.now();

      if (!entry || (now - entry.windowStart) >= config.windowMs) {
        return Result.ok({
          allowed: true,
          limit: config.maxRequests,
          remaining: config.maxRequests,
          resetTime: now + config.windowMs,
        });
      }

      const resetTime = entry.windowStart + config.windowMs;
      const remaining = Math.max(0, config.maxRequests - entry.count);
      const allowed = entry.count < config.maxRequests;

      return Result.ok({
        allowed,
        limit: config.maxRequests,
        remaining,
        resetTime,
        retryAfter: allowed ? undefined : Math.ceil((resetTime - now) / 1000),
      });
    } catch (error: any) {
      return Result.fail(`Failed to get rate limit status: ${error.message}`);
    }
  }

  /**
   * Reset rate limit for specific identifier and action
   */
  async reset(action: string, identifier: string): Promise<Result<void, string>> {
    try {
      const config = this.configs.get(action);
      if (!config) {
        return Result.fail(`No rate limit configuration found for action: ${action}`);
      }

      const key = this.generateKey(identifier, action, config);
      this.store.delete(key);
      
      return Result.ok(undefined);
    } catch (error: any) {
      return Result.fail(`Failed to reset rate limit: ${error.message}`);
    }
  }

  /**
   * Reset all rate limits for an identifier
   */
  async resetAll(identifier: string): Promise<Result<void, string>> {
    try {
      const keysToDelete: string[] = [];
      
      for (const [key] of this.store) {
        if (key.includes(identifier)) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => this.store.delete(key));
      
      return Result.ok(undefined);
    } catch (error: any) {
      return Result.fail(`Failed to reset all rate limits: ${error.message}`);
    }
  }

  /**
   * Get all rate limit statuses for an identifier
   */
  async getAllStatuses(identifier: string): Promise<Result<Record<string, RateLimitResult>, string>> {
    try {
      const statuses: Record<string, RateLimitResult> = {};
      
      for (const [action] of this.configs) {
        const statusResult = await this.getStatus(action, identifier);
        if (statusResult.isSuccess) {
          statuses[action] = statusResult.getValue();
        }
      }
      
      return Result.ok(statuses);
    } catch (error: any) {
      return Result.fail(`Failed to get all rate limit statuses: ${error.message}`);
    }
  }

  /**
   * Check if identifier is currently rate limited for any action
   */
  async isRateLimited(identifier: string): Promise<Result<boolean, string>> {
    try {
      const statusesResult = await this.getAllStatuses(identifier);
      if (statusesResult.isFailure) {
        return Result.fail(statusesResult.getError());
      }

      const statuses = statusesResult.getValue();
      const isLimited = Object.values(statuses).some(status => !status.allowed);
      
      return Result.ok(isLimited);
    } catch (error: any) {
      return Result.fail(`Failed to check rate limit status: ${error.message}`);
    }
  }

  /**
   * Get time until rate limit reset for most restrictive limit
   */
  async getTimeUntilReset(identifier: string): Promise<Result<number, string>> {
    try {
      const statusesResult = await this.getAllStatuses(identifier);
      if (statusesResult.isFailure) {
        return Result.fail(statusesResult.getError());
      }

      const statuses = statusesResult.getValue();
      const now = Date.now();
      
      let maxWaitTime = 0;
      
      for (const status of Object.values(statuses)) {
        if (!status.allowed && status.retryAfter) {
          maxWaitTime = Math.max(maxWaitTime, status.retryAfter * 1000);
        }
      }
      
      return Result.ok(maxWaitTime);
    } catch (error: any) {
      return Result.fail(`Failed to get time until reset: ${error.message}`);
    }
  }

  /**
   * Generate cache key for rate limit entry
   */
  private generateKey(identifier: string, action: string, config: RateLimitConfig): string {
    if (config.keyGenerator) {
      return config.keyGenerator(identifier, action);
    }
    return `ratelimit:${action}:${identifier}`;
  }

  /**
   * Determine if request should be counted based on configuration
   */
  private shouldCountRequest(config: RateLimitConfig, isSuccess?: boolean): boolean {
    if (isSuccess === undefined) {
      return true; // Count all requests if success status unknown
    }
    
    if (config.skipSuccessfulRequests && isSuccess) {
      return false;
    }
    
    if (config.skipFailedRequests && !isSuccess) {
      return false;
    }
    
    return true;
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // Cleanup every 5 minutes
  }

  /**
   * Clean up expired rate limit entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.store) {
      // Find the longest window among all configs to determine if entry is truly expired
      const maxWindow = Math.max(...Array.from(this.configs.values()).map(c => c.windowMs));
      
      if ((now - entry.windowStart) > maxWindow) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.store.delete(key));
  }

  /**
   * Get statistics about rate limiter
   */
  getStatistics(): {
    totalEntries: number;
    configuredActions: number;
    oldestEntry: number | null;
    memorySizeEstimate: number;
  } {
    const totalEntries = this.store.size;
    const configuredActions = this.configs.size;
    
    let oldestEntry: number | null = null;
    let memorySizeEstimate = 0;

    for (const [key, entry] of this.store) {
      if (oldestEntry === null || entry.windowStart < oldestEntry) {
        oldestEntry = entry.windowStart;
      }
      
      // Rough estimate: key + entry object
      memorySizeEstimate += key.length * 2 + 100; // Approximate bytes
    }

    return {
      totalEntries,
      configuredActions,
      oldestEntry,
      memorySizeEstimate,
    };
  }

  /**
   * Export rate limit data (for persistence or debugging)
   */
  exportData(): Record<string, any> {
    const data: Record<string, any> = {};
    
    for (const [key, entry] of this.store) {
      data[key] = { ...entry };
    }
    
    return data;
  }

  /**
   * Import rate limit data (for restoring from persistence)
   */
  importData(data: Record<string, any>): void {
    this.store.clear();
    
    for (const [key, entry] of Object.entries(data)) {
      if (entry && typeof entry === 'object') {
        this.store.set(key, entry as RateLimitEntry);
      }
    }
  }

  /**
   * Destroy rate limiter and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.store.clear();
    this.configs.clear();
  }
}

/**
 * Singleton instance for application-wide rate limiting
 */
let globalRateLimiter: RateLimiter | null = null;

/**
 * Get the global rate limiter instance
 */
export const getRateLimiter = (): RateLimiter => {
  if (!globalRateLimiter) {
    globalRateLimiter = new RateLimiter();
  }
  return globalRateLimiter;
};

/**
 * Reset the global rate limiter (for testing)
 */
export const resetRateLimiter = (): void => {
  if (globalRateLimiter) {
    globalRateLimiter.destroy();
    globalRateLimiter = null;
  }
};

export default RateLimiter;