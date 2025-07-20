import React from 'react';
import { XStack, YStack, Text, Circle } from 'tamagui';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  interpolate,
  FadeIn,
  SlideInDown
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const AnimatedYStack = Animated.createAnimatedComponent(YStack);
const AnimatedXStack = Animated.createAnimatedComponent(XStack);

export interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  isOptional?: boolean;
}

export interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepPress?: (step: number) => void;
  orientation?: 'horizontal' | 'vertical';
  size?: 'small' | 'medium' | 'large';
  variant?: 'dots' | 'numbers' | 'icons';
  showLabels?: boolean;
  showDescriptions?: boolean;
  allowNavigation?: boolean;
  activeColor?: string;
  completedColor?: string;
  inactiveColor?: string;
  lineColor?: string;
}

/**
 * Indicateur d'étapes avancé pour l'onboarding
 */
export function StepIndicator({
  steps,
  currentStep,
  onStepPress,
  orientation = 'horizontal',
  size = 'medium',
  variant = 'numbers',
  showLabels = true,
  showDescriptions = false,
  allowNavigation = false,
  activeColor = '$blue10',
  completedColor = '$green10',
  inactiveColor = '$color6',
  lineColor = '$color4',
}: StepIndicatorProps) {
  const sizeMap = { 
    small: { circle: 24, text: '$2', desc: '$1' },
    medium: { circle: 32, text: '$3', desc: '$2' },
    large: { circle: 40, text: '$4', desc: '$3' }
  };
  
  const dimensions = sizeMap[size];

  if (orientation === 'vertical') {
    return (
      <VerticalStepIndicator
        steps={steps}
        currentStep={currentStep}
        onStepPress={onStepPress}
        variant={variant}
        showLabels={showLabels}
        showDescriptions={showDescriptions}
        allowNavigation={allowNavigation}
        dimensions={dimensions}
        activeColor={activeColor}
        completedColor={completedColor}
        inactiveColor={inactiveColor}
        lineColor={lineColor}
      />
    );
  }

  return (
    <HorizontalStepIndicator
      steps={steps}
      currentStep={currentStep}
      onStepPress={onStepPress}
      variant={variant}
      showLabels={showLabels}
      showDescriptions={showDescriptions}
      allowNavigation={allowNavigation}
      dimensions={dimensions}
      activeColor={activeColor}
      completedColor={completedColor}
      inactiveColor={inactiveColor}
      lineColor={lineColor}
    />
  );
}

/**
 * Indicateur horizontal
 */
function HorizontalStepIndicator({
  steps,
  currentStep,
  onStepPress,
  variant,
  showLabels,
  showDescriptions,
  allowNavigation,
  dimensions,
  activeColor,
  completedColor,
  inactiveColor,
  lineColor,
}: any) {
  return (
    <YStack gap="$3">
      <XStack alignItems="center" justifyContent="space-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = allowNavigation && (isCompleted || index <= currentStep + 1);
          
          return (
            <React.Fragment key={step.id}>
              <AnimatedXStack
                alignItems="center"
                flexDirection="column"
                gap="$2"
                onPress={isClickable ? () => onStepPress?.(index) : undefined}
                pressStyle={isClickable ? { opacity: 0.7 } : undefined}
                entering={FadeIn.delay(index * 100).duration(500)}
              >
                {/* Circle indicator */}
                <AnimatedYStack
                  width={dimensions.circle}
                  height={dimensions.circle}
                  borderRadius={dimensions.circle / 2}
                  backgroundColor={
                    isCompleted 
                      ? completedColor 
                      : isCurrent 
                        ? activeColor 
                        : inactiveColor
                  }
                  alignItems="center"
                  justifyContent="center"
                  borderWidth={isCurrent ? 3 : 0}
                  borderColor={activeColor}
                  scale={isCurrent ? 1.1 : 1}
                >
                  {renderStepContent(
                    variant, 
                    step, 
                    index, 
                    isCompleted, 
                    isCurrent,
                    dimensions
                  )}
                </AnimatedYStack>

                {/* Labels */}
                {showLabels && (
                  <YStack alignItems="center" gap="$1" maxWidth={80}>
                    <Text
                      fontSize={dimensions.text}
                      fontWeight={isCurrent ? '600' : '400'}
                      color={
                        isCompleted 
                          ? completedColor 
                          : isCurrent 
                            ? activeColor 
                            : '$color9'
                      }
                      textAlign="center"
                      numberOfLines={2}
                    >
                      {step.title}
                    </Text>
                    
                    {showDescriptions && step.description && (
                      <Text
                        fontSize={dimensions.desc}
                        color="$color9"
                        textAlign="center"
                        numberOfLines={2}
                      >
                        {step.description}
                      </Text>
                    )}
                  </YStack>
                )}
              </AnimatedXStack>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <XStack 
                  flex={1} 
                  height={2} 
                  backgroundColor={index < currentStep ? completedColor : lineColor}
                  marginHorizontal="$2"
                  borderRadius="$1"
                />
              )}
            </React.Fragment>
          );
        })}
      </XStack>
    </YStack>
  );
}

