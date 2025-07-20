import React from 'react';
import { YStack } from 'tamagui';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  SlideInLeft,
  SlideOutRight,
  SlideInUp,
  SlideOutDown,
  SlideInDown,
  SlideOutUp,
  BounceIn,
  BounceOut,
  FlipInXUp,
  FlipOutXDown,
  ZoomIn,
  ZoomOut,
  EntryExitAnimationFunction,
} from 'react-native-reanimated';

const AnimatedYStack = Animated.createAnimatedComponent(YStack);

export type TransitionType = 
  | 'fade'
  | 'slide'
  | 'slideLeft'
  | 'slideRight'
  | 'slideUp'
  | 'slideDown'
  | 'bounce'
  | 'flip'
  | 'zoom'
  | 'custom';

export type TransitionDirection = 'forward' | 'backward';

export interface AnimatedTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  type?: TransitionType;
  direction?: TransitionDirection;
  duration?: number;
  delay?: number;
  onAnimationComplete?: () => void;
  customEntering?: EntryExitAnimationFunction;
  customExiting?: EntryExitAnimationFunction;
  style?: any;
}

/**
 * Composant de transition animée réutilisable
 */
export function AnimatedTransition({
  children,
  isVisible,
  type = 'fade',
  direction = 'forward',
  duration = 600,
  delay = 0,
  onAnimationComplete,
  customEntering,
  customExiting,
  style,
}: AnimatedTransitionProps) {
  const opacity = useSharedValue(isVisible ? 1 : 0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(isVisible ? 1 : 0);
  const rotateX = useSharedValue(0);

  React.useEffect(() => {
    const config = { duration };
    
    switch (type) {
      case 'fade':
        opacity.value = withDelay(
          delay,
          withTiming(isVisible ? 1 : 0, config, onAnimationComplete)
        );
        break;
        
      case 'slide':
      case 'slideRight':
        translateX.value = withDelay(
          delay,
          withSpring(isVisible ? 0 : (direction === 'forward' ? 100 : -100), {
            damping: 15,
            stiffness: 100,
          }, onAnimationComplete)
        );
        opacity.value = withDelay(
          delay,
          withTiming(isVisible ? 1 : 0, config)
        );
        break;
        
      case 'slideLeft':
        translateX.value = withDelay(
          delay,
          withSpring(isVisible ? 0 : (direction === 'forward' ? -100 : 100), {
            damping: 15,
            stiffness: 100,
          }, onAnimationComplete)
        );
        opacity.value = withDelay(
          delay,
          withTiming(isVisible ? 1 : 0, config)
        );
        break;
        
      case 'slideUp':
        translateY.value = withDelay(
          delay,
          withSpring(isVisible ? 0 : 100, {
            damping: 15,
            stiffness: 100,
          }, onAnimationComplete)
        );
        opacity.value = withDelay(
          delay,
          withTiming(isVisible ? 1 : 0, config)
        );
        break;
        
      case 'slideDown':
        translateY.value = withDelay(
          delay,
          withSpring(isVisible ? 0 : -100, {
            damping: 15,
            stiffness: 100,
          }, onAnimationComplete)
        );
        opacity.value = withDelay(
          delay,
          withTiming(isVisible ? 1 : 0, config)
        );
        break;
        
      case 'bounce':
        scale.value = withDelay(
          delay,
          withSequence(
            withSpring(isVisible ? 1.1 : 0, { damping: 10, stiffness: 100 }),
            withSpring(isVisible ? 1 : 0, { damping: 15, stiffness: 100 })
          ),
          onAnimationComplete
        );
        opacity.value = withDelay(
          delay,
          withTiming(isVisible ? 1 : 0, config)
        );
        break;
        
      case 'flip':
        rotateX.value = withDelay(
          delay,
          withSpring(isVisible ? 0 : 90, {
            damping: 15,
            stiffness: 100,
          }, onAnimationComplete)
        );
        opacity.value = withDelay(
          delay,
          withTiming(isVisible ? 1 : 0, config)
        );
        break;
        
      case 'zoom':
        scale.value = withDelay(
          delay,
          withSpring(isVisible ? 1 : 0, {
            damping: 15,
            stiffness: 100,
          }, onAnimationComplete)
        );
        opacity.value = withDelay(
          delay,
          withTiming(isVisible ? 1 : 0, config)
        );
        break;
    }
  }, [isVisible, type, direction, duration, delay, onAnimationComplete]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotateX: `${rotateX.value}deg` },
      ],
    };
  });

  if (type === 'custom' && customEntering && customExiting) {
    return (
      <AnimatedYStack
        entering={customEntering}
        exiting={customExiting}
        style={style}
      >
        {children}
      </AnimatedYStack>
    );
  }

  return (
    <AnimatedYStack style={[animatedStyle, style]}>
      {children}
    </AnimatedYStack>
  );
}

