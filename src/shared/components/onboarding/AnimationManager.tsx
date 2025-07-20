import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
  interpolate,
  Extrapolate,
  SharedValue,
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  damping?: number;
  stiffness?: number;
  mass?: number;
  easing?: any;
}

export interface AnimationSequence {
  id: string;
  steps: AnimationStep[];
  loop?: boolean;
  onComplete?: () => void;
}

export interface AnimationStep {
  target: SharedValue<number>;
  value: number;
  config?: AnimationConfig;
  delay?: number;
}

export interface AnimationManagerContextType {
  // Animation utilities
  createSharedValue: (initialValue: number) => SharedValue<number>;
  animateValue: (
    sharedValue: SharedValue<number>, 
    toValue: number, 
    config?: AnimationConfig
  ) => void;
  
  // Pre-configured animations
  fadeIn: (delay?: number) => SharedValue<number>;
  fadeOut: (delay?: number) => SharedValue<number>;
  slideInFromLeft: (delay?: number) => { translateX: SharedValue<number>; opacity: SharedValue<number> };
  slideInFromRight: (delay?: number) => { translateX: SharedValue<number>; opacity: SharedValue<number> };
  slideInFromTop: (delay?: number) => { translateY: SharedValue<number>; opacity: SharedValue<number> };
  slideInFromBottom: (delay?: number) => { translateY: SharedValue<number>; opacity: SharedValue<number> };
  scaleIn: (delay?: number) => { scale: SharedValue<number>; opacity: SharedValue<number> };
  bounceIn: (delay?: number) => SharedValue<number>;
  
  // Sequence management
  runSequence: (sequence: AnimationSequence) => void;
  stopSequence: (sequenceId: string) => void;
  
  // Performance optimization
  enableReducedMotion: boolean;
  setReducedMotion: (enabled: boolean) => void;
  animationQuality: 'high' | 'medium' | 'low';
  setAnimationQuality: (quality: 'high' | 'medium' | 'low') => void;
}

const AnimationManagerContext = createContext<AnimationManagerContextType | undefined>(undefined);

/**
 * Gestionnaire d'animations optimisé pour l'onboarding
 */
