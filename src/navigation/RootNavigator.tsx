import React, { useEffect, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAppStore } from '@/store/store';
import { 
  useAuthAwareNavigation, 
  useNavigationStateHandler, 
  useDeepLinkNavigation,
} from './hooks';
import { RootStackParamList, NAVIGATION_CONFIG } from './types';
import { NavigationStateUtils } from './utils';
import { AuthStack } from './AuthStack';
import { OnboardingStack } from './OnboardingStack';
import { AppStack } from './AppStack';
import { LoadingScreen } from './screens/LoadingScreen';
import { ErrorBoundary } from './components/ErrorBoundary';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root Navigator Component
 * Handles the main navigation structure and authentication flow
 */
export function RootNavigator() {
  const { auth, app, recordAppStart } = useAppStore();
  const { determineInitialRoute } = useAuthAwareNavigation();
  const { handleNavigationStateChange } = useNavigationStateHandler();
  const { handleDeepLink } = useDeepLinkNavigation();

  // Record app start time
  useEffect(() => {
    recordAppStart();
  }, [recordAppStart]);

  // Determine initial route based on auth and onboarding state
  const initialRouteName = useMemo(() => {
    return determineInitialRoute();
  }, [determineInitialRoute]);

  // Show loading screen while checking auth state
  if (auth.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <NavigationContainer
          linking={NAVIGATION_CONFIG.DEEP_LINKING}
          onStateChange={handleNavigationStateChange}
          onReady={() => {
            // Navigation is ready, record initial screen
            console.log('Navigation ready');
          }}
          fallback={<LoadingScreen />}
        >
          <Stack.Navigator
            initialRouteName={initialRouteName}
            screenOptions={{
              headerShown: false,
              presentation: 'card',
              animationTypeForReplace: 'push',
            }}
          >
            <Stack.Screen 
              name="AuthStack" 
              component={AuthStack}
              options={{
                gestureEnabled: false,
                animationTypeForReplace: 'pop',
              }}
            />
            <Stack.Screen 
              name="OnboardingStack" 
              component={OnboardingStack}
              options={{
                gestureEnabled: false,
                animationTypeForReplace: 'push',
              }}
            />
            <Stack.Screen 
              name="AppStack" 
              component={AppStack}
              options={{
                gestureEnabled: false,
                animationTypeForReplace: 'push',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

// Removed AuthAwareNavigationContainer - logic moved inside NavigationProvider

// Navigation performance monitoring removed - can be added back with navigation refs

// Navigation analytics removed - can be added back later

// Auth state listening is handled by navigation state changes

/**
 * Main Navigation Provider
 * Combines all navigation providers and components
 */
export function NavigationProvider() {
  const { auth, app, recordAppStart } = useAppStore();

  // Record app start time
  useEffect(() => {
    recordAppStart();
  }, [recordAppStart]);

  // Determine initial route based on auth and onboarding state
  const initialRouteName = useMemo(() => {
    if (!auth.isAuthenticated) {
      return 'AuthStack';
    }
    
    if (app.isFirstLaunch || !app.onboardingCompleted) {
      return 'OnboardingStack';
    }
    
    return 'AppStack';
  }, [auth.isAuthenticated, app.isFirstLaunch, app.onboardingCompleted]);

  // Show loading screen while checking auth state
  if (auth.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <NavigationContainer
          linking={NAVIGATION_CONFIG.DEEP_LINKING}
          onReady={() => {
            console.log('Navigation ready');
          }}
          fallback={<LoadingScreen />}
        >
          <Stack.Navigator
            initialRouteName={initialRouteName}
            screenOptions={{
              headerShown: false,
              presentation: 'card',
              animationTypeForReplace: 'push',
            }}
          >
            <Stack.Screen 
              name="AuthStack" 
              component={AuthStack}
              options={{
                gestureEnabled: false,
                animationTypeForReplace: 'pop',
              }}
            />
            <Stack.Screen 
              name="OnboardingStack" 
              component={OnboardingStack}
              options={{
                gestureEnabled: false,
                animationTypeForReplace: 'push',
              }}
            />
            <Stack.Screen 
              name="AppStack" 
              component={AppStack}
              options={{
                gestureEnabled: false,
                animationTypeForReplace: 'push',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default RootNavigator;