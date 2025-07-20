/**
 * StyleAI Animation System
 * Reusable animation configurations and utilities
 */

import { withSpring, withTiming, WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

// Spring Animation Configs
export const springConfigs = {
  gentle: {
    damping: 20,
    stiffness: 90,
    mass: 0.8,
  } as WithSpringConfig,
  
  bouncy: {
    damping: 10,
    stiffness: 100,
    mass: 0.9,
  } as WithSpringConfig,
  
  snappy: {
    damping: 15,
    stiffness: 200,
    mass: 0.7,
  } as WithSpringConfig,
  
  slow: {
    damping: 20,
    stiffness: 40,
    mass: 1.2,
  } as WithSpringConfig,
} as const;

// Timing Animation Configs
export const timingConfigs = {
  fast: {
    duration: 150,
  } as WithTimingConfig,
  
  normal: {
    duration: 200,
  } as WithTimingConfig,
  
  slow: {
    duration: 300,
  } as WithTimingConfig,
  
  slower: {
    duration: 500,
  } as WithTimingConfig,
} as const;

// Animation Utilities
export const createSpringAnimation = (
  config: keyof typeof springConfigs = 'gentle'
) => {
  return (value: number) => withSpring(value, springConfigs[config]);
};

export const createTimingAnimation = (
  config: keyof typeof timingConfigs = 'normal'
) => {
  return (value: number) => withTiming(value, timingConfigs[config]);
};

// Common Animation Sequences
export const fadeIn = (duration: number = 200) => ({
  from: {
    opacity: 0,
  },
  to: {
    opacity: 1,
  },
  config: {
    duration,
  },
});

export const fadeOut = (duration: number = 200) => ({
  from: {
    opacity: 1,
  },
  to: {
    opacity: 0,
  },
  config: {
    duration,
  },
});

export const slideUp = (duration: number = 300) => ({
  from: {
    opacity: 0,
    transform: [{ translateY: 30 }],
  },
  to: {
    opacity: 1,
    transform: [{ translateY: 0 }],
  },
  config: {
    duration,
  },
});

export const slideDown = (duration: number = 300) => ({
  from: {
    opacity: 0,
    transform: [{ translateY: -30 }],
  },
  to: {
    opacity: 1,
    transform: [{ translateY: 0 }],
  },
  config: {
    duration,
  },
});

export const scale = (duration: number = 200) => ({
  from: {
    opacity: 0,
    transform: [{ scale: 0.9 }],
  },
  to: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  config: {
    duration,
  },
});

export const bounce = (duration: number = 500) => ({
  from: {
    opacity: 0,
    transform: [{ scale: 0.3 }],
  },
  to: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  config: {
    duration,
    damping: 10,
    stiffness: 100,
  },
});

// Stagger Animation Utility
export const createStaggerAnimation = (
  baseAnimation: any,
  staggerDelay: number = 50
) => {
  return (index: number) => ({
    ...baseAnimation,
    config: {
      ...baseAnimation.config,
      delay: index * staggerDelay,
    },
  });
};

// Gesture Animation Helpers
export const createPressAnimation = (scale: number = 0.95) => ({
  pressIn: {
    scale,
    opacity: 0.8,
  },
  pressOut: {
    scale: 1,
    opacity: 1,
  },
});

export const createHoverAnimation = (scale: number = 1.02) => ({
  hoverIn: {
    scale,
  },
  hoverOut: {
    scale: 1,
  },
});

export default {
  springConfigs,
  timingConfigs,
  createSpringAnimation,
  createTimingAnimation,
  fadeIn,
  fadeOut,
  slideUp,
  slideDown,
  scale,
  bounce,
  createStaggerAnimation,
  createPressAnimation,
  createHoverAnimation,
};