export function AnimationManager({ children }: { children: React.ReactNode }) {
  const [enableReducedMotion, setReducedMotion] = useState(false);
  const [animationQuality, setAnimationQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [runningSequences, setRunningSequences] = useState<Map<string, any>>(new Map());

  // Default animation configs based on quality
  const getAnimationConfig = (customConfig?: AnimationConfig): AnimationConfig => {
    const baseConfigs = {
      high: { duration: 600, damping: 15, stiffness: 100 },
      medium: { duration: 400, damping: 12, stiffness: 80 },
      low: { duration: 200, damping: 10, stiffness: 60 },
    };

    const baseConfig = baseConfigs[animationQuality];
    
    if (enableReducedMotion) {
      return { duration: 0 };
    }

    return { ...baseConfig, ...customConfig };
  };

  const createSharedValue = (initialValue: number) => {
    return useSharedValue(initialValue);
  };

  const animateValue = (
    sharedValue: SharedValue<number>,
    toValue: number,
    config?: AnimationConfig
  ) => {
    const animConfig = getAnimationConfig(config);
    
    if (animConfig.duration === 0) {
      sharedValue.value = toValue;
      return;
    }

    if (config?.damping || config?.stiffness) {
      sharedValue.value = withSpring(toValue, animConfig);
    } else {
      sharedValue.value = withTiming(toValue, animConfig);
    }
  };

  // Pre-configured animation helpers
  const fadeIn = (delay = 0) => {
    const opacity = useSharedValue(0);
    
    useEffect(() => {
      const config = getAnimationConfig({ delay });
      if (config.duration === 0) {
        opacity.value = 1;
      } else {
        opacity.value = withDelay(delay, withTiming(1, config));
      }
    }, []);

    return opacity;
  };

  const fadeOut = (delay = 0) => {
    const opacity = useSharedValue(1);
    
    useEffect(() => {
      const config = getAnimationConfig({ delay });
      if (config.duration === 0) {
        opacity.value = 0;
      } else {
        opacity.value = withDelay(delay, withTiming(0, config));
      }
    }, []);

    return opacity;
  };

  const slideInFromLeft = (delay = 0) => {
    const translateX = useSharedValue(-screenWidth);
    const opacity = useSharedValue(0);
    
    useEffect(() => {
      const config = getAnimationConfig({ delay });
      if (config.duration === 0) {
        translateX.value = 0;
        opacity.value = 1;
      } else {
        translateX.value = withDelay(delay, withSpring(0, config));
        opacity.value = withDelay(delay, withTiming(1, config));
      }
    }, []);

    return { translateX, opacity };
  };

  const slideInFromRight = (delay = 0) => {
    const translateX = useSharedValue(screenWidth);
    const opacity = useSharedValue(0);
    
    useEffect(() => {
      const config = getAnimationConfig({ delay });
      if (config.duration === 0) {
        translateX.value = 0;
        opacity.value = 1;
      } else {
        translateX.value = withDelay(delay, withSpring(0, config));
        opacity.value = withDelay(delay, withTiming(1, config));
      }
    }, []);

    return { translateX, opacity };
  };

  const slideInFromTop = (delay = 0) => {
    const translateY = useSharedValue(-screenHeight);
    const opacity = useSharedValue(0);
    
    useEffect(() => {
      const config = getAnimationConfig({ delay });
      if (config.duration === 0) {
        translateY.value = 0;
        opacity.value = 1;
      } else {
        translateY.value = withDelay(delay, withSpring(0, config));
        opacity.value = withDelay(delay, withTiming(1, config));
      }
    }, []);

    return { translateY, opacity };
  };

  const slideInFromBottom = (delay = 0) => {
    const translateY = useSharedValue(screenHeight);
    const opacity = useSharedValue(0);
    
    useEffect(() => {
      const config = getAnimationConfig({ delay });
      if (config.duration === 0) {
        translateY.value = 0;
        opacity.value = 1;
      } else {
        translateY.value = withDelay(delay, withSpring(0, config));
        opacity.value = withDelay(delay, withTiming(1, config));
      }
    }, []);

    return { translateY, opacity };
  };

  const scaleIn = (delay = 0) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);
    
    useEffect(() => {
      const config = getAnimationConfig({ delay });
      if (config.duration === 0) {
        scale.value = 1;
        opacity.value = 1;
      } else {
        scale.value = withDelay(delay, withSpring(1, config));
        opacity.value = withDelay(delay, withTiming(1, config));
      }
    }, []);

    return { scale, opacity };
  };

  const bounceIn = (delay = 0) => {
    const scale = useSharedValue(0);
    
    useEffect(() => {
      const config = getAnimationConfig({ delay, damping: 8, stiffness: 100 });
      if (config.duration === 0) {
        scale.value = 1;
      } else {
        scale.value = withDelay(
          delay,
          withSequence(
            withSpring(1.2, config),
            withSpring(1, { ...config, damping: 12 })
          )
        );
      }
    }, []);

    return scale;
  };

  const runSequence = (sequence: AnimationSequence) => {
    if (runningSequences.has(sequence.id)) {
      return; // Sequence already running
    }

    const executeSequence = () => {
      sequence.steps.forEach((step, index) => {
        const delay = step.delay || 0;
        const config = getAnimationConfig(step.config);
        
        if (config.duration === 0) {
          step.target.value = step.value;
        } else {
          step.target.value = withDelay(
            delay,
            withTiming(step.value, config, (finished) => {
              if (finished && index === sequence.steps.length - 1) {
                runOnJS(() => {
                  sequence.onComplete?.();
                  setRunningSequences(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(sequence.id);
                    return newMap;
                  });
                })();
              }
            })
          );
        }
      });
    };

    setRunningSequences(prev => new Map(prev).set(sequence.id, sequence));
    executeSequence();

    if (sequence.loop) {
      // Setup loop logic here if needed
    }
  };

  const stopSequence = (sequenceId: string) => {
    setRunningSequences(prev => {
      const newMap = new Map(prev);
      newMap.delete(sequenceId);
      return newMap;
    });
  };

  const contextValue: AnimationManagerContextType = {
    createSharedValue,
    animateValue,
    fadeIn,
    fadeOut,
    slideInFromLeft,
    slideInFromRight,
    slideInFromTop,
    slideInFromBottom,
    scaleIn,
    bounceIn,
    runSequence,
    stopSequence,
    enableReducedMotion,
    setReducedMotion,
    animationQuality,
    setAnimationQuality,
  };

  return (
    <AnimationManagerContext.Provider value={contextValue}>
      {children}
    </AnimationManagerContext.Provider>
  );
}

