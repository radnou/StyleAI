import { StateCreator } from 'zustand';

/**
 * Étape d'onboarding
 */
export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  isOptional: boolean;
  canSkip: boolean;
  validationRequired: boolean;
  completedAt?: Date;
  skippedAt?: Date;
  data?: Record<string, any>;
}

/**
 * Configuration des permissions
 */
export interface PermissionConfig {
  camera: {
    requested: boolean;
    granted: boolean;
    denied: boolean;
    requestedAt?: Date;
  };
  photos: {
    requested: boolean;
    granted: boolean;
    denied: boolean;
    requestedAt?: Date;
  };
  notifications: {
    requested: boolean;
    granted: boolean;
    denied: boolean;
    requestedAt?: Date;
  };
  location?: {
    requested: boolean;
    granted: boolean;
    denied: boolean;
    requestedAt?: Date;
  };
}

/**
 * Préférences de style utilisateur
 */
export interface StylePreferences {
  preferredStyles: string[];
  favoriteColors: string[];
  bodyType?: string;
  lifestyleType?: string;
  budgetRange?: {
    min: number;
    max: number;
  };
  shoppingFrequency?: 'rarely' | 'monthly' | 'weekly' | 'frequently';
  sustainabilityFocus?: boolean;
  brandPreferences?: string[];
}

/**
 * Informations personnelles de l'onboarding
 */
export interface PersonalInfo {
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  country?: string;
  city?: string;
  occupation?: string;
  profilePictureUri?: string;
}

/**
 * Progression du tutoriel
 */
export interface TutorialProgress {
  welcomeCompleted: boolean;
  profileSetupCompleted: boolean;
  stylePreferencesCompleted: boolean;
  permissionsCompleted: boolean;
  featuresIntroCompleted: boolean;
  firstOutfitCreated: boolean;
  firstWardrobeItemAdded: boolean;
  tutorialCompleted: boolean;
  completedSteps: string[];
  skippedSteps: string[];
  startedAt?: Date;
  completedAt?: Date;
}

/**
 * État de l'onboarding
 */
export interface OnboardingState {
  // Progression générale
  isStarted: boolean;
  isCompleted: boolean;
  currentStepIndex: number;
  totalSteps: number;
  completedSteps: Set<string>;
  skippedSteps: Set<string>;
  
  // Étapes
  steps: OnboardingStep[];
  
  // Données collectées
  personalInfo: PersonalInfo;
  stylePreferences: StylePreferences;
  permissions: PermissionConfig;
  tutorialProgress: TutorialProgress;
  
  // Configuration
  allowSkip: boolean;
  allowBack: boolean;
  autoSave: boolean;
  showProgress: boolean;
  
  // Métadonnées
  startedAt?: Date;
  completedAt?: Date;
  lastActiveAt?: Date;
  version: string;
}

/**
 * Actions de l'onboarding
 */
export interface OnboardingActions {
  // Navigation
  startOnboarding: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  goToStep: (stepIndex: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipStep: (stepId?: string) => void;
  
  // Gestion des étapes
  completeStep: (stepId: string, data?: Record<string, any>) => void;
  updateStepData: (stepId: string, data: Record<string, any>) => void;
  isStepCompleted: (stepId: string) => boolean;
  isStepSkipped: (stepId: string) => boolean;
  canProceedToNext: () => boolean;
  canGoBack: () => boolean;
  
  // Données utilisateur
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  updateStylePreferences: (preferences: Partial<StylePreferences>) => void;
  updatePermissions: (permissions: Partial<PermissionConfig>) => void;
  updateTutorialProgress: (progress: Partial<TutorialProgress>) => void;
  
  // Permissions spécifiques
  requestCameraPermission: () => Promise<boolean>;
  requestPhotosPermission: () => Promise<boolean>;
  requestNotificationsPermission: () => Promise<boolean>;
  
  // Utilitaires
  getProgress: () => number;
  getCurrentStep: () => OnboardingStep | null;
  exportOnboardingData: () => string;
  importOnboardingData: (data: string) => void;
  
  // Analytics
  trackStepStarted: (stepId: string) => void;
  trackStepCompleted: (stepId: string, duration: number) => void;
  trackStepSkipped: (stepId: string) => void;
}

/**
 * Interface complète du slice d'onboarding
 */
export interface OnboardingSlice {
  onboarding: OnboardingState;
  
