import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CommonActions, StackActions } from '@react-navigation/native';

import {
  RootStackParamList,
  AuthStackParamList,
  OnboardingStackParamList,
  AppStackParamList,
  HomeStackParamList,
  WardrobeStackParamList,
  StylingStackParamList,
  ProfileStackParamList,
  ROUTE_NAMES,
} from './types';

/**
 * Type-safe navigation hook for Root Stack
 */
export function useRootNavigation() {
  return useNavigation<NativeStackNavigationProp<RootStackParamList>>();
}

/**
 * Type-safe navigation hook for Auth Stack
 */
export function useAuthNavigation() {
  return useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
}

/**
 * Type-safe navigation hook for Onboarding Stack
 */
export function useOnboardingNavigation() {
  return useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
}

/**
 * Type-safe navigation hook for App Stack (Bottom Tabs)
 */
export function useAppNavigation() {
  return useNavigation<BottomTabNavigationProp<AppStackParamList>>();
}

/**
 * Type-safe navigation hook for Home Stack
 */
export function useHomeNavigation() {
  return useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
}

/**
 * Type-safe navigation hook for Wardrobe Stack
 */
export function useWardrobeNavigation() {
  return useNavigation<NativeStackNavigationProp<WardrobeStackParamList>>();
}

/**
 * Type-safe navigation hook for Styling Stack
 */
export function useStylingNavigation() {
  return useNavigation<NativeStackNavigationProp<StylingStackParamList>>();
}

/**
 * Type-safe navigation hook for Profile Stack
 */
export function useProfileNavigation() {
  return useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
}

/**
 * Common navigation actions hook
 * Provides commonly used navigation actions across the app
 */
export function useNavigationActions() {
  const navigation = useNavigation();

  const navigateToAuth = useCallback(() => {
    (navigation as any).dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: ROUTE_NAMES.ROOT.AUTH_STACK }],
      })
    );
  }, [navigation]);

  const navigateToOnboarding = useCallback(() => {
    (navigation as any).dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: ROUTE_NAMES.ROOT.ONBOARDING_STACK }],
      })
    );
  }, [navigation]);

  const navigateToApp = useCallback(() => {
    (navigation as any).dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: ROUTE_NAMES.ROOT.APP_STACK }],
      })
    );
  }, [navigation]);

  const navigateToLogin = useCallback(() => {
    (navigation as any).navigate(ROUTE_NAMES.ROOT.AUTH_STACK);
  }, [navigation]);

  const navigateToHome = useCallback(() => {
    (navigation as any).navigate(ROUTE_NAMES.ROOT.APP_STACK);
  }, [navigation]);

  const goBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const popToTop = useCallback(() => {
    navigation.dispatch(StackActions.popToTop());
  }, [navigation]);

  const resetToScreen = useCallback((routeName: string, params?: any) => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: routeName, params }],
      })
    );
  }, [navigation]);

  return {
    navigateToAuth,
    navigateToOnboarding,
    navigateToApp,
    navigateToLogin,
    navigateToHome,
    goBack,
    popToTop,
    resetToScreen,
  };
}

/**
 * Authentication flow navigation hook
 * Handles navigation logic for authentication states
 */
export function useAuthFlow() {
  const { navigateToAuth, navigateToOnboarding, navigateToApp } = useNavigationActions();

  const handleLoginSuccess = useCallback((isFirstTime: boolean, onboardingCompleted: boolean) => {
    if (isFirstTime || !onboardingCompleted) {
      navigateToOnboarding();
    } else {
      navigateToApp();
    }
  }, [navigateToOnboarding, navigateToApp]);

  const handleLogout = useCallback(() => {
    navigateToAuth();
  }, [navigateToAuth]);

  const handleOnboardingComplete = useCallback(() => {
    navigateToApp();
  }, [navigateToApp]);

  return {
    handleLoginSuccess,
    handleLogout,
    handleOnboardingComplete,
  };
}

/**
 * Deep linking utilities
 */
export class DeepLinkingUtils {
  /**
   * Extract parameters from deep link URL
   */
  static extractParams(url: string): Record<string, string> {
    const params: Record<string, string> = {};
    const urlParts = url.split('?');
    
    if (urlParts.length > 1) {
      const queryString = urlParts[1];
      const paramPairs = queryString.split('&');
      
      paramPairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value) {
          params[decodeURIComponent(key)] = decodeURIComponent(value);
        }
      });
    }
    
    return params;
  }

  /**
   * Build deep link URL with parameters
   */
  static buildDeepLink(path: string, params?: Record<string, string>): string {
    let url = `styleai://${path}`;
    
    if (params && Object.keys(params).length > 0) {
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      url += `?${queryString}`;
    }
    
    return url;
  }

  /**
   * Check if current route matches deep link pattern
   */
  static matchesRoute(currentRoute: string, pattern: string): boolean {
    const currentParts = currentRoute.split('/');
    const patternParts = pattern.split('/');
    
    if (currentParts.length !== patternParts.length) {
      return false;
    }
    
    return patternParts.every((part, index) => {
      if (part.startsWith(':')) {
        // Dynamic parameter, always matches
        return true;
      }
      return part === currentParts[index];
    });
  }
}

