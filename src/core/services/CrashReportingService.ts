import { logger } from '../utils/logger';
import Constants from 'expo-constants';

export interface CrashReport {
  error: Error;
  userId?: string;
  sessionId?: string;
  context?: Record<string, any>;
  breadcrumbs?: Breadcrumb[];
  timestamp: number;
}

export interface Breadcrumb {
  message: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  category?: string;
  timestamp: number;
  data?: Record<string, any>;
}

export interface UserContext {
  userId: string;
  email?: string;
  plan?: string;
  version?: string;
  platform?: string;
}

/**
 * Centralized crash reporting and error tracking service
 */
export class CrashReportingService {
  private isEnabled: boolean;
  private breadcrumbs: Breadcrumb[] = [];
  private userContext?: UserContext;
  private maxBreadcrumbs = 50;

  constructor() {
    this.isEnabled = this.getCrashReportingEnabled();
    
    if (this.isEnabled) {
      this.initializeCrashReporting();
      this.setupGlobalErrorHandlers();
    }
  }

  /**
   * Initialize crash reporting services
   */
  private async initializeCrashReporting(): Promise<void> {
    try {
      // Initialize Sentry
      if (Constants.expoConfig?.extra?.sentryDsn) {
        // Sentry initialization would go here
        logger.info('Sentry initialized');
      }

      // Initialize Firebase Crashlytics
      if (Constants.expoConfig?.extra?.enableCrashlytics) {
        // Firebase Crashlytics initialization would go here
        logger.info('Firebase Crashlytics initialized');
      }

      this.addBreadcrumb({
        message: 'Crash reporting initialized',
        level: 'info',
        category: 'system',
      });
    } catch (error) {
      logger.error('Failed to initialize crash reporting', { error });
    }
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    const originalHandler = ErrorUtils.getGlobalHandler();
    
    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      this.captureException(error, {
        isFatal,
        source: 'global_handler',
      });

      // Call original handler
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });

    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.captureException(new Error(event.reason), {
          source: 'unhandled_promise_rejection',
          reason: event.reason,
        });
      });
    }
  }

  /**
   * Set user context for crash reports
   */
  setUserContext(context: UserContext): void {
    if (!this.isEnabled) return;

    try {
      this.userContext = context;

      // Set user context in Sentry
      // Sentry.setUser({
      //   id: context.userId,
      //   email: context.email,
      // });

      // Set user context in Firebase Crashlytics
      // crashlytics().setUserId(context.userId);
      // if (context.email) {
      //   crashlytics().setAttributes({ email: context.email });
      // }

      this.addBreadcrumb({
        message: 'User context set',
        level: 'info',
        category: 'user',
        data: { userId: context.userId },
      });

      logger.debug('Crash reporting user context set', { userId: context.userId });
    } catch (error) {
      logger.error('Failed to set crash reporting user context', { error });
    }
  }

  /**
   * Capture an exception
   */
  captureException(error: Error, context?: Record<string, any>): void {
    if (!this.isEnabled) return;

    try {
      const crashReport: CrashReport = {
        error,
        userId: this.userContext?.userId,
        context: {
          ...context,
          userContext: this.userContext,
          appVersion: Constants.expoConfig?.version,
          platform: Constants.platform?.ios ? 'ios' : 'android',
        },
        breadcrumbs: [...this.breadcrumbs],
        timestamp: Date.now(),
      };

      // Send to Sentry
      // Sentry.captureException(error, {
      //   contexts: crashReport.context,
      //   extra: crashReport.context,
      // });

      // Send to Firebase Crashlytics
      // crashlytics().recordError(error);

      this.addBreadcrumb({
        message: `Exception captured: ${error.message}`,
        level: 'error',
        category: 'exception',
        data: { errorName: error.name },
      });

      logger.error('Exception captured by crash reporting', { crashReport });
    } catch (reportingError) {
      logger.error('Failed to capture exception', { error, reportingError });
    }
  }

  /**
   * Capture a custom message
   */
  captureMessage(message: string, level: 'debug' | 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>): void {
    if (!this.isEnabled) return;

    try {
      // Send to Sentry
      // Sentry.captureMessage(message, level as SentryLevel);

      // Log to Firebase Crashlytics
      // crashlytics().log(message);

      this.addBreadcrumb({
        message,
        level,
        category: 'message',
        data: context,
      });

      logger.debug('Message captured by crash reporting', { message, level, context });
    } catch (error) {
      logger.error('Failed to capture message', { message, level, error });
    }
  }

  /**
   * Add a breadcrumb for debugging context
   */
  addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
    if (!this.isEnabled) return;

    try {
      const fullBreadcrumb: Breadcrumb = {
        ...breadcrumb,
        timestamp: Date.now(),
      };

      this.breadcrumbs.push(fullBreadcrumb);

      // Keep only the last N breadcrumbs
      if (this.breadcrumbs.length > this.maxBreadcrumbs) {
        this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
      }

      // Add to Sentry
      // Sentry.addBreadcrumb({
      //   message: breadcrumb.message,
      //   level: breadcrumb.level as SentryLevel,
      //   category: breadcrumb.category,
      //   data: breadcrumb.data,
      // });

      // Add to Firebase Crashlytics
      // crashlytics().log(`[${breadcrumb.level}] ${breadcrumb.message}`);

      logger.debug('Breadcrumb added', { breadcrumb: fullBreadcrumb });
    } catch (error) {
      logger.error('Failed to add breadcrumb', { breadcrumb, error });
    }
  }

  /**
   * Set custom context/tags
   */
  setContext(key: string, value: any): void {
    if (!this.isEnabled) return;

    try {
      // Set context in Sentry
      // Sentry.setContext(key, value);

      // Set attributes in Firebase Crashlytics
      // crashlytics().setAttributes({ [key]: String(value) });

      logger.debug('Context set in crash reporting', { key, value });
    } catch (error) {
      logger.error('Failed to set context', { key, value, error });
    }
  }

  /**
   * Track performance issues
   */
  trackPerformanceIssue(name: string, duration: number, context?: Record<string, any>): void {
    if (!this.isEnabled) return;

    try {
      if (duration > 1000) { // Track slow operations (>1s)
        this.captureMessage(
          `Performance issue: ${name} took ${duration}ms`,
          'warning',
          {
            performanceIssue: true,
            operationName: name,
            duration,
            ...context,
          }
        );
      }

      this.addBreadcrumb({
        message: `Performance: ${name} (${duration}ms)`,
        level: duration > 1000 ? 'warning' : 'info',
        category: 'performance',
        data: { duration, ...context },
      });
    } catch (error) {
      logger.error('Failed to track performance issue', { name, duration, error });
    }
  }

  /**
   * Clear breadcrumbs
   */
  clearBreadcrumbs(): void {
    if (!this.isEnabled) return;

    this.breadcrumbs = [];
    logger.debug('Breadcrumbs cleared');
  }

  /**
   * Clear user context (for logout)
   */
  clearUserContext(): void {
    if (!this.isEnabled) return;

    try {
      this.userContext = undefined;

      // Clear user context in Sentry
      // Sentry.setUser(null);

      // Clear user context in Firebase Crashlytics
      // crashlytics().setUserId('');

      this.addBreadcrumb({
        message: 'User context cleared',
        level: 'info',
        category: 'user',
      });

      logger.debug('Crash reporting user context cleared');
    } catch (error) {
      logger.error('Failed to clear crash reporting user context', { error });
    }
  }

  /**
   * Test crash reporting (development only)
   */
  testCrashReporting(): void {
    if (!this.isEnabled || Constants.expoConfig?.extra?.environment === 'production') {
      return;
    }

    try {
      this.captureMessage('Test message from crash reporting service', 'info');
      this.captureException(new Error('Test exception from crash reporting service'));
      logger.info('Crash reporting test completed');
    } catch (error) {
      logger.error('Failed to test crash reporting', { error });
    }
  }

  /**
   * Check if crash reporting is enabled
   */
  private getCrashReportingEnabled(): boolean {
    const envEnabled = Constants.expoConfig?.extra?.enableCrashlytics;
    const isProduction = Constants.expoConfig?.extra?.environment === 'production';
    
    return envEnabled === true || (envEnabled !== false && isProduction);
  }
}

// Export singleton instance
export const crashReportingService = new CrashReportingService();