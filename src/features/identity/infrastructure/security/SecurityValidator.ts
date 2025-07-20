import { Result } from '@core/types/result';

/**
 * Security rule interface
 */
export interface SecurityRule {
  name: string;
  description: string;
  validate: (input: any, context?: any) => Result<void, string>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'input' | 'rate_limiting' | 'data' | 'network';
}

/**
 * Security validation result
 */
export interface SecurityValidationResult {
  isValid: boolean;
  errors: Array<{
    rule: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
  }>;
  warnings: Array<{
    rule: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
  }>;
  score: number; // 0-100, higher is better
}

/**
 * Security validator for authentication operations
 * Implements OWASP security guidelines and best practices
 */
export class SecurityValidator {
  private rules: SecurityRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Initialize default security rules
   */
  private initializeDefaultRules(): void {
    this.rules = [
      // Email validation rules
      {
        name: 'email_format',
        description: 'Validate email format',
        validate: (email: string) => {
          if (!email || typeof email !== 'string') {
            return Result.fail('Email is required and must be a string');
          }
          
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            return Result.fail('Invalid email format');
          }
          
          if (email.length > 254) {
            return Result.fail('Email address is too long');
          }
          
          return Result.ok(undefined);
        },
        severity: 'high',
        category: 'input',
      },
      
      {
        name: 'email_disposable',
        description: 'Check for disposable email domains',
        validate: (email: string) => {
          const disposableDomains = [
            '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
            'mailinator.com', 'yopmail.com', 'throwaway.email',
            'temp-mail.org', 'getairmail.com', 'maildrop.cc',
          ];
          
          const domain = email.split('@')[1]?.toLowerCase();
          if (disposableDomains.includes(domain)) {
            return Result.fail('Disposable email addresses are not allowed');
          }
          
          return Result.ok(undefined);
        },
        severity: 'medium',
        category: 'authentication',
      },

      // Password validation rules
      {
        name: 'password_strength',
        description: 'Validate password strength',
        validate: (password: string) => {
          if (!password || typeof password !== 'string') {
            return Result.fail('Password is required and must be a string');
          }
          
          if (password.length < 8) {
            return Result.fail('Password must be at least 8 characters long');
          }
          
          if (password.length > 128) {
            return Result.fail('Password must be less than 128 characters');
          }
          
          // Check complexity
          const hasUpper = /[A-Z]/.test(password);
          const hasLower = /[a-z]/.test(password);
          const hasNumber = /\d/.test(password);
          const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
          
          const complexityScore = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
          
          if (complexityScore < 3) {
            return Result.fail('Password must contain at least 3 of: uppercase, lowercase, numbers, special characters');
          }
          
          return Result.ok(undefined);
        },
        severity: 'critical',
        category: 'authentication',
      },
      
      {
        name: 'password_common',
        description: 'Check against common passwords',
        validate: (password: string) => {
          const commonPasswords = [
            'password', 'password123', '123456', '123456789', 'qwerty',
            'abc123', 'password1', '12345678', '111111', '1234567890',
            'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'sunshine',
            'princess', 'football', 'charlie', 'aa123456', 'password!',
            'passw0rd', 'Password1', 'Password123', '12345', 'welcome123',
          ];
          
          if (commonPasswords.includes(password.toLowerCase())) {
            return Result.fail('Password is too common and easily guessable');
          }
          
          return Result.ok(undefined);
        },
        severity: 'high',
        category: 'authentication',
      },

      // Input sanitization rules
      {
        name: 'xss_prevention',
        description: 'Prevent XSS attacks in user input',
        validate: (input: string) => {
          if (!input || typeof input !== 'string') {
            return Result.ok(undefined);
          }
          
          const xssPatterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe[^>]*>.*?<\/iframe>/gi,
            /<object[^>]*>.*?<\/object>/gi,
            /<embed[^>]*>/gi,
            /<link[^>]*>/gi,
            /<meta[^>]*>/gi,
          ];
          
          for (const pattern of xssPatterns) {
            if (pattern.test(input)) {
              return Result.fail('Input contains potentially malicious content');
            }
          }
          
          return Result.ok(undefined);
        },
        severity: 'critical',
        category: 'input',
      },
      
