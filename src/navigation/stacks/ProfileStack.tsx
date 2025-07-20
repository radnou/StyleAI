import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ProfileStackParamList, ROUTE_NAMES } from '../types';
import { useScreenTracking } from '../hooks';

// Import screens
import { 
  ProfileScreen,
  EditProfileScreen,
  PreferencesScreen,
  BillingScreen,
  BillingHistoryScreen,
  SubscriptionScreen,
  SecurityScreen,
  PrivacyScreen,
  SupportScreen,
  AboutScreen
} from '@/screens/app/profile';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

/**
 * Profile Stack Navigator
 * Contains all profile and user-related screens
 */
export function ProfileStack() {
  useScreenTracking();

  return (
    <Stack.Navigator
      initialRouteName={ROUTE_NAMES.PROFILE.PROFILE}
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
        name={ROUTE_NAMES.PROFILE.PROFILE}
        component={ProfileScreen}
        options={{
          gestureEnabled: false, // Disable gesture for main profile screen
        }}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.PROFILE.EDIT_PROFILE}
        component={EditProfileScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.PROFILE.PREFERENCES}
        component={PreferencesScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.PROFILE.BILLING}
        component={BillingScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.PROFILE.BILLING_HISTORY}
        component={BillingHistoryScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.PROFILE.SUBSCRIPTION}
        component={SubscriptionScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.PROFILE.SECURITY}
        component={SecurityScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.PROFILE.PRIVACY}
        component={PrivacyScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.PROFILE.SUPPORT}
        component={SupportScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.PROFILE.ABOUT}
        component={AboutScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}

export default ProfileStack;