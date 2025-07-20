import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAppStore } from '@/store/store';
import { RootStackParamList } from './types';
import { AuthStack } from './AuthStack';
import { OnboardingStack } from './OnboardingStack';
import { AppStack } from './AppStack';
import { LoadingScreen } from './screens/LoadingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Simple Navigation Provider without complex hooks
 */
export function SimpleNavigationProvider() {
  const { auth, app } = useAppStore();

  // Show loading screen while checking auth state
  if (auth.isLoading) {
    return <LoadingScreen />;
  }

  // Determine initial route based on auth and onboarding state
  const initialRouteName = !auth.isAuthenticated 
    ? 'AuthStack' 
    : (app.isFirstLaunch || !app.onboardingCompleted) 
      ? 'OnboardingStack' 
      : 'AppStack';

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRouteName}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen 
            name="AuthStack" 
            component={AuthStack}
          />
          <Stack.Screen 
            name="OnboardingStack" 
            component={OnboardingStack}
          />
          <Stack.Screen 
            name="AppStack" 
            component={AppStack}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default SimpleNavigationProvider;