  // Actions
  startOnboarding: OnboardingActions['startOnboarding'];
  completeOnboarding: OnboardingActions['completeOnboarding'];
  resetOnboarding: OnboardingActions['resetOnboarding'];
  goToStep: OnboardingActions['goToStep'];
  nextStep: OnboardingActions['nextStep'];
  previousStep: OnboardingActions['previousStep'];
  skipStep: OnboardingActions['skipStep'];
  completeStep: OnboardingActions['completeStep'];
  updateStepData: OnboardingActions['updateStepData'];
  isStepCompleted: OnboardingActions['isStepCompleted'];
  isStepSkipped: OnboardingActions['isStepSkipped'];
  canProceedToNext: OnboardingActions['canProceedToNext'];
  canGoBack: OnboardingActions['canGoBack'];
  updatePersonalInfo: OnboardingActions['updatePersonalInfo'];
  updateStylePreferences: OnboardingActions['updateStylePreferences'];
  updatePermissions: OnboardingActions['updatePermissions'];
  updateTutorialProgress: OnboardingActions['updateTutorialProgress'];
  requestCameraPermission: OnboardingActions['requestCameraPermission'];
  requestPhotosPermission: OnboardingActions['requestPhotosPermission'];
  requestNotificationsPermission: OnboardingActions['requestNotificationsPermission'];
  getProgress: OnboardingActions['getProgress'];
  getCurrentStep: OnboardingActions['getCurrentStep'];
  exportOnboardingData: OnboardingActions['exportOnboardingData'];
  importOnboardingData: OnboardingActions['importOnboardingData'];
  trackStepStarted: OnboardingActions['trackStepStarted'];
  trackStepCompleted: OnboardingActions['trackStepCompleted'];
  trackStepSkipped: OnboardingActions['trackStepSkipped'];
}

/**
 * Étapes par défaut de l'onboarding
 */
const defaultSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue',
    description: 'Découvrez StyleAI, votre assistant IA personnel pour le style',
    isCompleted: false,
    isOptional: false,
    canSkip: false,
    validationRequired: false,
  },
  {
    id: 'personal-info',
    title: 'Informations personnelles',
    description: 'Parlez-nous de vous pour personnaliser votre expérience',
    isCompleted: false,
    isOptional: false,
    canSkip: true,
    validationRequired: true,
  },
  {
    id: 'style-preferences',
    title: 'Préférences de style',
    description: 'Définissez votre style personnel',
    isCompleted: false,
    isOptional: false,
    canSkip: false,
    validationRequired: true,
  },
  {
    id: 'permissions',
    title: 'Autorisations',
    description: 'Accordez les permissions pour une meilleure expérience',
    isCompleted: false,
    isOptional: true,
    canSkip: true,
    validationRequired: false,
  },
  {
    id: 'tutorial',
    title: 'Découverte des fonctionnalités',
    description: 'Apprenez à utiliser StyleAI',
    isCompleted: false,
    isOptional: true,
    canSkip: true,
    validationRequired: false,
  },
  {
    id: 'complete',
    title: 'Configuration terminée',
    description: 'Vous êtes prêt à commencer!',
    isCompleted: false,
    isOptional: false,
    canSkip: false,
    validationRequired: false,
  },
];

/**
 * État initial de l'onboarding
 */
const initialOnboardingState: OnboardingState = {
  isStarted: false,
  isCompleted: false,
  currentStepIndex: 0,
  totalSteps: defaultSteps.length,
  completedSteps: new Set(),
  skippedSteps: new Set(),
  steps: defaultSteps,
  personalInfo: {},
  stylePreferences: {
    preferredStyles: [],
    favoriteColors: [],
    sustainabilityFocus: false,
  },
  permissions: {
    camera: { requested: false, granted: false, denied: false },
    photos: { requested: false, granted: false, denied: false },
    notifications: { requested: false, granted: false, denied: false },
  },
  tutorialProgress: {
    welcomeCompleted: false,
    profileSetupCompleted: false,
    stylePreferencesCompleted: false,
    permissionsCompleted: false,
    featuresIntroCompleted: false,
    firstOutfitCreated: false,
    firstWardrobeItemAdded: false,
    tutorialCompleted: false,
    completedSteps: [],
    skippedSteps: [],
  },
  allowSkip: true,
  allowBack: true,
  autoSave: true,
  showProgress: true,
  version: '1.0.0',
};

/**
 * Crée le slice d'onboarding
 */
export const createOnboardingSlice: StateCreator<
  any,
  [['zustand/immer', never]],
  [],
  OnboardingSlice
