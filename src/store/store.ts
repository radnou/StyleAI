import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { immer } from 'zustand/middleware/immer';

// Import store slices
import { AuthSlice, createAuthSlice } from './stores/authStore';
import { UserSlice, createUserSlice } from './stores/userStore';
import { WardrobeSlice, createWardrobeSlice } from './stores/wardrobeStore';
import { StyleSlice, createStyleSlice } from './stores/styleStore';
import { AppSlice, createAppSlice } from './stores/appStore';
import { OnboardingSlice, createOnboardingSlice } from './stores/onboardingStore';

/**
 * Combined application state
 */
export interface AppState extends 
  AuthSlice, 
  UserSlice, 
  WardrobeSlice, 
  StyleSlice, 
  AppSlice,
  OnboardingSlice {}

/**
 * Root store with all slices combined
 */
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((...args) => ({
        ...createAuthSlice(...args),
        ...createUserSlice(...args),
        ...createWardrobeSlice(...args),
        ...createStyleSlice(...args),
        ...createAppSlice(...args),
        ...createOnboardingSlice(...args),
      })),
      {
        name: 'styleai-store',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({
          // Only persist certain parts of the state
          auth: {
            isAuthenticated: state.auth.isAuthenticated,
            user: state.auth.user,
          },
          user: {
            profile: state.user.profile,
            preferences: state.user.preferences,
          },
          app: {
            theme: state.app.theme,
            onboardingCompleted: state.app.onboardingCompleted,
          },
          onboarding: {
            isCompleted: state.onboarding.isCompleted,
            currentStepIndex: state.onboarding.currentStepIndex,
            completedSteps: Array.from(state.onboarding.completedSteps),
            skippedSteps: Array.from(state.onboarding.skippedSteps),
            personalInfo: state.onboarding.personalInfo,
            stylePreferences: state.onboarding.stylePreferences,
            permissions: state.onboarding.permissions,
            tutorialProgress: state.onboarding.tutorialProgress,
          },
        }),
        version: 1,
        migrate: (persistedState: any, version: number) => {
          // Handle state migrations when the version changes
          if (version === 0) {
            // Migration from version 0 to 1
            return persistedState;
          }
          return persistedState;
        },
      }
    ),
    {
      name: 'StyleAI Store',
      enabled: __DEV__,
    }
  )
);

/**
 * Typed selectors for better performance
 */
export const useAuth = () => useAppStore(state => state.auth);
export const useUser = () => useAppStore(state => state.user);
export const useWardrobe = () => useAppStore(state => state.wardrobe);
export const useStyle = () => useAppStore(state => state.style);
export const useApp = () => useAppStore(state => state.app);
export const useOnboarding = () => useAppStore(state => state.onboarding);

/**
 * Actions selectors
 */
export const useAuthActions = () => useAppStore(state => ({
  login: state.login,
  logout: state.logout,
  register: state.register,
  updateAuthProfile: state.updateAuthProfile,
  updateAuthState: state.updateAuthState,
}));

export const useUserActions = () => useAppStore(state => ({
  updateProfile: state.updateProfile,
  updatePreferences: state.updatePreferences,
  setUser: state.setUser,
}));

export const useWardrobeActions = () => useAppStore(state => ({
  addItem: state.addWardrobeItem,
  updateItem: state.updateWardrobeItem,
  removeItem: state.removeWardrobeItem,
  setWardrobe: state.setWardrobe,
}));

export const useStyleActions = () => useAppStore(state => ({
  addAnalysis: state.addStyleAnalysis,
  setAnalyses: state.setStyleAnalyses,
  updateAnalysis: state.updateStyleAnalysis,
}));

export const useAppActions = () => useAppStore(state => ({
  setTheme: state.setTheme,
  setLoading: state.setLoading,
  setOnboardingCompleted: state.setOnboardingCompleted,
  showNotification: state.showNotification,
  hideNotification: state.hideNotification,
}));

export const useOnboardingActions = () => useAppStore(state => ({
  startOnboarding: state.startOnboarding,
  completeOnboarding: state.completeOnboarding,
  resetOnboarding: state.resetOnboarding,
  goToStep: state.goToStep,
  nextStep: state.nextStep,
  previousStep: state.previousStep,
  skipStep: state.skipStep,
  completeStep: state.completeStep,
  updateStepData: state.updateStepData,
  isStepCompleted: state.isStepCompleted,
  isStepSkipped: state.isStepSkipped,
  canProceedToNext: state.canProceedToNext,
  canGoBack: state.canGoBack,
  updatePersonalInfo: state.updatePersonalInfo,
  updateStylePreferences: state.updateStylePreferences,
  updatePermissions: state.updatePermissions,
  updateTutorialProgress: state.updateTutorialProgress,
  requestCameraPermission: state.requestCameraPermission,
  requestPhotosPermission: state.requestPhotosPermission,
  requestNotificationsPermission: state.requestNotificationsPermission,
  getProgress: state.getProgress,
  getCurrentStep: state.getCurrentStep,
  exportOnboardingData: state.exportOnboardingData,
  importOnboardingData: state.importOnboardingData,
  trackStepStarted: state.trackStepStarted,
  trackStepCompleted: state.trackStepCompleted,
  trackStepSkipped: state.trackStepSkipped,
}));

/**
 * Reset store (useful for logout)
 */
export const resetStore = () => {
  useAppStore.setState((state) => {
    // Reset all slices to initial state
    Object.assign(state, {
      ...createAuthSlice(useAppStore.setState, useAppStore.getState, useAppStore),
      ...createUserSlice(useAppStore.setState, useAppStore.getState, useAppStore),
      ...createWardrobeSlice(useAppStore.setState, useAppStore.getState, useAppStore),
      ...createStyleSlice(useAppStore.setState, useAppStore.getState, useAppStore),
      ...createAppSlice(useAppStore.setState, useAppStore.getState, useAppStore),
      ...createOnboardingSlice(useAppStore.setState, useAppStore.getState, useAppStore),
    });
  });
};