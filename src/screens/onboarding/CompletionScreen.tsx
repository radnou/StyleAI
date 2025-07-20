import React, { useEffect } from 'react';
import { YStack, XStack, Text, Button, Circle } from 'tamagui';
import { StatusBar } from 'expo-status-bar';
import Animated, { 
  FadeInUp, 
  FadeInDown, 
  SlideInRight,
  BounceIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { OnboardingStackScreenProps } from '@/navigation/types';
import { SimpleOnboardingContainer } from '@/shared/components/onboarding';
import { useOnboardingActions, useOnboarding, useAppActions } from '@/store/store';

const AnimatedYStack = Animated.createAnimatedComponent(YStack);
const AnimatedText = Animated.createAnimatedComponent(Text);

type Props = OnboardingStackScreenProps<'Complete'>;

/**
 * Écran de completion de l'onboarding
 */
export function CompletionScreen({ navigation }: Props) {
  const { completeOnboarding, completeStep } = useOnboardingActions();
  const { setOnboardingCompleted, showNotification } = useAppActions();
  const onboarding = useOnboarding();

  // Animations
  const checkScale = useSharedValue(0);
  const sparkleRotation = useSharedValue(0);
  const confettiOpacity = useSharedValue(0);

  useEffect(() => {
    // Animer le check
    checkScale.value = withSequence(
      withDelay(500, withSpring(1.2, { damping: 8, stiffness: 100 })),
      withSpring(1, { damping: 12, stiffness: 100 })
    );

    // Rotation continue des sparkles
    sparkleRotation.value = withTiming(360, { duration: 2000 });

    // Confetti effect
    confettiOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));

    // Marquer l'étape comme complétée
    completeStep('complete');
  }, []);

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotation.value}deg` }],
  }));

  const confettiAnimatedStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
  }));

  const handleComplete = () => {
    // Finaliser l'onboarding
    completeOnboarding();
    setOnboardingCompleted(true);
    
    // Afficher une notification de bienvenue
    showNotification({
      type: 'success',
      title: 'Bienvenue dans StyleAI !',
      message: 'Votre configuration est terminée. Prêt à découvrir votre style ?',
      duration: 5000,
    });

    // Rediriger vers l'application principale
    // La navigation sera gérée automatiquement par le RootNavigator
  };

  const getCompletionStats = () => {
    const completedSteps = Array.from(onboarding.completedSteps);
    const hasPersonalInfo = onboarding.personalInfo.firstName && onboarding.personalInfo.lastName;
    const hasStylePrefs = onboarding.stylePreferences.preferredStyles.length > 0;
    const hasPermissions = onboarding.permissions.camera.granted || onboarding.permissions.photos.granted;

    return {
      completedSteps: completedSteps.length,
      totalSteps: onboarding.totalSteps,
      hasPersonalInfo,
      hasStylePrefs,
      hasPermissions,
      completionPercentage: Math.round((completedSteps.length / onboarding.totalSteps) * 100),
    };
  };

  const stats = getCompletionStats();

  return (
    <SimpleOnboardingContainer backgroundColor="$backgroundStrong">
      <StatusBar style="light" backgroundColor="#1a1a2e" />
      
      <YStack flex={1} backgroundColor="$backgroundStrong" position="relative">
        {/* Background gradient effect */}
        <YStack 
          position="absolute" 
          top={0} 
          left={0} 
          right={0} 
          bottom={0}
          backgroundColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          opacity={0.9}
        />

        {/* Confetti decorations */}
        <Animated.View style={[confettiAnimatedStyle, { position: 'absolute', top: '15%', left: '10%' }]}>
          <Ionicons name="star" size={20} color="rgba(255,255,255,0.8)" />
        </Animated.View>
        <Animated.View style={[confettiAnimatedStyle, { position: 'absolute', top: '20%', right: '15%' }]}>
          <Ionicons name="heart" size={16} color="rgba(255,255,255,0.7)" />
        </Animated.View>
        <Animated.View style={[confettiAnimatedStyle, { position: 'absolute', top: '25%', left: '20%' }]}>
          <Circle size={12} color="rgba(255,255,255,0.6)" />
        </Animated.View>
        <Animated.View style={[confettiAnimatedStyle, { position: 'absolute', bottom: '30%', right: '10%' }]}>
          <Ionicons name="sparkles" size={18} color="rgba(255,255,255,0.8)" />
        </Animated.View>

        {/* Main content */}
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$8" paddingHorizontal="$6">
          
          {/* Success icon */}
          <AnimatedYStack 
            entering={FadeInUp.delay(200).duration(800)}
            style={checkAnimatedStyle}
          >
            <YStack 
              alignItems="center" 
              justifyContent="center"
              width={120}
              height={120}
              borderRadius={60}
              backgroundColor="rgba(255,255,255,0.15)"
              borderWidth={3}
              borderColor="rgba(255,255,255,0.3)"
              position="relative"
            >
              <Ionicons name="checkcircle" size={60} color="white" />
              
              {/* Rotating sparkle */}
              <Animated.View 
                style={[
                  sparkleAnimatedStyle,
                  { position: 'absolute', top: -10, right: -10 }
                ]}
              >
                <Ionicons name="sparkles" size={24} color="rgba(255,255,255,0.8)" />
              </Animated.View>
            </YStack>
          </AnimatedYStack>

          {/* Title and message */}
          <AnimatedYStack 
            alignItems="center" 
            gap="$4"
            entering={FadeInDown.delay(600).duration(800)}
          >
            <AnimatedText
              fontSize="$10"
              fontWeight="800"
              color="white"
              textAlign="center"
              entering={SlideInRight.delay(800).duration(600)}
            >
              Configuration terminée !
            </AnimatedText>
            
            <AnimatedText
              fontSize="$5"
              color="rgba(255,255,255,0.9)"
              textAlign="center"
              lineHeight="$6"
              maxWidth={320}
              entering={SlideInRight.delay(900).duration(600)}
            >
              Félicitations ! Votre profil StyleAI est maintenant configuré et prêt à vous accompagner
            </AnimatedText>
          </AnimatedYStack>

          {/* Completion stats */}
          <AnimatedYStack 
            gap="$4" 
            alignItems="center"
            entering={BounceIn.delay(1000).duration(600)}
          >
            <YStack 
              backgroundColor="rgba(255,255,255,0.15)"
              padding="$4"
              borderRadius="$6"
              alignItems="center"
              gap="$3"
              minWidth={280}
            >
              <Text fontSize="$4" color="rgba(255,255,255,0.8)" fontWeight="600">
                Votre configuration
              </Text>
              
              <YStack gap="$2" width="100%">
                {stats.hasPersonalInfo && (
                  <XStack alignItems="center" gap="$3">
                    <Ionicons name="checkcircle" size={16} color="rgba(255,255,255,0.9)" />
                    <Text color="rgba(255,255,255,0.9)" fontSize="$3">
                      Profil personnel configuré
                    </Text>
                  </XStack>
                )}
                
                {stats.hasStylePrefs && (
                  <XStack alignItems="center" gap="$3">
                    <Ionicons name="checkcircle" size={16} color="rgba(255,255,255,0.9)" />
                    <Text color="rgba(255,255,255,0.9)" fontSize="$3">
                      Préférences de style définies
                    </Text>
                  </XStack>
                )}
                
                {stats.hasPermissions && (
                  <XStack alignItems="center" gap="$3">
                    <Ionicons name="checkcircle" size={16} color="rgba(255,255,255,0.9)" />
                    <Text color="rgba(255,255,255,0.9)" fontSize="$3">
                      Permissions accordées
                    </Text>
                  </XStack>
                )}
              </YStack>

              <YStack 
                backgroundColor="rgba(255,255,255,0.2)"
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius="$3"
              >
                <Text color="white" fontSize="$2" fontWeight="600">
                  {stats.completionPercentage}% complété
                </Text>
              </YStack>
            </YStack>
          </AnimatedYStack>

          {/* Call to action */}
          <AnimatedYStack 
            marginTop="$4" 
            width="100%"
            gap="$3"
            entering={FadeInUp.delay(1200).duration(600)}
          >
            <Button
              size="$6"
              backgroundColor="white"
              color="$blue10"
              borderRadius="$6"
              pressStyle={{
                backgroundColor: '$gray2',
                scale: 0.95,
              }}
              onPress={handleComplete}
              fontWeight="700"
              fontSize="$5"
              paddingVertical="$4"
            >
              <XStack alignItems="center" gap="$3">
                <Text fontSize="$5" fontWeight="700">
                  Découvrir StyleAI
                </Text>
                <Ionicons name="arrow-forward" size={20} color="$blue10" />
              </XStack>
            </Button>
            
            <Text 
              textAlign="center" 
              color="rgba(255,255,255,0.7)"
              fontSize="$3" 
            >
              Votre aventure style commence maintenant !
            </Text>
          </AnimatedYStack>
        </YStack>

        {/* Bottom decoration */}
        <YStack 
          position="absolute" 
          bottom={0} 
          left={0} 
          right={0} 
          height={100}
          opacity={0.1}
        >
          <YStack flex={1} backgroundColor="rgba(255,255,255,0.05)" />
        </YStack>
      </YStack>
    </SimpleOnboardingContainer>
  );
}

export default CompletionScreen;