/**
 * Indicateur vertical
 */
function VerticalStepIndicator({
  steps,
  currentStep,
  onStepPress,
  variant,
  showLabels,
  showDescriptions,
  allowNavigation,
  dimensions,
  activeColor,
  completedColor,
  inactiveColor,
  lineColor,
}: any) {
  return (
    <YStack gap="$2">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isClickable = allowNavigation && (isCompleted || index <= currentStep + 1);
        
        return (
          <React.Fragment key={step.id}>
            <AnimatedXStack
              gap="$3"
              alignItems="center"
              onPress={isClickable ? () => onStepPress?.(index) : undefined}
              pressStyle={isClickable ? { opacity: 0.7 } : undefined}
              entering={SlideInDown.delay(index * 100).duration(500)}
            >
              {/* Circle indicator */}
              <AnimatedYStack
                width={dimensions.circle}
                height={dimensions.circle}
                borderRadius={dimensions.circle / 2}
                backgroundColor={
                  isCompleted 
                    ? completedColor 
                    : isCurrent 
                      ? activeColor 
                      : inactiveColor
                }
                alignItems="center"
                justifyContent="center"
                borderWidth={isCurrent ? 3 : 0}
                borderColor={activeColor}
                scale={isCurrent ? 1.1 : 1}
              >
                {renderStepContent(
                  variant, 
                  step, 
                  index, 
                  isCompleted, 
                  isCurrent,
                  dimensions
                )}
              </AnimatedYStack>

              {/* Content */}
              {showLabels && (
                <YStack flex={1} gap="$1">
                  <XStack alignItems="center" gap="$2">
                    <Text
                      fontSize={dimensions.text}
                      fontWeight={isCurrent ? '600' : '400'}
                      color={
                        isCompleted 
                          ? completedColor 
                          : isCurrent 
                            ? activeColor 
                            : '$color9'
                      }
                    >
                      {step.title}
                    </Text>
                    
                    {step.isOptional && (
                      <Text fontSize="$1" color="$color9">
                        (Optionnel)
                      </Text>
                    )}
                  </XStack>
                  
                  {showDescriptions && step.description && (
                    <Text
                      fontSize={dimensions.desc}
                      color="$color9"
                      numberOfLines={3}
                    >
                      {step.description}
                    </Text>
                  )}
                </YStack>
              )}
            </AnimatedXStack>

            {/* Connecting line */}
            {index < steps.length - 1 && (
              <XStack paddingLeft={dimensions.circle / 2} marginLeft={-1}>
                <YStack 
                  width={2} 
                  height="$4" 
                  backgroundColor={index < currentStep ? completedColor : lineColor}
                  borderRadius="$1"
                />
              </XStack>
            )}
          </React.Fragment>
        );
      })}
    </YStack>
  );
}

/**
 * Rendu du contenu de l'étape selon le variant
 */
function renderStepContent(
  variant: string,
  step: any,
  index: number,
  isCompleted: boolean,
  isCurrent: boolean,
  dimensions: any
) {
  if (variant === 'icons' && step.icon) {
    return step.icon;
  }

  if (variant === 'dots') {
    return (
      <CircleIcon 
        size={dimensions.circle * 0.3} 
        color="white" 
        fill="white"
      />
    );
  }

  // Numbers (default)
  if (isCompleted) {
    return (
      <Check 
        size={dimensions.circle * 0.5} 
        color="white" 
        strokeWidth={3}
      />
    );
  }

  return (
    <Text 
      color="white" 
      fontSize={dimensions.text} 
      fontWeight="bold"
    >
      {index + 1}
    </Text>
  );
}

export default StepIndicator;