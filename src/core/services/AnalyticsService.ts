import { logger } from '../utils/logger';
import Constants from 'expo-constants';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: number;
}

export interface UserProperties {
  userId: string;
  email?: string;
  plan?: 'free' | 'premium';
  registrationDate?: string;
  lastActive?: string;
  [key: string]: any;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  metadata?: Record<string, any>;
}

/**
 * Centralized analytics service for tracking user behavior and app performance
 */
export class AnalyticsService {
  private isEnabled: boolean;
  private userId?: string;
  private sessionId: string;
  private sessionStartTime: number;

  constructor() {
    this.isEnabled = this.getAnalyticsEnabled();
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    
    if (this.isEnabled) {
      this.initializeAnalytics();
    }
  }

  /**
   * Initialize analytics services
   */
  private async initializeAnalytics(): Promise<void> {
    try {
      // Initialize Firebase Analytics
      if (Constants.expoConfig?.extra?.enableAnalytics) {
        // Firebase Analytics initialization would go here
        logger.info('Firebase Analytics initialized');
      }

      // Initialize Mixpanel
      if (Constants.expoConfig?.extra?.mixpanelToken) {
        // Mixpanel initialization would go here
        logger.info('Mixpanel initialized');
      }

      // Track app launch
      this.trackEvent('app_launched', {
        version: Constants.expoConfig?.version,
        platform: Constants.platform?.ios ? 'ios' : 'android',
        sessionId: this.sessionId,
      });
    } catch (error) {
      logger.error('Failed to initialize analytics', { error });
    }
  }

  /**
   * Set the current user for analytics tracking
   */
  setUser(userId: string, properties?: UserProperties): void {
    if (!this.isEnabled) return;

    try {
      this.userId = userId;
      
      const userProps = {
        userId,
        lastActive: new Date().toISOString(),
        ...properties,
      };

      // Set user properties in Firebase Analytics
      // firebaseAnalytics.setUserId(userId);
      // firebaseAnalytics.setUserProperties(userProps);

      // Set user properties in Mixpanel
      // mixpanel.identify(userId);
      // mixpanel.getPeople().set(userProps);

      logger.info('Analytics user set', { userId });
    } catch (error) {
      logger.error('Failed to set analytics user', { userId, error });
    }
  }

  /**
   * Track a custom event
   */
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    try {
      const event: AnalyticsEvent = {
        name: eventName,
        properties: {
          sessionId: this.sessionId,
          userId: this.userId,
          timestamp: Date.now(),
          ...properties,
        },
        userId: this.userId,
        timestamp: Date.now(),
      };

      // Track in Firebase Analytics
      // firebaseAnalytics.logEvent(eventName, event.properties);

      // Track in Mixpanel
      // mixpanel.track(eventName, event.properties);

      logger.debug('Analytics event tracked', { event });
    } catch (error) {
      logger.error('Failed to track analytics event', { eventName, properties, error });
    }
  }

  /**
   * Track screen views
   */
  trackScreen(screenName: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    try {
      const screenProperties = {
        screenName,
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: Date.now(),
        ...properties,
      };

      // Track screen view in Firebase Analytics
      // firebaseAnalytics.logEvent('screen_view', screenProperties);

      // Track page view in Mixpanel
      // mixpanel.track('Page Viewed', screenProperties);

      logger.debug('Screen view tracked', { screenName, properties });
    } catch (error) {
      logger.error('Failed to track screen view', { screenName, properties, error });
    }
  }

  /**
   * Track user actions
   */
  trackUserAction(action: string, category?: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    this.trackEvent('user_action', {
      action,
      category,
      ...properties,
    });
  }

  /**
   * Track business events
   */
  trackBusinessEvent(eventType: string, value?: number, currency?: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    this.trackEvent('business_event', {
      eventType,
      value,
      currency: currency || 'USD',
      ...properties,
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: PerformanceMetric): void {
    if (!this.isEnabled) return;

    try {
      const performanceEvent = {
        metricName: metric.name,
        value: metric.value,
        unit: metric.unit,
        sessionId: this.sessionId,
        userId: this.userId,
        ...metric.metadata,
      };

      // Track performance in Firebase Analytics
      // firebaseAnalytics.logEvent('performance_metric', performanceEvent);

      // Track performance in Mixpanel
      // mixpanel.track('Performance Metric', performanceEvent);

      logger.debug('Performance metric tracked', { metric });
    } catch (error) {
      logger.error('Failed to track performance metric', { metric, error });
    }
  }

  /**
   * Track errors for analytics (non-crash errors)
   */
  trackError(error: Error, context?: Record<string, any>): void {
    if (!this.isEnabled) return;

    try {
      const errorEvent = {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
        sessionId: this.sessionId,
        userId: this.userId,
        ...context,
      };

      // Track error in Firebase Analytics
      // firebaseAnalytics.logEvent('app_error', errorEvent);

      // Track error in Mixpanel
      // mixpanel.track('App Error', errorEvent);

      logger.debug('Error tracked in analytics', { error: errorEvent });
    } catch (trackingError) {
      logger.error('Failed to track error in analytics', { error, trackingError });
    }
  }

  /**
   * Track session duration and end session
   */
  endSession(): void {
    if (!this.isEnabled) return;

    try {
      const sessionDuration = Date.now() - this.sessionStartTime;
      
      this.trackEvent('session_ended', {
        sessionId: this.sessionId,
        sessionDuration,
        userId: this.userId,
      });

      logger.info('Analytics session ended', { 
        sessionId: this.sessionId, 
        duration: sessionDuration 
      });
    } catch (error) {
      logger.error('Failed to end analytics session', { error });
    }
  }

  /**
   * Flush analytics data
   */
  async flush(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // Flush Firebase Analytics
      // await firebaseAnalytics.flush();

      // Flush Mixpanel
      // await mixpanel.flush();

      logger.debug('Analytics data flushed');
    } catch (error) {
      logger.error('Failed to flush analytics data', { error });
    }
  }

  /**
   * Reset analytics data (for logout)
   */
  reset(): void {
    if (!this.isEnabled) return;

    try {
      this.userId = undefined;
      this.sessionId = this.generateSessionId();
      this.sessionStartTime = Date.now();

      // Reset Firebase Analytics
      // firebaseAnalytics.resetAnalyticsData();

      // Reset Mixpanel
      // mixpanel.reset();

      logger.info('Analytics data reset');
    } catch (error) {
      logger.error('Failed to reset analytics data', { error });
    }
  }

  /**
   * Check if analytics is enabled
   */
  private getAnalyticsEnabled(): boolean {
    const envEnabled = Constants.expoConfig?.extra?.enableAnalytics;
    const isProduction = Constants.expoConfig?.extra?.environment === 'production';
    
    return envEnabled === true || (envEnabled !== false && isProduction);
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();