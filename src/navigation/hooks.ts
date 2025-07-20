import { useCallback, useEffect, useRef } from 'react';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';

import { useAppStore } from '@/store/store';
import { 
  useAuthFlow,
  useNavigationActions,
} from './utils';

/**
 * Hook to handle back button behavior
 */
export function useBackHandler(onBackPress?: () => boolean) {
  const navigation = useNavigation();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (onBackPress) {
        return onBackPress();
      }

      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }

      return false;
    });

    return () => backHandler.remove();
  }, [navigation, onBackPress]);
}

/**
 * Hook to track screen views for analytics
 */
export function useScreenTracking() {
  const route = useRoute();
  const params = route.params;

  useFocusEffect(
    useCallback(() => {
      console.log('Screen tracked:', route.name, params);
    }, [route.name, params])
  );
}

/**
 * Hook to measure navigation performance
 */
export function useNavigationPerformance() {
  const navigation = useNavigation();

  useEffect(() => {
    console.log('Navigation performance monitoring enabled');
    return () => {
      console.log('Navigation performance monitoring cleaned up');
    };
  }, [navigation]);
}

/**
 * Hook to handle authentication-aware navigation
 */
export function useAuthAwareNavigation() {
  const { auth, app } = useAppStore();
  const { handleLoginSuccess, handleLogout, handleOnboardingComplete } = useAuthFlow();
  const { navigateToAuth, navigateToOnboarding, navigateToApp } = useNavigationActions();

  const determineInitialRoute = useCallback(() => {
    if (!auth.isAuthenticated) {
      return 'AuthStack';
    }
    
    if (app.isFirstLaunch || !app.onboardingCompleted) {
      return 'OnboardingStack';
    }
    
    return 'AppStack';
  }, [auth.isAuthenticated, app.isFirstLaunch, app.onboardingCompleted]);

  const handleAuthStateChange = useCallback((isAuthenticated: boolean) => {
    if (isAuthenticated) {
      handleLoginSuccess(app.isFirstLaunch, app.onboardingCompleted);
    } else {
      handleLogout();
    }
  }, [handleLoginSuccess, handleLogout, app.isFirstLaunch, app.onboardingCompleted]);

  const handleOnboardingStateChange = useCallback((completed: boolean) => {
    if (completed && auth.isAuthenticated) {
      handleOnboardingComplete();
    }
  }, [handleOnboardingComplete, auth.isAuthenticated]);

  return {
    determineInitialRoute,
    handleAuthStateChange,
    handleOnboardingStateChange,
  };
}

/**
 * Hook to handle deep link navigation
 */
export function useDeepLinkNavigation() {
  const navigation = useNavigation();
  const { auth, app } = useAppStore();

  const handleDeepLink = useCallback((url: string) => {
    // Parse the URL and extract route information
    const urlParts = url.replace(/^styleai:\/\//, '').split('/');
    const mainRoute = urlParts[0];

    switch (mainRoute) {
      case 'login':
        if (!auth.isAuthenticated) {
          navigation.navigate('AuthStack');
        }
        break;
      
      case 'onboarding':
        if (auth.isAuthenticated && (!app.onboardingCompleted || app.isFirstLaunch)) {
          navigation.navigate('OnboardingStack');
        }
        break;
      
      case 'home':
        if (auth.isAuthenticated && app.onboardingCompleted) {
          navigation.navigate('AppStack');
        }
        break;
      
      case 'wardrobe':
        if (auth.isAuthenticated && app.onboardingCompleted) {
          navigation.navigate('AppStack', { screen: 'WardrobeStack' });
        }
        break;
      
      case 'styling':
        if (auth.isAuthenticated && app.onboardingCompleted) {
          navigation.navigate('AppStack', { screen: 'StylingStack' });
        }
        break;
      
      case 'profile':
        if (auth.isAuthenticated && app.onboardingCompleted) {
          navigation.navigate('AppStack', { screen: 'ProfileStack' });
        }
        break;
      
      default:
        // Handle unknown deep links
        console.warn('Unknown deep link:', url);
    }
  }, [navigation, auth.isAuthenticated, app.onboardingCompleted, app.isFirstLaunch]);

  return { handleDeepLink };
}

/**
 * Hook to handle navigation state changes
 */
export function useNavigationStateHandler() {
  const navigation = useNavigation();
  const { recordInteraction } = useAppStore();

  const handleNavigationStateChange = useCallback((state: any) => {
    // Record user interaction
    recordInteraction();
    
    console.log('Navigation state changed:', state);
  }, [recordInteraction]);

  return { handleNavigationStateChange };
}

/**
 * Hook to handle tab bar visibility
 */
export function useTabBarVisibility() {
  const navigation = useNavigation();
  const route = useRoute();

  const hideTabBar = useCallback(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' },
    });
  }, [navigation]);

  const showTabBar = useCallback(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: {
        display: 'flex',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 0.5,
        borderTopColor: '#E5E5E7',
        paddingTop: 8,
        paddingBottom: 8,
        height: 80,
      },
    });
  }, [navigation]);

  const setTabBarVisibility = useCallback((visible: boolean) => {
    if (visible) {
      showTabBar();
    } else {
      hideTabBar();
    }
  }, [showTabBar, hideTabBar]);

  return {
    hideTabBar,
    showTabBar,
    setTabBarVisibility,
  };
}

