import React, { useState, useRef, useEffect, useMemo } from 'react';
import { YStack, XStack, Text, Button, Card, Circle, Progress } from 'tamagui';
import { TouchableOpacity, BackHandler, Dimensions } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInUp, 
  SlideOutDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedYStack = Animated.createAnimatedComponent(YStack);

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface TourStep {
  id: string;
  target?: React.RefObject<any>;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  showOverlay?: boolean;
  highlightTarget?: boolean;
  action?: {
    text: string;
    onPress: () => void;
  };
  beforeStep?: () => void;
  afterStep?: () => void;
  canSkip?: boolean;
}

export interface GuidedTourProps {
  steps: TourStep[];
  visible: boolean;
  onComplete: () => void;
  onSkip?: () => void;
  onStepChange?: (stepIndex: number, step: TourStep) => void;
  maskColor?: string;
  highlightColor?: string;
  autoProgress?: boolean;
  showProgress?: boolean;
  allowBackNavigation?: boolean;
}

/**
 * Composant de visite guidée
 */
export function GuidedTour({
  steps,
  visible,
  onComplete,
  onSkip,
  onStepChange,
  maskColor = 'rgba(0,0,0,0.6)',
  highlightColor = '#007AFF',
  autoProgress = false,
  showProgress = true,
  allowBackNavigation = true,
}: GuidedTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(visible);
  const [targetCoords, setTargetCoords] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const overlayOpacity = useSharedValue(0);
  const highlightScale = useSharedValue(0);

  const currentStep = useMemo(() => steps[currentStepIndex], [steps, currentStepIndex]);

  useEffect(() => {
    setIsVisible(visible);
    if (visible) {
      setCurrentStepIndex(0);
      overlayOpacity.value = withTiming(1, { duration: 300 });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  useEffect(() => {
    if (currentStep && visible) {
      // Execute beforeStep callback
      currentStep.beforeStep?.();
      
      // Measure target element
      if (currentStep.target?.current) {
        measureTarget();
      }
      
      // Highlight animation
      highlightScale.value = withSpring(1, { damping: 15, stiffness: 100 });
      
      // Notify step change
      onStepChange?.(currentStepIndex, currentStep);
      
      // Auto progress
      if (autoProgress && currentStepIndex < steps.length - 1) {
        const timer = setTimeout(() => {
          nextStep();
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentStepIndex, currentStep, visible]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        handleSkip();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible]);

  const measureTarget = () => {
    if (!currentStep?.target?.current) return;

    currentStep.target.current.measure(
      (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        setTargetCoords({ x: pageX, y: pageY, width, height });
      }
    );
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      // Execute afterStep callback
      currentStep?.afterStep?.();
      
      highlightScale.value = 0;
      setCurrentStepIndex(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      highlightScale.value = 0;
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      highlightScale.value = 0;
      setCurrentStepIndex(stepIndex);
    }
  };

  const completeTour = () => {
    currentStep?.afterStep?.();
    overlayOpacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onComplete)();
      runOnJS(setIsVisible)(false);
    });
  };

  const handleSkip = () => {
    overlayOpacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(() => {
        onSkip?.();
        setIsVisible(false);
      })();
    });
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const highlightStyle = useAnimatedStyle(() => ({
    transform: [{ scale: highlightScale.value }],
  }));

  const getTooltipPosition = () => {
    if (!currentStep?.target || currentStep.position === 'center') {
      return { x: screenWidth / 2, y: screenHeight / 2 };
    }

    const { x, y, width, height } = targetCoords;
    const tooltipWidth = 300;
    const tooltipHeight = 200;

    switch (currentStep.position) {
      case 'top':
        return { 
          x: x + width / 2 - tooltipWidth / 2, 
          y: y - tooltipHeight - 20 
        };
      case 'bottom':
        return { 
          x: x + width / 2 - tooltipWidth / 2, 
          y: y + height + 20 
        };
      case 'left':
        return { 
          x: x - tooltipWidth - 20, 
          y: y + height / 2 - tooltipHeight / 2 
        };
      case 'right':
        return { 
          x: x + width + 20, 
          y: y + height / 2 - tooltipHeight / 2 
        };
      default:
        return { 
          x: Math.max(20, Math.min(x + width / 2 - tooltipWidth / 2, screenWidth - tooltipWidth - 20)), 
          y: y + height + 20 
        };
    }
  };

  const tooltipPosition = getTooltipPosition();

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay with mask */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: maskColor,
            zIndex: 1000,
          },
          overlayStyle,
        ]}
        pointerEvents="box-none"
      >
        {/* Target highlight */}
        {currentStep?.highlightTarget && currentStep.target && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: targetCoords.x - 8,
                top: targetCoords.y - 8,
                width: targetCoords.width + 16,
                height: targetCoords.height + 16,
                borderRadius: 8,
                borderWidth: 3,
                borderColor: highlightColor,
                backgroundColor: 'transparent',
              },
              highlightStyle,
            ]}
            pointerEvents="none"
          />
        )}

        {/* Clear area around target */}
        {currentStep?.target && currentStep.showOverlay !== false && (
          <YStack
            position="absolute"
            left={targetCoords.x - 4}
            top={targetCoords.y - 4}
            width={targetCoords.width + 8}
            height={targetCoords.height + 8}
            backgroundColor="transparent"
            borderRadius="$3"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: 20,
              elevation: 20,
            }}
          />
        )}
      </Animated.View>

      {/* Tooltip */}
      <AnimatedCard
        entering={SlideInUp.duration(400)}
        exiting={SlideOutDown.duration(300)}
        position="absolute"
        left={Math.max(20, Math.min(tooltipPosition.x, screenWidth - 320))}
        top={Math.max(60, Math.min(tooltipPosition.y, screenHeight - 300))}
        width={300}
        backgroundColor="$backgroundStrong"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius="$6"
        padding="$4"
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.3}
        shadowRadius={12}
        elevation={8}
        zIndex={1001}
      >
        <YStack gap="$4">
          {/* Header */}
          <XStack alignItems="flex-start" justifyContent="space-between">
            <YStack flex={1}>
              <XStack alignItems="center" gap="$2" marginBottom="$2">
                <Ionicons name="target" size={16} color="$blue10" />
                <Text fontSize="$5" fontWeight="700" color="$color12">
                  {currentStep?.title}
                </Text>
              </XStack>
              <Text fontSize="$3" color="$color11" lineHeight="$5">
                {currentStep?.content}
              </Text>
            </YStack>
            
            <TouchableOpacity onPress={handleSkip}>
              <YStack
                width={32}
                height={32}
                alignItems="center"
                justifyContent="center"
                borderRadius="$3"
                backgroundColor="$color4"
                marginLeft="$3"
              >
                <Ionicons name="close" size={16} color="$color10" />
              </YStack>
            </TouchableOpacity>
          </XStack>

          {/* Progress indicator */}
          {showProgress && (
            <YStack gap="$2">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$2" color="$color11">
                  Étape {currentStepIndex + 1} sur {steps.length}
                </Text>
                <Text fontSize="$2" color="$color11">
                  {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
                </Text>
              </XStack>
              <Progress 
                value={((currentStepIndex + 1) / steps.length) * 100}
                backgroundColor="$color4"
                height={4}
                borderRadius="$2"
              >
                <Progress.Indicator 
                  animation="bouncy" 
                  backgroundColor="$blue10" 
                />
              </Progress>
            </YStack>
          )}

          {/* Step dots */}
          <XStack justifyContent="center" gap="$2">
            {steps.map((_, index) => (
              <TouchableOpacity key={index} onPress={() => goToStep(index)}>
                <Circle
                  size={8}
                  backgroundColor={
                    index === currentStepIndex 
                      ? '$blue10' 
                      : index < currentStepIndex 
                        ? '$green10' 
                        : '$color6'
                  }
                />
              </TouchableOpacity>
            ))}
          </XStack>

          {/* Custom action */}
          {currentStep?.action && (
            <Button
              onPress={currentStep.action.onPress}
              backgroundColor="$green10"
              size="$3"
            >
              <Text color="white" fontWeight="600">
                {currentStep.action.text}
              </Text>
            </Button>
          )}

          {/* Navigation */}
          <XStack justifyContent="space-between" alignItems="center">
            <Button
              variant="outlined"
              size="$3"
              onPress={previousStep}
              disabled={currentStepIndex === 0 || !allowBackNavigation}
              opacity={currentStepIndex === 0 || !allowBackNavigation ? 0.5 : 1}
            >
              <XStack alignItems="center" gap="$2">
                <Ionicons name="chevron-back" size={16} />
                <Text fontSize="$3">Précédent</Text>
              </XStack>
            </Button>

            <XStack gap="$2">
              {currentStep?.canSkip !== false && (
                <Button
                  variant="ghost"
                  size="$3"
                  onPress={handleSkip}
                  chromeless
                >
                  <Text fontSize="$3" color="$color11">
                    Passer
                  </Text>
                </Button>
              )}
              
              <Button
                size="$3"
                onPress={nextStep}
                backgroundColor="$blue10"
              >
                <XStack alignItems="center" gap="$2">
                  <Text color="white" fontSize="$3" fontWeight="600">
                    {currentStepIndex === steps.length - 1 ? 'Terminer' : 'Suivant'}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="white" />
                </XStack>
              </Button>
            </XStack>
          </XStack>
        </YStack>
      </AnimatedCard>
    </>
  );
}

