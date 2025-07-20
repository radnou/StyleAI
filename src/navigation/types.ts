import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';

/**
 * Root Stack Parameter List
 * This represents the main app navigation structure
 */
export type RootStackParamList = {
  AuthStack: undefined;
  OnboardingStack: undefined;
  AppStack: undefined;
};

/**
 * Authentication Stack Parameter List
 * Contains all authentication-related screens
 */
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  EmailVerification: { email: string };
};

/**
 * Onboarding Stack Parameter List
 * Contains all onboarding screens for first-time users
 */
export type OnboardingStackParamList = {
  Welcome: undefined;
  PersonalInfo: undefined;
  StylePreferences: undefined;
  Permissions: undefined;
  Complete: undefined;
};

/**
 * App Stack Parameter List (Bottom Tab Navigator)
 * Contains the main app screens accessible via bottom tabs
 */
export type AppStackParamList = {
  HomeStack: undefined;
  WardrobeStack: undefined;
  StylingStack: undefined;
  ProfileStack: undefined;
};

/**
 * Home Stack Parameter List
 * Contains all home-related screens
 */
export type HomeStackParamList = {
  Home: undefined;
  Analytics: undefined;
  Notifications: undefined;
  Settings: undefined;
};

/**
 * Wardrobe Stack Parameter List
 * Contains all wardrobe-related screens
 */
export type WardrobeStackParamList = {
  Wardrobe: undefined;
  AddItem: undefined;
  ItemDetail: { itemId: string };
  EditItem: { itemId: string };
  Categories: undefined;
  CategoryDetail: { categoryId: string };
  Search: undefined;
  Filters: undefined;
};

/**
 * Styling Stack Parameter List
 * Contains all AI styling-related screens
 */
export type StylingStackParamList = {
  Styling: undefined;
  StylingChat: undefined;
  StylingResult: { sessionId: string };
  StylingHistory: undefined;
  StylingPreferences: undefined;
  StyleAnalysis: { itemId?: string };
  OutfitSuggestions: undefined;
  OutfitDetail: { outfitId: string };
};

/**
 * Profile Stack Parameter List
 * Contains all profile and user-related screens
 */
export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Preferences: undefined;
  Billing: undefined;
  BillingHistory: undefined;
  Subscription: undefined;
  Security: undefined;
  Privacy: undefined;
  Support: undefined;
  About: undefined;
};

/**
 * Screen Props Type Definitions
 * These provide type-safe navigation props for each screen
 */

// Root Stack Screen Props
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

// Auth Stack Screen Props
export type AuthStackScreenProps<T extends keyof AuthStackParamList> = 
  NativeStackScreenProps<AuthStackParamList, T>;

// Onboarding Stack Screen Props
export type OnboardingStackScreenProps<T extends keyof OnboardingStackParamList> = 
  NativeStackScreenProps<OnboardingStackParamList, T>;

// App Stack Screen Props (Bottom Tab)
export type AppStackScreenProps<T extends keyof AppStackParamList> = 
  BottomTabScreenProps<AppStackParamList, T>;

// Home Stack Screen Props
export type HomeStackScreenProps<T extends keyof HomeStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<HomeStackParamList, T>,
    AppStackScreenProps<'HomeStack'>
  >;

// Wardrobe Stack Screen Props
export type WardrobeStackScreenProps<T extends keyof WardrobeStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<WardrobeStackParamList, T>,
    AppStackScreenProps<'WardrobeStack'>
  >;

// Styling Stack Screen Props
export type StylingStackScreenProps<T extends keyof StylingStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<StylingStackParamList, T>,
    AppStackScreenProps<'StylingStack'>
  >;

// Profile Stack Screen Props
export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<ProfileStackParamList, T>,
    AppStackScreenProps<'ProfileStack'>
  >;

/**
 * Global Navigation Props
 * Used for components that need access to navigation but aren't screens
 */
export type NavigationProps = 
  | RootStackScreenProps<keyof RootStackParamList>
  | AuthStackScreenProps<keyof AuthStackParamList>
  | OnboardingStackScreenProps<keyof OnboardingStackParamList>
  | AppStackScreenProps<keyof AppStackParamList>
  | HomeStackScreenProps<keyof HomeStackParamList>
  | WardrobeStackScreenProps<keyof WardrobeStackParamList>
  | StylingStackScreenProps<keyof StylingStackParamList>
  | ProfileStackScreenProps<keyof ProfileStackParamList>;

/**
 * Navigation Route Names
 * Useful for type-safe navigation references
 */
