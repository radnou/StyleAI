// Composants d'onboarding
export { 
  OnboardingContainer, 
  SimpleOnboardingContainer,
  type OnboardingContainerProps 
} from './OnboardingContainer';

export { 
  ProgressBar,
  type ProgressBarProps 
} from './ProgressBar';

export { 
  StepIndicator,
  type StepIndicatorProps,
  type Step 
} from './StepIndicator';

export { 
  AnimatedTransition,
  OnboardingPageTransition,
  OnboardingTransitions,
  useOnboardingTransition,
  type AnimatedTransitionProps,
  type TransitionType,
  type TransitionDirection
} from './AnimatedTransition';

export { 
  Tooltip,
  TooltipTrigger,
  useTooltip,
  type TooltipProps,
  type TooltipPosition
} from './Tooltip';

export { 
  GuidedTour,
  TourTrigger,
  useGuidedTour,
  type GuidedTourProps,
  type TourStep
} from './GuidedTour';

export { 
  AnimationManager,
  useAnimationManager,
  useOptimizedAnimation,
  usePageTransition,
  AnimationPresets,
  type AnimationConfig,
  type AnimationSequence,
  type AnimationStep
} from './AnimationManager';

// Types communs
export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  isOptional?: boolean;
  canSkip?: boolean;
  validationRequired?: boolean;
  onValidate?: () => Promise<boolean>;
}

export interface OnboardingConfig {
  steps: OnboardingStep[];
  allowSkip?: boolean;
  allowBack?: boolean;
  showProgress?: boolean;
  autoProgress?: boolean;
  persistProgress?: boolean;
}

// Utilitaires
export const OnboardingUtils = {
  /**
   * Calcule le pourcentage de progression
   */
  calculateProgress: (currentStep: number, totalSteps: number): number => {
    return Math.round(((currentStep + 1) / totalSteps) * 100);
  },

  /**
   * Valide si l'utilisateur peut passer à l'étape suivante
   */
  canProceedToNext: (
    currentStep: number, 
    totalSteps: number, 
    completedSteps: Set<number>
  ): boolean => {
    return currentStep < totalSteps - 1 && completedSteps.has(currentStep);
  },

  /**
   * Valide si l'utilisateur peut revenir à l'étape précédente
   */
  canGoBack: (currentStep: number, allowBack: boolean = true): boolean => {
    return allowBack && currentStep > 0;
  },

  /**
   * Génère un ID unique pour une étape
   */
  generateStepId: (prefix: string, index: number): string => {
    return `${prefix}-step-${index}`;
  },

  /**
   * Formate les labels de navigation
   */
  getNavigationLabels: (
    currentStep: number, 
    totalSteps: number, 
    customLabels?: {
      next?: string;
      previous?: string;
      finish?: string;
      skip?: string;
    }
  ) => ({
    next: currentStep === totalSteps - 1 
      ? (customLabels?.finish || 'Terminer')
      : (customLabels?.next || 'Suivant'),
    previous: customLabels?.previous || 'Précédent',
    skip: customLabels?.skip || 'Passer',
  }),
};