/**
 * Hook pour gérer les visites guidées
 */
export function useGuidedTour() {
  const [activeTour, setActiveTour] = useState<string | null>(null);
  const [completedTours, setCompletedTours] = useState<Set<string>>(new Set());

  const startTour = (tourId: string) => {
    setActiveTour(tourId);
  };

  const completeTour = (tourId: string) => {
    setCompletedTours(prev => new Set(prev).add(tourId));
    setActiveTour(null);
  };

  const skipTour = () => {
    setActiveTour(null);
  };

  const isTourActive = (tourId: string) => {
    return activeTour === tourId;
  };

  const isTourCompleted = (tourId: string) => {
    return completedTours.has(tourId);
  };

  const resetTours = () => {
    setCompletedTours(new Set());
    setActiveTour(null);
  };

  return {
    activeTour,
    startTour,
    completeTour,
    skipTour,
    isTourActive,
    isTourCompleted,
    resetTours,
    completedTours,
  };
}

/**
 * Composant pour déclencher une visite guidée
 */
export function TourTrigger({
  tourId,
  children,
  triggerOnMount = false,
}: {
  tourId: string;
  children: React.ReactNode;
  triggerOnMount?: boolean;
}) {
  const { startTour, isTourCompleted } = useGuidedTour();

  useEffect(() => {
    if (triggerOnMount && !isTourCompleted(tourId)) {
      const timer = setTimeout(() => {
        startTour(tourId);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [triggerOnMount, tourId]);

  return (
    <TouchableOpacity onPress={() => startTour(tourId)}>
      {children}
    </TouchableOpacity>
  );
}

export default GuidedTour;