> = (set, get) => ({
  onboarding: initialOnboardingState,

  startOnboarding: () => {
    set((state: any) => {
      state.onboarding.isStarted = true;
      state.onboarding.startedAt = new Date();
      state.onboarding.lastActiveAt = new Date();
      state.onboarding.currentStepIndex = 0;
    });
  },

  completeOnboarding: () => {
    set((state: any) => {
      state.onboarding.isCompleted = true;
      state.onboarding.completedAt = new Date();
      state.onboarding.lastActiveAt = new Date();
      // Marquer toutes les étapes comme complétées
      state.onboarding.steps.forEach((step: OnboardingStep) => {
        if (!step.isCompleted) {
          state.onboarding.completedSteps.add(step.id);
          step.isCompleted = true;
          step.completedAt = new Date();
        }
      });
    });
  },

  resetOnboarding: () => {
    set((state: any) => {
      state.onboarding = { ...initialOnboardingState };
    });
  },

  goToStep: (stepIndex: number) => {
    set((state: any) => {
      if (stepIndex >= 0 && stepIndex < state.onboarding.totalSteps) {
        state.onboarding.currentStepIndex = stepIndex;
        state.onboarding.lastActiveAt = new Date();
      }
    });
  },

  nextStep: () => {
    const { onboarding } = get() as any;
    if (onboarding.currentStepIndex < onboarding.totalSteps - 1) {
      set((state: any) => {
        state.onboarding.currentStepIndex += 1;
        state.onboarding.lastActiveAt = new Date();
      });
    }
  },

  previousStep: () => {
    const { onboarding } = get() as any;
    if (onboarding.currentStepIndex > 0) {
      set((state: any) => {
        state.onboarding.currentStepIndex -= 1;
        state.onboarding.lastActiveAt = new Date();
      });
    }
  },

  skipStep: (stepId?: string) => {
    set((state: any) => {
      const currentStep = state.onboarding.steps[state.onboarding.currentStepIndex];
      const targetStepId = stepId || currentStep.id;
      
      if (currentStep.canSkip) {
        state.onboarding.skippedSteps.add(targetStepId);
        const stepIndex = state.onboarding.steps.findIndex((s: OnboardingStep) => s.id === targetStepId);
        if (stepIndex !== -1) {
          state.onboarding.steps[stepIndex].skippedAt = new Date();
        }
        state.onboarding.lastActiveAt = new Date();
      }
    });
  },

  completeStep: (stepId: string, data?: Record<string, any>) => {
    set((state: any) => {
      state.onboarding.completedSteps.add(stepId);
      const stepIndex = state.onboarding.steps.findIndex((s: OnboardingStep) => s.id === stepId);
      
      if (stepIndex !== -1) {
        state.onboarding.steps[stepIndex].isCompleted = true;
        state.onboarding.steps[stepIndex].completedAt = new Date();
        if (data) {
          state.onboarding.steps[stepIndex].data = { 
            ...state.onboarding.steps[stepIndex].data, 
            ...data 
          };
        }
      }
      state.onboarding.lastActiveAt = new Date();
    });
  },

  updateStepData: (stepId: string, data: Record<string, any>) => {
    set((state: any) => {
      const stepIndex = state.onboarding.steps.findIndex((s: OnboardingStep) => s.id === stepId);
      if (stepIndex !== -1) {
        state.onboarding.steps[stepIndex].data = { 
          ...state.onboarding.steps[stepIndex].data, 
          ...data 
        };
      }
    });
  },

  isStepCompleted: (stepId: string) => {
    const { onboarding } = get() as any;
    return onboarding.completedSteps.has(stepId);
  },

  isStepSkipped: (stepId: string) => {
    const { onboarding } = get() as any;
    return onboarding.skippedSteps.has(stepId);
  },

  canProceedToNext: () => {
    const { onboarding } = get() as any;
    const currentStep = onboarding.steps[onboarding.currentStepIndex];
    
    if (!currentStep) return false;
    
    // Si l'étape nécessite une validation et n'est pas complétée
    if (currentStep.validationRequired && !currentStep.isCompleted) {
      return false;
    }
    
    return onboarding.currentStepIndex < onboarding.totalSteps - 1;
  },

  canGoBack: () => {
    const { onboarding } = get() as any;
    return onboarding.allowBack && onboarding.currentStepIndex > 0;
  },

  updatePersonalInfo: (info: Partial<PersonalInfo>) => {
    set((state: any) => {
      state.onboarding.personalInfo = { 
        ...state.onboarding.personalInfo, 
        ...info 
      };
      state.onboarding.lastActiveAt = new Date();
    });
  },

  updateStylePreferences: (preferences: Partial<StylePreferences>) => {
    set((state: any) => {
      state.onboarding.stylePreferences = { 
        ...state.onboarding.stylePreferences, 
        ...preferences 
      };
      state.onboarding.lastActiveAt = new Date();
    });
  },

  updatePermissions: (permissions: Partial<PermissionConfig>) => {
    set((state: any) => {
      state.onboarding.permissions = { 
        ...state.onboarding.permissions, 
        ...permissions 
      };
      state.onboarding.lastActiveAt = new Date();
    });
  },

  updateTutorialProgress: (progress: Partial<TutorialProgress>) => {
    set((state: any) => {
      state.onboarding.tutorialProgress = { 
        ...state.onboarding.tutorialProgress, 
        ...progress 
      };
      state.onboarding.lastActiveAt = new Date();
    });
  },

  requestCameraPermission: async () => {
    // Implementation will depend on expo-camera or react-native-permissions
    return new Promise((resolve) => {
      // Simuler la demande de permission
      setTimeout(() => {
        const granted = Math.random() > 0.3; // 70% de chance d'être accordée
        
        set((state: any) => {
          state.onboarding.permissions.camera = {
            requested: true,
            granted,
            denied: !granted,
            requestedAt: new Date(),
          };
        });
        
        resolve(granted);
      }, 1000);
    });
  },

  requestPhotosPermission: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const granted = Math.random() > 0.2; // 80% de chance d'être accordée
        
        set((state: any) => {
          state.onboarding.permissions.photos = {
            requested: true,
            granted,
            denied: !granted,
            requestedAt: new Date(),
          };
        });
        
        resolve(granted);
      }, 1000);
    });
  },

  requestNotificationsPermission: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const granted = Math.random() > 0.4; // 60% de chance d'être accordée
        
        set((state: any) => {
          state.onboarding.permissions.notifications = {
            requested: true,
            granted,
            denied: !granted,
            requestedAt: new Date(),
          };
        });
        
        resolve(granted);
      }, 1000);
    });
  },

  getProgress: () => {
    const { onboarding } = get() as any;
    return Math.round(((onboarding.currentStepIndex + 1) / onboarding.totalSteps) * 100);
  },

  getCurrentStep: () => {
    const { onboarding } = get() as any;
    return onboarding.steps[onboarding.currentStepIndex] || null;
  },

  exportOnboardingData: () => {
    const { onboarding } = get() as any;
    return JSON.stringify({
      personalInfo: onboarding.personalInfo,
      stylePreferences: onboarding.stylePreferences,
      permissions: onboarding.permissions,
      tutorialProgress: onboarding.tutorialProgress,
      completedSteps: Array.from(onboarding.completedSteps),
      skippedSteps: Array.from(onboarding.skippedSteps),
      version: onboarding.version,
      exportedAt: new Date(),
    });
  },

  importOnboardingData: (data: string) => {
    try {
      const importedData = JSON.parse(data);
      set((state: any) => {
        if (importedData.personalInfo) {
          state.onboarding.personalInfo = importedData.personalInfo;
        }
        if (importedData.stylePreferences) {
          state.onboarding.stylePreferences = importedData.stylePreferences;
        }
        if (importedData.permissions) {
          state.onboarding.permissions = importedData.permissions;
        }
        if (importedData.tutorialProgress) {
          state.onboarding.tutorialProgress = importedData.tutorialProgress;
        }
        if (importedData.completedSteps) {
          state.onboarding.completedSteps = new Set(importedData.completedSteps);
        }
        if (importedData.skippedSteps) {
          state.onboarding.skippedSteps = new Set(importedData.skippedSteps);
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'import des données d\'onboarding:', error);
    }
  },

  trackStepStarted: (stepId: string) => {
    // Implementation for analytics
    console.log(`Onboarding step started: ${stepId}`);
  },

  trackStepCompleted: (stepId: string, duration: number) => {
    // Implementation for analytics
    console.log(`Onboarding step completed: ${stepId} in ${duration}ms`);
  },

  trackStepSkipped: (stepId: string) => {
    // Implementation for analytics
    console.log(`Onboarding step skipped: ${stepId}`);
  },
});