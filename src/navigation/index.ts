// Navigation Types
export * from './types';

// Navigation Utilities and Hooks
export * from './utils';
export * from './hooks';

// Navigation Components
export { SimpleNavigationProvider as NavigationProvider } from './SimpleNavigator';
export { AuthStack } from './AuthStack';
export { OnboardingStack } from './OnboardingStack';
export { AppStack } from './AppStack';

// Stack Components
export { HomeStack } from './stacks/HomeStack';
export { WardrobeStack } from './stacks/WardrobeStack';
export { StylingStack } from './stacks/StylingStack';
export { ProfileStack } from './stacks/ProfileStack';

// Navigation Components
export { TabIcon } from './components/TabIcon';
export { TabLabel } from './components/TabLabel';
export { ErrorBoundary, NavigationErrorBoundary } from './components/ErrorBoundary';
export { LoadingScreen, AuthLoadingScreen, AppLoadingScreen } from './screens/LoadingScreen';

// Default export
export { SimpleNavigationProvider as default } from './SimpleNavigator';