/**
 * Navigation state utilities
 */
export class NavigationStateUtils {
  /**
   * Get current route name from navigation state
   */
  static getCurrentRouteName(navigationState: any): string | undefined {
    if (!navigationState || !navigationState.routes) {
      return undefined;
    }

    const route = navigationState.routes[navigationState.index];
    
    if (route.state) {
      return NavigationStateUtils.getCurrentRouteName(route.state);
    }
    
    return route.name;
  }

  /**
   * Get current route params from navigation state
   */
  static getCurrentRouteParams(navigationState: any): any {
    if (!navigationState || !navigationState.routes) {
      return {};
    }

    const route = navigationState.routes[navigationState.index];
    
    if (route.state) {
      return NavigationStateUtils.getCurrentRouteParams(route.state);
    }
    
    return route.params || {};
  }

  /**
   * Check if user is in authentication flow
   */
  static isInAuthFlow(navigationState: any): boolean {
    const routeName = NavigationStateUtils.getCurrentRouteName(navigationState);
    return routeName === ROUTE_NAMES.ROOT.AUTH_STACK;
  }

  /**
   * Check if user is in onboarding flow
   */
  static isInOnboardingFlow(navigationState: any): boolean {
    const routeName = NavigationStateUtils.getCurrentRouteName(navigationState);
    return routeName === ROUTE_NAMES.ROOT.ONBOARDING_STACK;
  }

  /**
   * Check if user is in main app
   */
  static isInMainApp(navigationState: any): boolean {
    const routeName = NavigationStateUtils.getCurrentRouteName(navigationState);
    return routeName === ROUTE_NAMES.ROOT.APP_STACK;
  }
}

/**
 * Screen tracking utilities for analytics
 */
export class ScreenTrackingUtils {
  private static currentScreen: string | null = null;
  private static screenStartTime: number | null = null;

  /**
   * Record screen view for analytics
   */
  static recordScreenView(screenName: string, params?: Record<string, any>) {
    // End previous screen session if exists
    if (this.currentScreen && this.screenStartTime) {
      const duration = Date.now() - this.screenStartTime;
      this.recordScreenEnd(this.currentScreen, duration);
    }

    // Start new screen session
    this.currentScreen = screenName;
    this.screenStartTime = Date.now();

    // TODO: Send to analytics service
    console.log('[Analytics] Screen View:', screenName, params);
  }

  /**
   * Record screen end for analytics
   */
  private static recordScreenEnd(screenName: string, duration: number) {
    // TODO: Send to analytics service
    console.log('[Analytics] Screen End:', screenName, `Duration: ${duration}ms`);
  }

  /**
   * Get current screen name
   */
  static getCurrentScreen(): string | null {
    return this.currentScreen;
  }

  /**
   * Get current screen duration
   */
  static getCurrentScreenDuration(): number | null {
    if (!this.screenStartTime) return null;
    return Date.now() - this.screenStartTime;
  }
}

/**
 * Navigation performance utilities
 */
export class NavigationPerformanceUtils {
  private static navigationStartTime: number | null = null;

  /**
   * Start navigation timing
   */
  static startNavigation() {
    this.navigationStartTime = Date.now();
  }

  /**
   * End navigation timing and log performance
   */
  static endNavigation(targetScreen: string) {
    if (!this.navigationStartTime) return;

    const duration = Date.now() - this.navigationStartTime;
    this.navigationStartTime = null;

    // Log performance metrics
    console.log('[Navigation Performance]', targetScreen, `${duration}ms`);

    // TODO: Send to performance monitoring service
    if (duration > 1000) {
      console.warn('[Navigation Performance] Slow navigation detected:', targetScreen, `${duration}ms`);
    }
  }

  /**
   * Measure navigation performance
   */
  static measureNavigation<T>(
    navigationFunction: () => T,
    targetScreen: string
  ): T {
    this.startNavigation();
    const result = navigationFunction();
    
    // Use setTimeout to measure after navigation completes
    setTimeout(() => {
      this.endNavigation(targetScreen);
    }, 0);
    
    return result;
  }
}

/**
 * Navigation accessibility utilities
 */
export class NavigationAccessibilityUtils {
  /**
   * Generate accessibility label for navigation buttons
   */
  static getNavigationButtonLabel(
    action: string,
    destination: string,
    isDisabled: boolean = false
  ): string {
    if (isDisabled) {
      return `${action} to ${destination}, disabled`;
    }
    return `${action} to ${destination}`;
  }

  /**
   * Generate accessibility hint for navigation buttons
   */
  static getNavigationButtonHint(destination: string): string {
    return `Double tap to navigate to ${destination}`;
  }

  /**
   * Generate screen announcement for screen readers
   */
  static getScreenAnnouncement(screenName: string, context?: string): string {
    if (context) {
      return `${screenName} screen, ${context}`;
    }
    return `${screenName} screen`;
  }
}