/**
 * Hook pour utiliser le gestionnaire d'animations
 */
export function useAnimationManager() {
  const context = useContext(AnimationManagerContext);
  if (!context) {
    throw new Error('useAnimationManager must be used within an AnimationManager');
  }
  return context;
}

/**
 * Hook pour créer des animations optimisées
 */
export function useOptimizedAnimation(
  type: 'fadeIn' | 'slideIn' | 'scaleIn' | 'bounceIn',
  direction?: 'left' | 'right' | 'top' | 'bottom',
  delay = 0
) {
  const { 
    fadeIn, 
    slideInFromLeft, 
    slideInFromRight, 
    slideInFromTop, 
    slideInFromBottom,
    scaleIn,
    bounceIn
  } = useAnimationManager();

  switch (type) {
    case 'fadeIn':
      return { opacity: fadeIn(delay) };
    
    case 'slideIn':
      switch (direction) {
        case 'left': return slideInFromLeft(delay);
        case 'right': return slideInFromRight(delay);
        case 'top': return slideInFromTop(delay);
        case 'bottom': return slideInFromBottom(delay);
        default: return slideInFromRight(delay);
      }
    
    case 'scaleIn':
      return scaleIn(delay);
    
    case 'bounceIn':
      return { scale: bounceIn(delay) };
    
    default:
      return { opacity: fadeIn(delay) };
  }
}

/**
 * Hook pour les animations de transition de page
 */
export function usePageTransition(direction: 'forward' | 'backward' = 'forward') {
  const translateX = useSharedValue(direction === 'forward' ? screenWidth : -screenWidth);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(0, { damping: 15, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 400 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const exitPage = (callback?: () => void) => {
    translateX.value = withSpring(direction === 'forward' ? -screenWidth : screenWidth, 
      { damping: 15, stiffness: 100 });
    opacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished && callback) {
        runOnJS(callback)();
      }
    });
  };

  return {
    animatedStyle,
    exitPage,
  };
}

/**
 * Utilitaires d'animation prédéfinis
 */
export const AnimationPresets = {
  // Entrées
  entrance: {
    fadeIn: { opacity: 0 },
    slideInFromLeft: { transform: [{ translateX: -screenWidth }], opacity: 0 },
    slideInFromRight: { transform: [{ translateX: screenWidth }], opacity: 0 },
    slideInFromTop: { transform: [{ translateY: -screenHeight }], opacity: 0 },
    slideInFromBottom: { transform: [{ translateY: screenHeight }], opacity: 0 },
    scaleIn: { transform: [{ scale: 0 }], opacity: 0 },
    bounceIn: { transform: [{ scale: 0 }] },
  },

  // Sorties
  exit: {
    fadeOut: { opacity: 0 },
    slideOutToLeft: { transform: [{ translateX: -screenWidth }], opacity: 0 },
    slideOutToRight: { transform: [{ translateX: screenWidth }], opacity: 0 },
    slideOutToTop: { transform: [{ translateY: -screenHeight }], opacity: 0 },
    slideOutToBottom: { transform: [{ translateY: screenHeight }], opacity: 0 },
    scaleOut: { transform: [{ scale: 0 }], opacity: 0 },
  },

  // Configurations d'animation communes
  timing: {
    fast: { duration: 200 },
    normal: { duration: 400 },
    slow: { duration: 600 },
  },

  spring: {
    gentle: { damping: 20, stiffness: 90 },
    normal: { damping: 15, stiffness: 100 },
    bouncy: { damping: 10, stiffness: 120 },
  },
};

export default AnimationManager;