export const ROUTE_NAMES = {
  // Root Stack
  ROOT: {
    AUTH_STACK: 'AuthStack' as const,
    ONBOARDING_STACK: 'OnboardingStack' as const,
    APP_STACK: 'AppStack' as const,
  },
  
  // Auth Stack
  AUTH: {
    WELCOME: 'Welcome' as const,
    LOGIN: 'Login' as const,
    REGISTER: 'Register' as const,
    FORGOT_PASSWORD: 'ForgotPassword' as const,
    RESET_PASSWORD: 'ResetPassword' as const,
    EMAIL_VERIFICATION: 'EmailVerification' as const,
  },
  
  // Onboarding Stack
  ONBOARDING: {
    WELCOME: 'Welcome' as const,
    PERSONAL_INFO: 'PersonalInfo' as const,
    STYLE_PREFERENCES: 'StylePreferences' as const,
    PERMISSIONS: 'Permissions' as const,
    COMPLETE: 'Complete' as const,
  },
  
  // App Stack (Bottom Tabs)
  APP: {
    HOME_STACK: 'HomeStack' as const,
    WARDROBE_STACK: 'WardrobeStack' as const,
    STYLING_STACK: 'StylingStack' as const,
    PROFILE_STACK: 'ProfileStack' as const,
  },
  
  // Home Stack
  HOME: {
    HOME: 'Home' as const,
    ANALYTICS: 'Analytics' as const,
    NOTIFICATIONS: 'Notifications' as const,
    SETTINGS: 'Settings' as const,
  },
  
  // Wardrobe Stack
  WARDROBE: {
    WARDROBE: 'Wardrobe' as const,
    ADD_ITEM: 'AddItem' as const,
    ITEM_DETAIL: 'ItemDetail' as const,
    EDIT_ITEM: 'EditItem' as const,
    CATEGORIES: 'Categories' as const,
    CATEGORY_DETAIL: 'CategoryDetail' as const,
    SEARCH: 'Search' as const,
    FILTERS: 'Filters' as const,
  },
  
  // Styling Stack
  STYLING: {
    STYLING: 'Styling' as const,
    STYLING_CHAT: 'StylingChat' as const,
    STYLING_RESULT: 'StylingResult' as const,
    STYLING_HISTORY: 'StylingHistory' as const,
    STYLING_PREFERENCES: 'StylingPreferences' as const,
    STYLE_ANALYSIS: 'StyleAnalysis' as const,
    OUTFIT_SUGGESTIONS: 'OutfitSuggestions' as const,
    OUTFIT_DETAIL: 'OutfitDetail' as const,
  },
  
  // Profile Stack
  PROFILE: {
    PROFILE: 'Profile' as const,
    EDIT_PROFILE: 'EditProfile' as const,
    PREFERENCES: 'Preferences' as const,
    BILLING: 'Billing' as const,
    BILLING_HISTORY: 'BillingHistory' as const,
    SUBSCRIPTION: 'Subscription' as const,
    SECURITY: 'Security' as const,
    PRIVACY: 'Privacy' as const,
    SUPPORT: 'Support' as const,
    ABOUT: 'About' as const,
  },
} as const;

/**
 * Navigation Configuration
 * Global navigation settings and options
 */
export const NAVIGATION_CONFIG = {
  // Screen transition animations
  SCREEN_OPTIONS: {
    headerShown: false,
    presentation: 'modal' as const,
    animationTypeForReplace: 'push' as const,
  },
  
  // Tab bar configuration
  TAB_BAR_OPTIONS: {
    activeTintColor: '#007AFF',
    inactiveTintColor: '#8E8E93',
    showLabel: true,
    labelStyle: {
      fontSize: 12,
      fontWeight: '600' as const,
    },
    style: {
      backgroundColor: '#FFFFFF',
      borderTopWidth: 0.5,
      borderTopColor: '#E5E5E7',
      paddingTop: 8,
      paddingBottom: 8,
      height: 80,
    },
  },
  
  // Deep linking configuration
  DEEP_LINKING: {
    prefixes: ['styleai://', 'https://styleai.app'] as string[],
    config: {
      screens: {
        AuthStack: {
          screens: {
            Login: 'login',
            Register: 'register',
            ForgotPassword: 'forgot-password',
            ResetPassword: 'reset-password/:token',
            EmailVerification: 'verify-email/:email',
          },
        },
        OnboardingStack: {
          screens: {
            Welcome: 'onboarding/welcome',
            PersonalInfo: 'onboarding/personal-info',
            StylePreferences: 'onboarding/style-preferences',
            Permissions: 'onboarding/permissions',
            Complete: 'onboarding/complete',
          },
        },
        AppStack: {
          screens: {
            HomeStack: {
              screens: {
                Home: 'home',
                Analytics: 'analytics',
                Notifications: 'notifications',
                Settings: 'settings',
              },
            },
            WardrobeStack: {
              screens: {
                Wardrobe: 'wardrobe',
                AddItem: 'wardrobe/add-item',
                ItemDetail: 'wardrobe/item/:itemId',
                EditItem: 'wardrobe/edit/:itemId',
                Categories: 'wardrobe/categories',
                CategoryDetail: 'wardrobe/category/:categoryId',
                Search: 'wardrobe/search',
                Filters: 'wardrobe/filters',
              },
            },
            StylingStack: {
              screens: {
                Styling: 'styling',
                StylingChat: 'styling/chat',
                StylingResult: 'styling/result/:sessionId',
                StylingHistory: 'styling/history',
                StylingPreferences: 'styling/preferences',
                StyleAnalysis: 'styling/analysis',
                OutfitSuggestions: 'styling/outfits',
                OutfitDetail: 'styling/outfit/:outfitId',
              },
            },
            ProfileStack: {
              screens: {
                Profile: 'profile',
                EditProfile: 'profile/edit',
                Preferences: 'profile/preferences',
                Billing: 'profile/billing',
                BillingHistory: 'profile/billing/history',
                Subscription: 'profile/subscription',
                Security: 'profile/security',
                Privacy: 'profile/privacy',
                Support: 'profile/support',
                About: 'profile/about',
              },
            },
          },
        },
      },
    },
  },
} as const;

/**
 * Type declarations for React Navigation
 * This enables type-safe navigation throughout the app
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}