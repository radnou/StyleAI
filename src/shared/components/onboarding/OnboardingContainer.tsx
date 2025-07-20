import React from 'react';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { YStack, XStack, Button, Text, Progress } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  SlideInRight, 
  SlideOutLeft 
} from 'react-native-reanimated';

const AnimatedYStack = Animated.createAnimatedComponent(YStack);

export interface OnboardingContainerProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  previousLabel?: string;
  skipLabel?: string;
  showProgress?: boolean;
  showSkip?: boolean;
  nextDisabled?: boolean;
  previousDisabled?: boolean;
  isLastStep?: boolean;
  backgroundColor?: string;
  contentPadding?: number;
}

/**
 * Container principal pour les écrans d'onboarding
 * Fournit la structure de base avec progress bar, navigation et animations
 */
export function OnboardingContainer({
  children,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  nextLabel = 'Suivant',
  previousLabel = 'Précédent',
  skipLabel = 'Passer',
  showProgress = true,
  showSkip = true,
  nextDisabled = false,
  previousDisabled = false,
  isLastStep = false,
  backgroundColor = '$background',
  contentPadding = 20,
}: OnboardingContainerProps) {
  const progress = (currentStep + 1) / totalSteps;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <YStack flex={1} backgroundColor={backgroundColor}>
          {/* Header avec progress bar */}
          {showProgress && (
            <AnimatedYStack 
              padding="$4" 
              paddingBottom="$2"
              entering={FadeInUp.delay(200).duration(600)}
            >
              <XStack alignItems="center" justifyContent="space-between" marginBottom="$3">
                <Text fontSize="$2" color="$color10" fontWeight="500">
                  {currentStep + 1} sur {totalSteps}
                </Text>
                {showSkip && onSkip && !isLastStep && (
                  <Button
                    variant="ghost"
                    size="$2"
                    onPress={onSkip}
                    chromeless
                  >
                    <Text color="$color11" fontSize="$3">
                      {skipLabel}
                    </Text>
                  </Button>
                )}
              </XStack>
              
              <Progress 
                value={progress * 100} 
                backgroundColor="$color4"
                borderRadius="$2"
                height={4}
              >
                <Progress.Indicator 
                  animation="bouncy" 
                  backgroundColor="$blue10" 
                />
              </Progress>
            </AnimatedYStack>
          )}

          {/* Contenu principal */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ 
              flexGrow: 1,
              padding: contentPadding 
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <AnimatedYStack 
              flex={1}
              entering={SlideInRight.delay(300).duration(600)}
              exiting={SlideOutLeft.duration(400)}
            >
              {children}
            </AnimatedYStack>
          </ScrollView>

          {/* Footer avec navigation */}
          <AnimatedYStack 
            padding="$4" 
            paddingTop="$2"
            borderTopWidth={1}
            borderTopColor="$borderColor"
            backgroundColor="$background"
            entering={FadeInDown.delay(400).duration(600)}
          >
            <XStack gap="$3" justifyContent="space-between">
              {/* Bouton précédent */}
              <Button
                variant="outlined"
                size="$4"
                flex={1}
                onPress={onPrevious}
                disabled={previousDisabled || currentStep === 0}
                opacity={previousDisabled || currentStep === 0 ? 0.5 : 1}
              >
                <Text fontSize="$4" fontWeight="600">
                  {previousLabel}
                </Text>
              </Button>

              {/* Bouton suivant */}
              <Button
                size="$4"
                flex={1}
                onPress={onNext}
                disabled={nextDisabled}
                backgroundColor={nextDisabled ? '$color6' : '$blue10'}
                borderColor={nextDisabled ? '$color6' : '$blue10'}
                pressStyle={{
                  backgroundColor: '$blue11',
                  borderColor: '$blue11',
                }}
              >
                <Text 
                  color={nextDisabled ? '$color9' : 'white'} 
                  fontSize="$4" 
                  fontWeight="600"
                >
                  {isLastStep ? 'Terminer' : nextLabel}
                </Text>
              </Button>
            </XStack>
          </AnimatedYStack>
        </YStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/**
 * Version simplifiée du container sans navigation
 */
export function SimpleOnboardingContainer({
  children,
  backgroundColor = '$background',
  contentPadding = 20,
}: {
  children: React.ReactNode;
  backgroundColor?: string;
  contentPadding?: number;
}) {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <YStack flex={1} backgroundColor={backgroundColor}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ 
              flexGrow: 1,
              padding: contentPadding 
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <AnimatedYStack 
              flex={1}
              entering={FadeInUp.delay(200).duration(800)}
            >
              {children}
            </AnimatedYStack>
          </ScrollView>
        </YStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default OnboardingContainer;