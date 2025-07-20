import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Client-side rate limiting service
 * Note: This is complementary to server-side rate limiting
 */
export class RateLimitService {
  private readonly configs: Map<string, RateLimitConfig>;

  constructor() {
    this.configs = new Map();
    this.setupDefaultConfigs();
  }

  private setupDefaultConfigs(): void {
    // API requests
    this.configs.set('api', {
      maxRequests: 60,
      windowMs: 60 * 1000, // 1 minute
      keyPrefix: 'rate_limit_api',
    });

    // Image uploads
    this.configs.set('upload', {
      maxRequests: 10,
      windowMs: 60 * 1000, // 1 minute
      keyPrefix: 'rate_limit_upload',
    });

    // Style analysis requests
    this.configs.set('analysis', {
      maxRequests: 5,
      windowMs: 60 * 1000, // 1 minute
      keyPrefix: 'rate_limit_analysis',
    });

    // Authentication attempts
    this.configs.set('auth', {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      keyPrefix: 'rate_limit_auth',
    });
  }

  /**
   * Check if a request is allowed based on rate limiting
   */
  async checkRateLimit(
    action: string,
    userId?: string,
    customConfig?: Partial<RateLimitConfig>
  ): Promise<RateLimitResult> {
    try {
      const config = this.getConfig(action, customConfig);
      const key = this.generateKey(config.keyPrefix, action, userId);
      
      const now = Date.now();
      const windowStart = now - config.windowMs;
      
      // Get existing requests from storage
      const requestsData = await this.getRequestsData(key);
      
      // Filter requests within the current window
      const validRequests = requestsData.filter(
        (timestamp: number) => timestamp > windowStart
      );
      
      const remainingRequests = Math.max(0, config.maxRequests - validRequests.length);
      const resetTime = validRequests.length > 0 
        ? Math.min(...validRequests) + config.windowMs
        : now + config.windowMs;
      
      if (validRequests.length >= config.maxRequests) {
        const retryAfter = Math.ceil((resetTime - now) / 1000);
        
        logger.warn('Rate limit exceeded', {
          action,
          userId: userId || 'anonymous',
          requests: validRequests.length,
          maxRequests: config.maxRequests,
          retryAfter,
        });
        
        return {
          allowed: false,
          remainingRequests: 0,
          resetTime,
          retryAfter,
        };
      }
      
      // Add current request timestamp
      validRequests.push(now);
      await this.saveRequestsData(key, validRequests);
      
      return {
        allowed: true,
        remainingRequests: remainingRequests - 1,
        resetTime,
      };
    } catch (error) {
      logger.error('Rate limit check failed', { action, userId, error });
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        remainingRequests: 0,
        resetTime: Date.now() + 60000,
      };
    }
  }

  /**
   * Record a successful request
   */
  async recordRequest(action: string, userId?: string): Promise<void> {
    try {
      const result = await this.checkRateLimit(action, userId);
      if (!result.allowed) {
        throw new Error(`Rate limit exceeded for action: ${action}`);
      }
    } catch (error) {
      logger.error('Failed to record request', { action, userId, error });
      throw error;
    }
  }

  /**
   * Clear rate limit data for a specific action/user
   */
  async clearRateLimit(action: string, userId?: string): Promise<void> {
    try {
      const config = this.getConfig(action);
      const key = this.generateKey(config.keyPrefix, action, userId);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      logger.error('Failed to clear rate limit', { action, userId, error });
    }
  }

  /**
   * Get rate limit status without recording a request
   */
  async getRateLimitStatus(action: string, userId?: string): Promise<RateLimitResult> {
    try {
      const config = this.getConfig(action);
      const key = this.generateKey(config.keyPrefix, action, userId);
      
      const now = Date.now();
      const windowStart = now - config.windowMs;
      
      const requestsData = await this.getRequestsData(key);
      const validRequests = requestsData.filter(
        (timestamp: number) => timestamp > windowStart
      );
      
      const remainingRequests = Math.max(0, config.maxRequests - validRequests.length);
      const resetTime = validRequests.length > 0 
        ? Math.min(...validRequests) + config.windowMs
        : now + config.windowMs;
      
      return {
        allowed: validRequests.length < config.maxRequests,
        remainingRequests,
        resetTime,
        retryAfter: validRequests.length >= config.maxRequests 
          ? Math.ceil((resetTime - now) / 1000)
          : undefined,
      };
    } catch (error) {
      logger.error('Failed to get rate limit status', { action, userId, error });
      return {
        allowed: true,
        remainingRequests: 0,
        resetTime: Date.now() + 60000,
      };
    }
  }

  private getConfig(action: string, customConfig?: Partial<RateLimitConfig>): RateLimitConfig {
    const baseConfig = this.configs.get(action) || this.configs.get('api')!;
    return { ...baseConfig, ...customConfig };
  }

  private generateKey(prefix: string, action: string, userId?: string): string {
    const userPart = userId || 'anonymous';
    return `${prefix}_${action}_${userPart}`;
  }

  private async getRequestsData(key: string): Promise<number[]> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logger.error('Failed to get requests data', { key, error });
      return [];
    }
  }

  private async saveRequestsData(key: string, requests: number[]): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(requests));
    } catch (error) {
      logger.error('Failed to save requests data', { key, error });
    }
  }
}

// Export singleton instance
export const rateLimitService = new RateLimitService();