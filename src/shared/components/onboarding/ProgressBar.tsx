import React from 'react';
import { XStack, YStack, Text, Progress } from 'tamagui';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const AnimatedXStack = Animated.createAnimatedComponent(XStack);

export interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  showLabels?: boolean;
  showPercentage?: boolean;
  variant?: 'linear' | 'stepped' | 'circular';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  backgroundColor?: string;
}

/**
 * Barre de progression avancée pour l'onboarding
 */
export function ProgressBar({
  currentStep,
  totalSteps,
  labels = [],
  showLabels = false,
  showPercentage = true,
  variant = 'linear',
  size = 'medium',
  color = '$blue10',
  backgroundColor = '$color4',
}: ProgressBarProps) {
  const progress = useSharedValue((currentStep + 1) / totalSteps);
  
  React.useEffect(() => {
    progress.value = withTiming((currentStep + 1) / totalSteps, {
      duration: 600,
    });
  }, [currentStep, totalSteps, progress]);

  if (variant === 'stepped') {
    return (
      <SteppedProgress
        currentStep={currentStep}
        totalSteps={totalSteps}
        labels={labels}
        showLabels={showLabels}
        size={size}
        color={color}
        backgroundColor={backgroundColor}
      />
    );
  }

  if (variant === 'circular') {
    return (
      <CircularProgress
        currentStep={currentStep}
        totalSteps={totalSteps}
        showPercentage={showPercentage}
        size={size}
        color={color}
        backgroundColor={backgroundColor}
      />
    );
  }

  // Linear progress (default)
  const heightMap = { small: 4, medium: 6, large: 8 };
  const height = heightMap[size];

  return (
    <YStack gap="$2">
      {showPercentage && (
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$2" color="$color11" fontWeight="500">
            Progression
          </Text>
          <Text fontSize="$2" color="$color11" fontWeight="600">
            {Math.round(((currentStep + 1) / totalSteps) * 100)}%
          </Text>
        </XStack>
      )}
      
      <Progress 
        value={((currentStep + 1) / totalSteps) * 100}
        backgroundColor={backgroundColor}
        borderRadius="$3"
        height={height}
      >
        <Progress.Indicator 
          animation="bouncy" 
          backgroundColor={color}
        />
      </Progress>
    </YStack>
  );
}

/**
 * Progression par étapes avec indicateurs individuels
 */
function SteppedProgress({
  currentStep,
  totalSteps,
  labels,
  showLabels,
  size,
  color,
  backgroundColor,
}: {
  currentStep: number;
  totalSteps: number;
  labels: string[];
  showLabels: boolean;
  size: 'small' | 'medium' | 'large';
  color: string;
  backgroundColor: string;
}) {
  const sizeMap = { small: 8, medium: 12, large: 16 };
  const stepSize = sizeMap[size];

  return (
    <YStack gap="$3">
      <XStack gap="$2" alignItems="center" justifyContent="space-between">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isCompleted = index <= currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <React.Fragment key={index}>
              <AnimatedXStack
                alignItems="center"
                justifyContent="center"
                width={stepSize * 2}
                height={stepSize * 2}
                borderRadius={stepSize}
                backgroundColor={isCompleted ? color : backgroundColor}
                borderWidth={isCurrent ? 2 : 0}
                borderColor={color}
              >
                {isCompleted ? (
                  <Text 
                    color="white" 
                    fontSize={stepSize * 0.6} 
                    fontWeight="bold"
                  >
                    ✓
                  </Text>
                ) : (
                  <Circle 
                    size={stepSize * 0.6} 
                    color="$color9" 
                    fill="$color9"
                  />
                )}
              </AnimatedXStack>
              
              {index < totalSteps - 1 && (
                <XStack 
                  flex={1} 
                  height={2} 
                  backgroundColor={index < currentStep ? color : backgroundColor}
                  borderRadius="$1"
                />
              )}
            </React.Fragment>
          );
        })}
      </XStack>

      {showLabels && labels.length === totalSteps && (
        <XStack justifyContent="space-between" paddingHorizontal="$1">
          {labels.map((label, index) => (
            <Text 
              key={index}
              fontSize="$1" 
              color={index <= currentStep ? color : '$color9'}
              fontWeight={index === currentStep ? '600' : '400'}
              textAlign="center"
              width={stepSize * 3}
            >
              {label}
            </Text>
          ))}
        </XStack>
      )}
    </YStack>
  );
}

/**
 * Progression circulaire
 */
function CircularProgress({
  currentStep,
  totalSteps,
  showPercentage,
  size,
  color,
  backgroundColor,
}: {
  currentStep: number;
  totalSteps: number;
  showPercentage: boolean;
  size: 'small' | 'medium' | 'large';
  color: string;
  backgroundColor: string;
}) {
  const sizeMap = { small: 60, medium: 80, large: 100 };
  const circleSize = sizeMap[size];
  const strokeWidth = circleSize * 0.08;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const progress = useSharedValue((currentStep + 1) / totalSteps);
  
  React.useEffect(() => {
    progress.value = withSpring((currentStep + 1) / totalSteps, {
      damping: 15,
      stiffness: 100,
    });
  }, [currentStep, totalSteps, progress]);

  const animatedProps = useAnimatedStyle(() => {
    const strokeDashoffset = circumference * (1 - progress.value);
    return {
      strokeDashoffset: withTiming(strokeDashoffset, { duration: 800 }),
    };
  });

  const percentage = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <XStack alignItems="center" justifyContent="center">
      {/* SVG sera remplacé par une implémentation Tamagui si disponible */}
      <YStack 
        width={circleSize} 
        height={circleSize} 
        alignItems="center" 
        justifyContent="center"
        borderRadius={circleSize / 2}
        borderWidth={strokeWidth}
        borderColor={backgroundColor}
        position="relative"
      >
        {/* Indicateur de progression - version simplifiée */}
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          borderRadius={circleSize / 2}
          borderWidth={strokeWidth}
          borderColor={color}
          style={{
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: percentage > 50 ? color : 'transparent',
            borderLeftColor: percentage > 25 ? color : 'transparent',
            transform: [{ rotate: `${(percentage / 100) * 360}deg` }],
          }}
        />
        
        {showPercentage && (
          <YStack alignItems="center" justifyContent="center">
            <Text fontSize="$6" fontWeight="bold" color={color}>
              {percentage}%
            </Text>
            <Text fontSize="$1" color="$color11">
              Terminé
            </Text>
          </YStack>
        )}
      </YStack>
    </XStack>
  );
}

export default ProgressBar;