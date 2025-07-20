import React, { useCallback, useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { OnboardingStackParamList, ROUTE_NAMES } from './types';
import { useScreenTracking, useBackHandler } from './hooks';
import { useAppStore } from '@/store/store';

// Import screens - Using enhanced versions with animations
import { 
  EnhancedWelcomeScreen,
  ProfileSetupScreen,
  EnhancedStylePreferencesScreen,
  EnhancedPermissionsScreen,
  CompletionScreen,
  // Original screens as fallback
  WelcomeScreen as OnboardingWelcomeScreen,
  PersonalInfoScreen,
  StylePreferencesScreen,
  PermissionsScreen,
  CompleteScreen as OnboardingCompleteScreen
} from '@/screens/onboarding';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

/**
 * Onboarding Stack Navigator
 * Handles the first-time user experience flow
 */
export function OnboardingStack() {
  const { setOnboardingCompleted } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  
  useScreenTracking();

  // Define onboarding steps
  const onboardingSteps = [
    ROUTE_NAMES.ONBOARDING.WELCOME,
    ROUTE_NAMES.ONBOARDING.PERSONAL_INFO,
    ROUTE_NAMES.ONBOARDING.STYLE_PREFERENCES,
    ROUTE_NAMES.ONBOARDING.PERMISSIONS,
    ROUTE_NAMES.ONBOARDING.COMPLETE,
  ];

  // Custom back handler for onboarding
  const handleBackPress = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      return true; // Prevent default back action
    }
    return false; // Allow default back action (exit app)
  }, [currentStep]);

  useBackHandler(handleBackPress);

  // Handle onboarding completion
  const handleOnboardingComplete = useCallback(() => {
    setOnboardingCompleted(true);
  }, [setOnboardingCompleted]);

  // Track current onboarding step
  useEffect(() => {
    console.log(`Onboarding step: ${currentStep + 1}/${onboardingSteps.length}`);
  }, [currentStep, onboardingSteps.length]);

  return (
    <Stack.Navigator
      initialRouteName={ROUTE_NAMES.ONBOARDING.WELCOME}
      screenOptions={{
        headerShown: false,
        presentation: 'card',
        animationTypeForReplace: 'push',
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name={ROUTE_NAMES.ONBOARDING.WELCOME}
        component={EnhancedWelcomeScreen}
        options={{
          gestureEnabled: false, // Disable gesture for first screen
          animationTypeForReplace: 'pop',
        }}
        listeners={{
          focus: () => setCurrentStep(0),
        }}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.ONBOARDING.PERSONAL_INFO}
        component={ProfileSetupScreen}
        options={{
          animation: 'slide_from_right',
        }}
        listeners={{
          focus: () => setCurrentStep(1),
        }}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.ONBOARDING.STYLE_PREFERENCES}
        component={EnhancedStylePreferencesScreen}
        options={{
          animation: 'slide_from_right',
        }}
        listeners={{
          focus: () => setCurrentStep(2),
        }}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.ONBOARDING.PERMISSIONS}
        component={EnhancedPermissionsScreen}
        options={{
          animation: 'slide_from_right',
        }}
        listeners={{
          focus: () => setCurrentStep(3),
        }}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.ONBOARDING.COMPLETE}
        component={CompletionScreen}
        options={{
          gestureEnabled: false, // Disable gesture for completion screen
          animation: 'slide_from_right',
        }}
        listeners={{
          focus: () => setCurrentStep(4),
        }}
      />
    </Stack.Navigator>
  );
}

/**
 * Enhanced Onboarding Stack with Progress Tracking
 * Includes progress indicators and advanced navigation features
 */
