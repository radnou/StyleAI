import { StateCreator } from 'zustand';

/**
 * App theme
 */
export type AppTheme = 'light' | 'dark' | 'system';

/**
 * Notification types
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * In-app notification
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // in milliseconds
  action?: {
    label: string;
    onPress: () => void;
  };
  createdAt: Date;
}

/**
 * Loading states for different operations
 */
export interface LoadingStates {
  global: boolean;
  auth: boolean;
  profile: boolean;
  wardrobe: boolean;
  analysis: boolean;
  upload: boolean;
}

/**
 * App state
 */
export interface AppState {
  // Theme and appearance
  theme: AppTheme;
  
  // Loading states
  loading: LoadingStates;
  
  // Notifications
  notifications: Notification[];
  
  // Onboarding and first-time user experience
  onboardingCompleted: boolean;
  isFirstLaunch: boolean;
  
  // Network status
  isOnline: boolean;
  
  // App version and updates
  version: string;
  hasUpdate: boolean;
  
  // Feature flags
  features: {
    premiumFeatures: boolean;
    betaFeatures: boolean;
    analyticsEnabled: boolean;
  };
  
  // Performance monitoring
  performance: {
    appStartTime: Date | null;
    lastInteraction: Date | null;
  };
}

/**
 * App actions
 */
export interface AppActions {
  // Theme
  setTheme: (theme: AppTheme) => void;
  
  // Loading states
  setLoading: (key: keyof LoadingStates, loading: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;
  
  // Notifications
  showNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  hideNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Onboarding
  setOnboardingCompleted: (completed: boolean) => void;
  setFirstLaunch: (isFirst: boolean) => void;
  
  // Network
  setOnlineStatus: (isOnline: boolean) => void;
  
  // App updates
  setUpdateAvailable: (available: boolean) => void;
  
  // Feature flags
  setFeature: (feature: keyof AppState['features'], enabled: boolean) => void;
  
  // Performance
  recordAppStart: () => void;
  recordInteraction: () => void;
}

/**
 * Complete app slice interface
 */
export interface AppSlice {
  app: AppState;
  setTheme: AppActions['setTheme'];
  setLoading: AppActions['setLoading'];
  setGlobalLoading: AppActions['setGlobalLoading'];
  showNotification: AppActions['showNotification'];
  hideNotification: AppActions['hideNotification'];
  clearAllNotifications: AppActions['clearAllNotifications'];
  setOnboardingCompleted: AppActions['setOnboardingCompleted'];
  setFirstLaunch: AppActions['setFirstLaunch'];
  setOnlineStatus: AppActions['setOnlineStatus'];
  setUpdateAvailable: AppActions['setUpdateAvailable'];
  setFeature: AppActions['setFeature'];
  recordAppStart: AppActions['recordAppStart'];
  recordInteraction: AppActions['recordInteraction'];
}

/**
 * Initial app state
 */
const initialAppState: AppState = {
  theme: 'system',
  loading: {
    global: false,
    auth: false,
    profile: false,
    wardrobe: false,
    analysis: false,
    upload: false,
  },
  notifications: [],
  onboardingCompleted: false,
  isFirstLaunch: true,
  isOnline: true,
  version: '1.0.0',
  hasUpdate: false,
  features: {
    premiumFeatures: false,
    betaFeatures: false,
    analyticsEnabled: true,
  },
  performance: {
    appStartTime: null,
    lastInteraction: null,
  },
};

/**
 * Creates the app store slice
 */
export const createAppSlice: StateCreator<
  any,
  [['zustand/immer', never]],
  [],
  AppSlice
> = (set) => ({
  app: initialAppState,

  setTheme: (theme: AppTheme) => {
    set((state: any) => {
      state.app.theme = theme;
    });
  },

  setLoading: (key: keyof LoadingStates, loading: boolean) => {
    set((state: any) => {
      state.app.loading[key] = loading;
    });
  },

  setGlobalLoading: (loading: boolean) => {
    set((state: any) => {
      state.app.loading.global = loading;
    });
  },

  showNotification: (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    set((state: any) => {
      const notification: Notification = {
        ...notificationData,
        id: Date.now().toString(),
        createdAt: new Date(),
        duration: notificationData.duration || 5000,
      };
      
      state.app.notifications.push(notification);
      
      // Auto-remove notification after duration
      if (notification.duration && notification.duration > 0) {
        setTimeout(() => {
          set((state) => {
            state.app.notifications = state.app.notifications.filter(
              n => n.id !== notification.id
            );
          });
        }, notification.duration);
      }
    });
  },

  hideNotification: (id: string) => {
    set((state: any) => {
      state.app.notifications = state.app.notifications.filter((n: Notification) => n.id !== id);
    });
  },

  clearAllNotifications: () => {
    set((state: any) => {
      state.app.notifications = [];
    });
  },

  setOnboardingCompleted: (completed: boolean) => {
    set((state: any) => {
      state.app.onboardingCompleted = completed;
    });
  },

  setFirstLaunch: (isFirst: boolean) => {
    set((state: any) => {
      state.app.isFirstLaunch = isFirst;
    });
  },

  setOnlineStatus: (isOnline: boolean) => {
    set((state: any) => {
      state.app.isOnline = isOnline;
    });
  },

  setUpdateAvailable: (available: boolean) => {
    set((state: any) => {
      state.app.hasUpdate = available;
    });
  },

  setFeature: (feature: keyof AppState['features'], enabled: boolean) => {
    set((state: any) => {
      state.app.features[feature] = enabled;
    });
  },

  recordAppStart: () => {
    set((state: any) => {
      state.app.performance.appStartTime = new Date();
    });
  },

  recordInteraction: () => {
    set((state: any) => {
      state.app.performance.lastInteraction = new Date();
    });
  },
});