/**
 * Hook to handle keyboard-aware navigation
 */
export function useKeyboardAwareNavigation() {
  const navigation = useNavigation();
  const { setTabBarVisibility } = useTabBarVisibility();

  useEffect(() => {
    const keyboardDidShowListener = () => {
      setTabBarVisibility(false);
    };

    const keyboardDidHideListener = () => {
      setTabBarVisibility(true);
    };

    // Note: In a real app, you would use KeyboardAvoidingView or similar
    // This is a simplified example
    console.log('Keyboard navigation listeners set up');

    return () => {
      console.log('Keyboard navigation listeners cleaned up');
    };
  }, [setTabBarVisibility]);
}

/**
 * Hook to handle offline navigation
 */
export function useOfflineNavigation() {
  const { app } = useAppStore();
  const navigation = useNavigation();

  const handleOfflineNavigation = useCallback((routeName: string) => {
    if (!app.isOnline) {
      // Show offline message or navigate to offline screen
      console.warn('Attempted navigation while offline:', routeName);
      return false;
    }
    return true;
  }, [app.isOnline]);

  const navigateIfOnline = useCallback((routeName: string, params?: any) => {
    if (handleOfflineNavigation(routeName)) {
      (navigation as any).navigate(routeName, params);
    }
  }, [navigation, handleOfflineNavigation]);

  return {
    handleOfflineNavigation,
    navigateIfOnline,
  };
}

/**
 * Hook to handle navigation confirmation
 */
export function useNavigationConfirmation() {
  const navigation = useNavigation();

  const confirmNavigation = useCallback((
    routeName: string,
    params?: any,
    confirmationMessage?: string
  ) => {
    if (confirmationMessage) {
      // In a real app, you might use a modal or alert
      const confirmed = confirm(confirmationMessage);
      if (confirmed) {
        (navigation as any).navigate(routeName, params);
      }
    } else {
      (navigation as any).navigate(routeName, params);
    }
  }, [navigation]);

  return { confirmNavigation };
}

/**
 * Hook to handle navigation with loading states
 */
export function useNavigationWithLoading() {
  const navigation = useNavigation();
  const { setLoading } = useAppStore();

  const navigateWithLoading = useCallback(async (
    routeName: string,
    params?: any,
    loadingKey: string = 'global'
  ) => {
    setLoading(loadingKey as any, true);
    
    try {
      // Simulate async operation or actual loading
      await new Promise(resolve => setTimeout(resolve, 100));
      (navigation as any).navigate(routeName, params);
    } finally {
      setLoading(loadingKey as any, false);
    }
  }, [navigation, setLoading]);

  return { navigateWithLoading };
}

/**
 * Hook to handle navigation with error boundaries
 */
export function useNavigationWithErrorBoundary() {
  const navigation = useNavigation();
  const { showNotification } = useAppStore();

  const safeNavigate = useCallback((routeName: string, params?: any) => {
    try {
      (navigation as any).navigate(routeName, params);
    } catch (error) {
      console.error('Navigation error:', error);
      showNotification({
        type: 'error',
        title: 'Navigation Error',
        message: 'Unable to navigate to the requested screen',
      });
    }
  }, [navigation, showNotification]);

  return { safeNavigate };
}

/**
 * Hook to handle navigation breadcrumbs
 */
export function useNavigationBreadcrumbs() {
  const navigation = useNavigation();
  const breadcrumbs = useRef<string[]>([]);

  const addBreadcrumb = useCallback((routeName: string) => {
    breadcrumbs.current.push(routeName);
    // Keep only last 10 breadcrumbs
    if (breadcrumbs.current.length > 10) {
      breadcrumbs.current = breadcrumbs.current.slice(-10);
    }
  }, []);

  const getBreadcrumbs = useCallback(() => {
    return [...breadcrumbs.current];
  }, []);

  const clearBreadcrumbs = useCallback(() => {
    breadcrumbs.current = [];
  }, []);

  useFocusEffect(
    useCallback(() => {
      const route = navigation.getState().routes[navigation.getState().index];
      addBreadcrumb(route.name);
    }, [navigation, addBreadcrumb])
  );

  return {
    getBreadcrumbs,
    clearBreadcrumbs,
  };
}