      {
        name: 'sql_injection_prevention',
        description: 'Prevent SQL injection in input',
        validate: (input: string) => {
          if (!input || typeof input !== 'string') {
            return Result.ok(undefined);
          }
          
          const sqlPatterns = [
            /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
            /(--|\/\*|\*\/|;)/g,
            /'[^']*'|"[^"]*"/g,
            /\b(or|and)\s+\d+\s*=\s*\d+/gi,
          ];
          
          for (const pattern of sqlPatterns) {
            if (pattern.test(input)) {
              return Result.fail('Input contains potentially malicious SQL patterns');
            }
          }
          
          return Result.ok(undefined);
        },
        severity: 'critical',
        category: 'input',
      },

      // Display name validation
      {
        name: 'display_name_length',
        description: 'Validate display name length',
        validate: (displayName: string) => {
          if (!displayName || typeof displayName !== 'string') {
            return Result.fail('Display name is required');
          }
          
          if (displayName.trim().length < 1) {
            return Result.fail('Display name cannot be empty');
          }
          
          if (displayName.length > 50) {
            return Result.fail('Display name cannot exceed 50 characters');
          }
          
          return Result.ok(undefined);
        },
        severity: 'medium',
        category: 'input',
      },
      
      {
        name: 'display_name_content',
        description: 'Validate display name content',
        validate: (displayName: string) => {
          if (!displayName || typeof displayName !== 'string') {
            return Result.ok(undefined);
          }
          
          // Check for inappropriate content patterns
          const inappropriatePatterns = [
            /admin/gi,
            /support/gi,
            /system/gi,
            /null/gi,
            /undefined/gi,
            /\b(fuck|shit|damn|hell|ass|bitch)\b/gi,
            /[^\w\s\-\.]/g, // Only allow alphanumeric, spaces, hyphens, and dots
          ];
          
          for (const pattern of inappropriatePatterns) {
            if (pattern.test(displayName)) {
              return Result.fail('Display name contains inappropriate content or characters');
            }
          }
          
          return Result.ok(undefined);
        },
        severity: 'medium',
        category: 'input',
      },

      // Rate limiting validation
      {
        name: 'request_frequency',
        description: 'Validate request frequency',
        validate: (context: { lastRequestTime?: number; requestCount?: number; timeWindow?: number }) => {
          if (!context) {
            return Result.ok(undefined);
          }
          
          const { lastRequestTime, requestCount = 0, timeWindow = 60000 } = context;
          const now = Date.now();
          
          if (lastRequestTime && (now - lastRequestTime) < 1000) {
            return Result.fail('Requests are being made too frequently');
          }
          
          if (requestCount > 10 && timeWindow < 60000) {
            return Result.fail('Too many requests in a short time period');
          }
          
          return Result.ok(undefined);
        },
        severity: 'high',
        category: 'rate_limiting',
      },

      // Data validation rules
      {
        name: 'user_age',
        description: 'Validate user age requirements',
        validate: (birthDate: string) => {
          if (!birthDate) {
            return Result.ok(undefined);
          }
          
          const birth = new Date(birthDate);
          const today = new Date();
          const age = today.getFullYear() - birth.getFullYear();
          
          if (age < 13) {
            return Result.fail('Users must be at least 13 years old');
          }
          
          if (age > 120) {
            return Result.fail('Invalid birth date');
          }
          
          return Result.ok(undefined);
        },
        severity: 'high',
        category: 'data',
      },

      // Network security rules
      {
        name: 'ip_validation',
        description: 'Validate IP address format',
        validate: (ip: string, context: { allowPrivate?: boolean } = {}) => {
          if (!ip) {
            return Result.ok(undefined);
          }
          
          const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
          const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
          
          if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
            return Result.fail('Invalid IP address format');
          }
          
          // Check for private/local IPs in production
          if (!context.allowPrivate && typeof window !== 'undefined') {
            const privateRanges = [
              /^10\./,
              /^172\.(1[6-9]|2[0-9]|3[01])\./,
              /^192\.168\./,
              /^127\./,
              /^169\.254\./,
            ];
            
            if (privateRanges.some(range => range.test(ip))) {
              return Result.fail('Private IP addresses are not allowed');
            }
          }
          
          return Result.ok(undefined);
        },
        severity: 'medium',
        category: 'network',
      },
    ];
  }

  /**
   * Add a custom security rule
   */
  addRule(rule: SecurityRule): void {
    this.rules.push(rule);
  }

  /**
   * Remove a security rule by name
   */
  removeRule(name: string): void {
    this.rules = this.rules.filter(rule => rule.name !== name);
  }

  /**
   * Get all security rules
   */
  getRules(): SecurityRule[] {
    return [...this.rules];
  }

  /**
   * Validate email address
   */
  validateEmail(email: string): SecurityValidationResult {
    const applicableRules = this.rules.filter(rule => 
      ['email_format', 'email_disposable', 'xss_prevention'].includes(rule.name)
    );
    
    return this.validateWithRules(email, applicableRules);
  }

  /**
   * Validate password
   */
  validatePassword(password: string): SecurityValidationResult {
    const applicableRules = this.rules.filter(rule => 
      ['password_strength', 'password_common', 'xss_prevention'].includes(rule.name)
    );
    
    return this.validateWithRules(password, applicableRules);
  }

  /**
   * Validate display name
   */
  validateDisplayName(displayName: string): SecurityValidationResult {
    const applicableRules = this.rules.filter(rule => 
      ['display_name_length', 'display_name_content', 'xss_prevention', 'sql_injection_prevention'].includes(rule.name)
    );
    
    return this.validateWithRules(displayName, applicableRules);
  }

  /**
   * Validate user registration data
   */
  validateUserRegistration(data: {
    email: string;
    password: string;
    displayName: string;
    birthDate?: string;
  }): SecurityValidationResult {
    const results: SecurityValidationResult[] = [
      this.validateEmail(data.email),
      this.validatePassword(data.password),
      this.validateDisplayName(data.displayName),
    ];

    if (data.birthDate) {
      const ageRule = this.rules.find(rule => rule.name === 'user_age');
      if (ageRule) {
        results.push(this.validateWithRules(data.birthDate, [ageRule]));
      }
    }

    return this.combineResults(results);
  }

  /**
   * Validate request context for rate limiting
   */
  validateRequestContext(context: {
    lastRequestTime?: number;
    requestCount?: number;
    timeWindow?: number;
    ip?: string;
  }): SecurityValidationResult {
    const applicableRules = this.rules.filter(rule => 
      ['request_frequency', 'ip_validation'].includes(rule.name)
    );
    
    return this.validateWithRules(context, applicableRules, context);
  }

  /**
   * Validate with specific rules
   */
  private validateWithRules(
    input: any, 
    rules: SecurityRule[], 
    context?: any
  ): SecurityValidationResult {
    const errors: SecurityValidationResult['errors'] = [];
    const warnings: SecurityValidationResult['warnings'] = [];

    for (const rule of rules) {
      const result = rule.validate(input, context);
      
      if (result.isFailure) {
        const violation = {
          rule: rule.name,
          message: result.getError(),
          severity: rule.severity,
          category: rule.category,
        };

        if (rule.severity === 'critical' || rule.severity === 'high') {
          errors.push(violation);
        } else {
          warnings.push(violation);
        }
      }
    }

    const score = this.calculateSecurityScore(errors, warnings, rules.length);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score,
    };
  }

  /**
   * Combine multiple validation results
   */
  private combineResults(results: SecurityValidationResult[]): SecurityValidationResult {
    const combinedErrors: SecurityValidationResult['errors'] = [];
    const combinedWarnings: SecurityValidationResult['warnings'] = [];

    for (const result of results) {
      combinedErrors.push(...result.errors);
      combinedWarnings.push(...result.warnings);
    }

    const totalRules = results.reduce((sum, result) => sum + result.errors.length + result.warnings.length, 0);
    const score = this.calculateSecurityScore(combinedErrors, combinedWarnings, totalRules);

    return {
      isValid: combinedErrors.length === 0,
      errors: combinedErrors,
      warnings: combinedWarnings,
      score,
    };
  }

  /**
   * Calculate security score (0-100)
   */
  private calculateSecurityScore(
    errors: SecurityValidationResult['errors'],
    warnings: SecurityValidationResult['warnings'],
    totalRules: number
  ): number {
    if (totalRules === 0) return 100;

    const criticalWeight = 25;
    const highWeight = 15;
    const mediumWeight = 10;
    const lowWeight = 5;

    let penalty = 0;

    for (const error of errors) {
      switch (error.severity) {
        case 'critical':
          penalty += criticalWeight;
          break;
        case 'high':
          penalty += highWeight;
          break;
        case 'medium':
          penalty += mediumWeight;
          break;
        case 'low':
          penalty += lowWeight;
          break;
      }
    }

    for (const warning of warnings) {
      switch (warning.severity) {
        case 'critical':
          penalty += criticalWeight * 0.5;
          break;
        case 'high':
          penalty += highWeight * 0.5;
          break;
        case 'medium':
          penalty += mediumWeight * 0.5;
          break;
        case 'low':
          penalty += lowWeight * 0.5;
          break;
      }
    }

    return Math.max(0, Math.min(100, 100 - penalty));
  }

  /**
   * Get security recommendations based on validation result
   */
  getSecurityRecommendations(result: SecurityValidationResult): string[] {
    const recommendations: string[] = [];

    if (result.score < 60) {
      recommendations.push('Security score is low. Please address all critical and high severity issues.');
    }

    if (result.errors.some(e => e.category === 'authentication')) {
      recommendations.push('Use strong authentication methods and consider multi-factor authentication.');
    }

    if (result.errors.some(e => e.category === 'input')) {
      recommendations.push('Implement proper input validation and sanitization.');
    }

    if (result.errors.some(e => e.category === 'rate_limiting')) {
      recommendations.push('Implement rate limiting to prevent abuse.');
    }

    if (result.warnings.length > 0) {
      recommendations.push('Consider addressing warning-level security issues for better protection.');
    }

    return recommendations;
  }

  /**
   * Check if validation passes minimum security requirements
   */
  meetsMinimumSecurity(result: SecurityValidationResult): boolean {
    const hasCriticalErrors = result.errors.some(e => e.severity === 'critical');
    const hasMultipleHighErrors = result.errors.filter(e => e.severity === 'high').length > 2;
    
    return !hasCriticalErrors && !hasMultipleHighErrors && result.score >= 70;
  }
}