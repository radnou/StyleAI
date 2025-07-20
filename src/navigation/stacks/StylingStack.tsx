import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { StylingStackParamList, ROUTE_NAMES } from '../types';
import { useScreenTracking } from '../hooks';

// Import screens
import { 
  StylingScreen,
  StylingChatScreen,
  StylingResultScreen,
  StylingHistoryScreen,
  StylingPreferencesScreen,
  StyleAnalysisScreen,
  OutfitSuggestionsScreen,
  OutfitDetailScreen
} from '@/screens/app/styling';

const Stack = createNativeStackNavigator<StylingStackParamList>();

/**
 * Styling Stack Navigator
 * Contains all AI styling-related screens
 */
export function StylingStack() {
  useScreenTracking();

  return (
    <Stack.Navigator
      initialRouteName={ROUTE_NAMES.STYLING.STYLING}
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
        name={ROUTE_NAMES.STYLING.STYLING}
        component={StylingScreen}
        options={{
          gestureEnabled: false, // Disable gesture for main styling screen
        }}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.STYLING.STYLING_CHAT}
        component={StylingChatScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.STYLING.STYLING_RESULT}
        component={StylingResultScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.STYLING.STYLING_HISTORY}
        component={StylingHistoryScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.STYLING.STYLING_PREFERENCES}
        component={StylingPreferencesScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.STYLING.STYLE_ANALYSIS}
        component={StyleAnalysisScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.STYLING.OUTFIT_SUGGESTIONS}
        component={OutfitSuggestionsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      
      <Stack.Screen
        name={ROUTE_NAMES.STYLING.OUTFIT_DETAIL}
        component={OutfitDetailScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}

export default StylingStack;