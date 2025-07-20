import { StateCreator } from 'zustand';

/**
 * User profile information
 */
export interface UserProfile {
  displayName: string;
  bio?: string;
  avatar?: string;
  dateOfBirth?: Date;
  location?: string;
  phone?: string;
  isPremium?: boolean;
  hasUnreadNotifications?: boolean;
}

/**
 * Style preferences
 */
export interface StylePreferences {
  favoriteColors?: string[];
  avoidColors?: string[];
  preferredStyles?: string[];
  bodyType?: 'athletic' | 'pear' | 'apple' | 'hourglass' | 'rectangle';
  height?: number; // in cm
  size?: {
    top?: string;
    bottom?: string;
    dress?: string;
    shoes?: string;
  };
  budget?: {
    min?: number;
    max?: number;
    currency?: string;
  };
}

/**
 * User settings
 */
export interface UserSettings {
  notifications: {
    push: boolean;
    email: boolean;
    styleUpdates: boolean;
    promotions: boolean;
  };
  privacy: {
    profileVisible: boolean;
    shareAnalytics: boolean;
  };
  language: string;
  currency: string;
}

/**
 * User state
 */
export interface UserState {
  profile: UserProfile | null;
  preferences: StylePreferences | null;
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
}

/**
 * User actions
 */
export interface UserActions {
  setUser: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updatePreferences: (updates: Partial<StylePreferences>) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  clearUserError: () => void;
}

/**
 * Complete user slice interface
 */
export interface UserSlice {
  user: UserState;
  setUser: UserActions['setUser'];
  updateProfile: UserActions['updateProfile'];
  updatePreferences: UserActions['updatePreferences'];
  updateSettings: UserActions['updateSettings'];
  clearUserError: UserActions['clearUserError'];
}

/**
 * Default user settings
 */
const defaultSettings: UserSettings = {
  notifications: {
    push: true,
    email: true,
    styleUpdates: true,
    promotions: false,
  },
  privacy: {
    profileVisible: false,
    shareAnalytics: true,
  },
  language: 'en',
  currency: 'USD',
};

/**
 * Initial user state
 */
const initialUserState: UserState = {
  profile: null,
  preferences: null,
  settings: defaultSettings,
  isLoading: false,
  error: null,
};

/**
 * Creates the user store slice
 */
export const createUserSlice: StateCreator<
  any,
  [['zustand/immer', never]],
  [],
  UserSlice
> = (set) => ({
  user: initialUserState,

  setUser: (profile: UserProfile) => {
    set((state: any) => {
      state.user.profile = profile;
      state.user.error = null;
    });
  },

  updateProfile: (updates: Partial<UserProfile>) => {
    set((state: any) => {
      if (state.user.profile) {
        Object.assign(state.user.profile, updates);
      } else {
        state.user.profile = updates as UserProfile;
      }
      state.user.error = null;
    });
  },

  updatePreferences: (updates: Partial<StylePreferences>) => {
    set((state: any) => {
      if (state.user.preferences) {
        Object.assign(state.user.preferences, updates);
      } else {
        state.user.preferences = updates as StylePreferences;
      }
      state.user.error = null;
    });
  },

  updateSettings: (updates: Partial<UserSettings>) => {
    set((state: any) => {
      Object.assign(state.user.settings, updates);
      state.user.error = null;
    });
  },

  clearUserError: () => {
    set((state: any) => {
      state.user.error = null;
    });
  },
});