export function EnhancedOnboardingStack() {
  const { setOnboardingCompleted, showNotification } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useScreenTracking();

  // Define onboarding steps with metadata
  const onboardingSteps = [
    {
      key: ROUTE_NAMES.ONBOARDING.WELCOME,
      title: 'Welcome to StyleAI',
      description: 'Your personal AI styling assistant',
      progress: 0,
    },
    {
      key: ROUTE_NAMES.ONBOARDING.PERSONAL_INFO,
      title: 'Personal Information',
      description: 'Tell us about yourself',
      progress: 0.25,
    },
    {
      key: ROUTE_NAMES.ONBOARDING.STYLE_PREFERENCES,
      title: 'Style Preferences',
      description: 'What\'s your style?',
      progress: 0.5,
    },
    {
      key: ROUTE_NAMES.ONBOARDING.PERMISSIONS,
      title: 'Permissions',
      description: 'Allow access to enhance your experience',
      progress: 0.75,
    },
    {
      key: ROUTE_NAMES.ONBOARDING.COMPLETE,
      title: 'All Set!',
      description: 'Ready to start styling',
      progress: 1,
    },
  ];

  // Custom back handler with step validation
  const handleBackPress = useCallback(() => {
    if (currentStep > 0) {
      // Check if user can go back (based on completed steps)
      const canGoBack = completedSteps.has(currentStep - 1);
      
      if (canGoBack) {
        setCurrentStep(prev => prev - 1);
        return true;
      } else {
        // Show notification that they need to complete current step
        showNotification({
          type: 'warning',
          title: 'Complete Current Step',
          message: 'Please complete the current step before going back.',
        });
        return true;
      }
    }
    return false;
  }, [currentStep, completedSteps, showNotification]);

  useBackHandler(handleBackPress);

  // Mark step as completed
  const markStepComplete = useCallback((stepIndex: number) => {
    setCompletedSteps(prev => new Set(prev).add(stepIndex));
  }, []);

  // Handle onboarding completion
  const handleOnboardingComplete = useCallback(() => {
    setOnboardingCompleted(true);
    showNotification({
      type: 'success',
      title: 'Welcome to StyleAI!',
      message: 'Your setup is complete. Let\'s start styling!',
    });
  }, [setOnboardingCompleted, showNotification]);

  // Create screen options with progress tracking
  const createScreenOptions = useCallback((stepIndex: number) => ({
    headerShown: false,
    presentation: 'card' as const,
    animationTypeForReplace: 'push' as const,
    gestureEnabled: stepIndex > 0,
    fullScreenGestureEnabled: true,
    animation: 'slide_from_right' as const,
  }), []);

  // Create screen listeners with step tracking
  const createScreenListeners = useCallback((stepIndex: number) => ({
    focus: () => setCurrentStep(stepIndex),
    beforeRemove: (e: any) => {
      // Prevent going back if step is not completed
      if (stepIndex > 0 && !completedSteps.has(stepIndex - 1)) {
        e.preventDefault();
        showNotification({
          type: 'warning',
          title: 'Complete Current Step',
          message: 'Please complete the current step before navigating.',
        });
      }
    },
  }), [completedSteps, showNotification]);

  return (
    <Stack.Navigator
      initialRouteName={ROUTE_NAMES.ONBOARDING.WELCOME}
      screenOptions={{
        headerShown: false,
        presentation: 'card',
        animationTypeForReplace: 'push',
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name={ROUTE_NAMES.ONBOARDING.WELCOME}
        component={EnhancedWelcomeScreen}
        options={createScreenOptions(0)}
        listeners={createScreenListeners(0)}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.ONBOARDING.PERSONAL_INFO}
        component={ProfileSetupScreen}
        options={createScreenOptions(1)}
        listeners={createScreenListeners(1)}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.ONBOARDING.STYLE_PREFERENCES}
        component={EnhancedStylePreferencesScreen}
        options={createScreenOptions(2)}
        listeners={createScreenListeners(2)}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.ONBOARDING.PERMISSIONS}
        component={EnhancedPermissionsScreen}
        options={createScreenOptions(3)}
        listeners={createScreenListeners(3)}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.ONBOARDING.COMPLETE}
        component={CompletionScreen}
        options={{
          ...createScreenOptions(4),
          gestureEnabled: false,
        }}
        listeners={createScreenListeners(4)}
      />
    </Stack.Navigator>
  );
}

export default OnboardingStack;