/**
 * Transitions prédéfinies pour l'onboarding
 */
export const OnboardingTransitions = {
  /**
   * Transition pour avancer dans l'onboarding
   */
  stepForward: {
    entering: SlideInRight.delay(100).duration(600),
    exiting: SlideOutLeft.duration(400),
  },

  /**
   * Transition pour reculer dans l'onboarding
   */
  stepBackward: {
    entering: SlideInLeft.delay(100).duration(600),
    exiting: SlideOutRight.duration(400),
  },

  /**
   * Transition d'apparition douce
   */
  fadeIn: {
    entering: FadeIn.delay(200).duration(800),
    exiting: FadeOut.duration(400),
  },

  /**
   * Transition dynamique depuis le bas
   */
  slideUp: {
    entering: SlideInUp.delay(150).duration(700),
    exiting: SlideOutDown.duration(500),
  },

  /**
   * Transition énergique
   */
  bounce: {
    entering: BounceIn.delay(100).duration(800),
    exiting: BounceOut.duration(400),
  },

  /**
   * Transition avec effet de flip
   */
  flip: {
    entering: FlipInXUp.delay(150).duration(700),
    exiting: FlipOutXDown.duration(500),
  },

  /**
   * Transition zoom
   */
  zoom: {
    entering: ZoomIn.delay(100).duration(600),
    exiting: ZoomOut.duration(400),
  },

  /**
   * Transition séquentielle pour les éléments de liste
   */
  staggered: (index: number) => ({
    entering: FadeIn.delay(index * 100).duration(600),
    exiting: FadeOut.duration(300),
  }),
};

/**
 * Composant pour les transitions de pages d'onboarding
 */
export function OnboardingPageTransition({
  children,
  direction = 'forward',
  style,
}: {
  children: React.ReactNode;
  direction?: TransitionDirection;
  style?: any;
}) {
  const transition = direction === 'forward' 
    ? OnboardingTransitions.stepForward 
    : OnboardingTransitions.stepBackward;

  return (
    <AnimatedYStack
      entering={transition.entering}
      exiting={transition.exiting}
      style={style}
    >
      {children}
    </AnimatedYStack>
  );
}

/**
 * Hook pour gérer les transitions d'onboarding
 */
export function useOnboardingTransition(
  currentStep: number,
  totalSteps: number
) {
  const [direction, setDirection] = React.useState<TransitionDirection>('forward');
  const previousStep = React.useRef(currentStep);

  React.useEffect(() => {
    if (currentStep > previousStep.current) {
      setDirection('forward');
    } else if (currentStep < previousStep.current) {
      setDirection('backward');
    }
    previousStep.current = currentStep;
  }, [currentStep]);

  const getTransition = React.useCallback((type?: TransitionType) => {
    switch (type) {
      case 'bounce':
        return OnboardingTransitions.bounce;
      case 'fade':
        return OnboardingTransitions.fadeIn;
      case 'slideUp':
        return OnboardingTransitions.slideUp;
      case 'flip':
        return OnboardingTransitions.flip;
      case 'zoom':
        return OnboardingTransitions.zoom;
      default:
        return direction === 'forward' 
          ? OnboardingTransitions.stepForward 
          : OnboardingTransitions.stepBackward;
    }
  }, [direction]);

  return {
    direction,
    getTransition,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1,
  };
}

export default AnimatedTransition;