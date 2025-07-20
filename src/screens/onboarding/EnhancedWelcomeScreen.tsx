import React, { useEffect, useState } from 'react';
import { YStack, XStack, Text, Button, Image, Circle } from 'tamagui';
import { StatusBar } from 'expo-status-bar';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolate
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { OnboardingStackScreenProps } from '@/navigation/types';
import { SimpleOnboardingContainer } from '@/shared/components/onboarding';
import { useOnboardingActions } from '@/store/store';

const AnimatedYStack = Animated.createAnimatedComponent(YStack);
const AnimatedText = Animated.createAnimatedComponent(Text);

type Props = OnboardingStackScreenProps<'Welcome'>;

/**
 * Écran de bienvenue amélioré avec animations et design moderne
 */
export function EnhancedWelcomeScreen({ navigation }: Props) {
  const { startOnboarding, completeStep } = useOnboardingActions();
  const [showContent, setShowContent] = useState(false);
  
  // Animations
  const logoScale = useSharedValue(0);
  const sparkleRotation = useSharedValue(0);

  useEffect(() => {
    // Démarrer l'onboarding
    startOnboarding();
    
    // Animer le logo
    logoScale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 100 }),
      withSpring(1, { damping: 12, stiffness: 100 })
    );

    // Rotation continue des sparkles
    sparkleRotation.value = withTiming(360, { duration: 3000 });

    // Afficher le contenu après un délai
    const timer = setTimeout(() => setShowContent(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotation.value}deg` }],
  }));

  const handleGetStarted = () => {
    completeStep('welcome');
    navigation.navigate('PersonalInfo');
  };

  return (
    <SimpleOnboardingContainer>
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

        {/* Decorative elements */}
        <YStack position="absolute" top="10%" right="10%">
          <Animated.View style={sparkleAnimatedStyle}>
            <Ionicons name="sparkles" size={24} color="rgba(255,255,255,0.6)" />
          </Animated.View>
        </YStack>
        
        <YStack position="absolute" top="20%" left="15%">
          <Ionicons name="heart" size={20} color="rgba(255,255,255,0.4)" />
        </YStack>
        
        <YStack position="absolute" bottom="25%" right="20%">
          <Ionicons name="star" size={18} color="rgba(255,255,255,0.5)" />
        </YStack>

        {/* Main content */}
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$6" paddingHorizontal="$6">
          
          {/* Logo section */}
          <AnimatedYStack entering={FadeInUp.delay(200).duration(800)} style={logoAnimatedStyle}>
            <YStack 
              alignItems="center" 
              justifyContent="center"
              width={120}
              height={120}
              borderRadius={60}
              backgroundColor="rgba(255,255,255,0.15)"
              borderWidth={2}
              borderColor="rgba(255,255,255,0.3)"
            >
              <Ionicons name="wand" size={60} color="white" />
            </YStack>
          </AnimatedYStack>

          {/* Title and subtitle */}
          {showContent && (
            <AnimatedYStack 
              alignItems="center" 
              gap="$4"
              entering={FadeInDown.delay(300).duration(800)}
            >
              <AnimatedText
                fontSize="$10"
                fontWeight="800"
                color="white"
                textAlign="center"
                entering={SlideInRight.delay(500).duration(600)}
              >
                Bienvenue sur StyleAI
              </AnimatedText>
              
              <AnimatedText
                fontSize="$5"
                color="rgba(255,255,255,0.9)"
                textAlign="center"
                lineHeight="$6"
                maxWidth={300}
                entering={SlideInRight.delay(600).duration(600)}
              >
                Votre assistant personnel en intelligence artificielle pour découvrir votre style unique
              </AnimatedText>
            </AnimatedYStack>
          )}

          {/* Features preview */}
          {showContent && (
            <AnimatedYStack 
              gap="$3" 
              marginTop="$4"
              entering={FadeInUp.delay(800).duration(600)}
            >
              {[
                { icon: "sparkles", text: "Recommandations personnalisées" },
                { icon: "heart", text: "Style adapté à votre personnalité" },
                { icon: "star", text: "Tendances et inspirations" }
              ].map((feature, index) => (
                <XStack 
                  key={index}
                  alignItems="center" 
                  gap="$3"
                  paddingVertical="$2"
                >
                  <Circle 
                    size={8} 
                    backgroundColor="rgba(255,255,255,0.6)" 
                  />
                  <Ionicons name={feature.icon as any} size={20} color="rgba(255,255,255,0.8)" />
                  <Text 
                    color="rgba(255,255,255,0.9)" 
                    fontSize="$4"
                    fontWeight="500"
                  >
                    {feature.text}
                  </Text>
                </XStack>
              ))}
            </AnimatedYStack>
          )}

          {/* CTA Button */}
          {showContent && (
            <AnimatedYStack 
              marginTop="$6" 
              width="100%"
              entering={FadeInUp.delay(1000).duration(600)}
            >
              <Button
                size="$5"
                backgroundColor="white"
                color="$blue10"
                borderRadius="$6"
                pressStyle={{
                  backgroundColor: '$gray2',
                  scale: 0.95,
                }}
                onPress={handleGetStarted}
                fontWeight="700"
                fontSize="$5"
                paddingVertical="$4"
              >
                Commencer l'aventure
              </Button>
              
              <Text 
                textAlign="center" 
                color="rgba(255,255,255,0.7)"
                fontSize="$2" 
                marginTop="$3"
              >
                Configuration en moins de 3 minutes
              </Text>
            </AnimatedYStack>
          )}
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

export default EnhancedWelcomeScreen;