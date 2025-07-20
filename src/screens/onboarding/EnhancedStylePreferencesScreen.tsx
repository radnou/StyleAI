import React, { useState } from 'react';
import { YStack, XStack, Text, Button, Card, Image, Progress, Slider } from 'tamagui';
import { TouchableOpacity, ScrollView } from 'react-native';
import Animated, { 
  FadeInDown, 
  SlideInRight, 
  BounceIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { OnboardingStackScreenProps } from '@/navigation/types';
import { OnboardingContainer } from '@/shared/components/onboarding';
import { useOnboardingActions, useOnboarding } from '@/store/store';

const AnimatedYStack = Animated.createAnimatedComponent(YStack);
const AnimatedCard = Animated.createAnimatedComponent(Card);

type Props = OnboardingStackScreenProps<'StylePreferences'>;

interface StyleCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  colors: string[];
}

interface ColorOption {
  id: string;
  name: string;
  hex: string;
  category: string;
}

/**
 * Écran de configuration des préférences de style
 */
export function EnhancedStylePreferencesScreen({ navigation }: Props) {
  const { updateStylePreferences, completeStep, getCurrentStep } = useOnboardingActions();
  const onboarding = useOnboarding();
  
  const currentStep = getCurrentStep();
  const stepIndex = currentStep ? onboarding.steps.findIndex(s => s.id === currentStep.id) : 0;

  // États locaux
  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    onboarding.stylePreferences.preferredStyles
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    onboarding.stylePreferences.favoriteColors
  );
  const [budgetRange, setBudgetRange] = useState<[number, number]>([
    onboarding.stylePreferences.budgetRange?.min || 50,
    onboarding.stylePreferences.budgetRange?.max || 300
  ]);
  const [lifestyleType, setLifestyleType] = useState<string>(
    onboarding.stylePreferences.lifestyleType || ''
  );
  const [shoppingFrequency, setShoppingFrequency] = useState<string>(
    onboarding.stylePreferences.shoppingFrequency || ''
  );
  const [sustainabilityFocus, setSustainabilityFocus] = useState<boolean>(
    onboarding.stylePreferences.sustainabilityFocus || false
  );

  // Données de style
  const styleCategories: StyleCategory[] = [
    {
      id: 'casual',
      name: 'Décontracté',
      description: 'Confortable et relaxé pour tous les jours',
      image: '👕',
      colors: ['#E3F2FD', '#F3E5F5', '#E8F5E8']
    },
    {
      id: 'business',
      name: 'Professionnel',
      description: 'Élégant et sophistiqué pour le travail',
      image: '👔',
      colors: ['#F5F5F5', '#E1F5FE', '#FFF3E0']
    },
    {
      id: 'elegant',
      name: 'Élégant',
      description: 'Chic et raffiné pour les occasions spéciales',
      image: '👗',
      colors: ['#FCE4EC', '#F3E5F5', '#E8F5E8']
    },
    {
      id: 'streetwear',
      name: 'Streetwear',
      description: 'Tendance urbaine et moderne',
      image: '🧥',
      colors: ['#FFEBEE', '#F1F8E9', '#E3F2FD']
    },
    {
      id: 'bohemian',
      name: 'Bohème',
      description: 'Libre et artistique avec des influences ethniques',
      image: '🌸',
      colors: ['#FFF8E1', '#FCE4EC', '#F3E5F5']
    },
    {
      id: 'minimalist',
      name: 'Minimaliste',
      description: 'Simple, épuré et intemporel',
      image: '⚪',
      colors: ['#FAFAFA', '#F5F5F5', '#EEEEEE']
    }
  ];

  const colorOptions: ColorOption[] = [
    { id: 'navy', name: 'Bleu marine', hex: '#2C5AA0', category: 'Classique' },
    { id: 'black', name: 'Noir', hex: '#000000', category: 'Neutre' },
    { id: 'white', name: 'Blanc', hex: '#FFFFFF', category: 'Neutre' },
    { id: 'gray', name: 'Gris', hex: '#6B7280', category: 'Neutre' },
    { id: 'beige', name: 'Beige', hex: '#D4B896', category: 'Neutre' },
    { id: 'red', name: 'Rouge', hex: '#DC2626', category: 'Vibrant' },
    { id: 'pink', name: 'Rose', hex: '#EC4899', category: 'Vibrant' },
    { id: 'green', name: 'Vert', hex: '#059669', category: 'Nature' },
    { id: 'blue', name: 'Bleu', hex: '#2563EB', category: 'Classique' },
    { id: 'purple', name: 'Violet', hex: '#7C3AED', category: 'Vibrant' },
    { id: 'yellow', name: 'Jaune', hex: '#F59E0B', category: 'Vibrant' },
    { id: 'orange', name: 'Orange', hex: '#EA580C', category: 'Vibrant' },
  ];

  const lifestyleOptions = [
    { id: 'active', name: 'Actif', icon: '🏃‍♀️', description: 'Sport et activités physiques' },
    { id: 'professional', name: 'Professionnel', icon: '💼', description: 'Bureau et réunions' },
    { id: 'social', name: 'Social', icon: '🎉', description: 'Sorties et événements' },
    { id: 'creative', name: 'Créatif', icon: '🎨', description: 'Artistic et expression personnelle' },
    { id: 'family', name: 'Familial', icon: '👨‍👩‍👧‍👦', description: 'Confort et praticité' },
  ];

  const frequencyOptions = [
    { id: 'rarely', name: 'Rarement', description: 'Quelques fois par an' },
    { id: 'monthly', name: 'Mensuel', description: 'Une fois par mois' },
    { id: 'weekly', name: 'Hebdomadaire', description: 'Chaque semaine' },
    { id: 'frequently', name: 'Fréquemment', description: 'Plusieurs fois par semaine' },
  ];

  // Handlers
  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev => 
      prev.includes(styleId) 
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    );
  };

  const toggleColor = (colorId: string) => {
    setSelectedColors(prev => 
      prev.includes(colorId) 
        ? prev.filter(id => id !== colorId)
        : [...prev, colorId]
    );
  };

  const handleNext = () => {
    const preferences = {
      preferredStyles: selectedStyles,
      favoriteColors: selectedColors,
      budgetRange: { min: budgetRange[0], max: budgetRange[1] },
      lifestyleType,
      shoppingFrequency: shoppingFrequency as any,
      sustainabilityFocus,
    };

    updateStylePreferences(preferences);
    completeStep('style-preferences', preferences);
    navigation.navigate('Permissions');
  };

  const handlePrevious = () => {
    navigation.goBack();
  };

  const handleSkip = () => {
    navigation.navigate('Permissions');
  };

  const canProceed = selectedStyles.length > 0 && selectedColors.length > 0;

  return (
    <OnboardingContainer
      currentStep={stepIndex}
      totalSteps={onboarding.totalSteps}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSkip={handleSkip}
      nextDisabled={!canProceed}
      showSkip={false}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$6">
          {/* Header */}
          <AnimatedYStack entering={FadeInDown.delay(200).duration(600)}>
            <Text fontSize="$8" fontWeight="bold" color="$color12" marginBottom="$2">
              Définissez votre style
            </Text>
            <Text fontSize="$4" color="$color11" lineHeight="$5">
              Aidez-nous à comprendre vos préférences pour des recommandations personnalisées
            </Text>
          </AnimatedYStack>

          {/* Progress indicators */}
          <XStack gap="$2" alignItems="center">
            <Text fontSize="$3" color="$color11">Progression:</Text>
            <Text fontSize="$3" fontWeight="600" color="$blue10">
              {Math.round(((selectedStyles.length > 0 ? 1 : 0) + 
                         (selectedColors.length > 0 ? 1 : 0) + 
                         (lifestyleType ? 1 : 0)) / 3 * 100)}%
            </Text>
          </XStack>

          {/* Style Categories */}
          <AnimatedYStack 
            gap="$4"
            entering={SlideInRight.delay(400).duration(600)}
          >
            <YStack gap="$2">
              <Text fontSize="$6" fontWeight="600" color="$color12">
                <Ionicons name="shirt" size={20} /> Styles préférés
              </Text>
              <Text fontSize="$3" color="$color11">
                Sélectionnez jusqu'à 3 styles qui vous correspondent
              </Text>
            </YStack>

            <XStack flexWrap="wrap" gap="$3">
              {styleCategories.map((style, index) => {
                const isSelected = selectedStyles.includes(style.id);
                const isDisabled = !isSelected && selectedStyles.length >= 3;
                
                return (
                  <AnimatedCard
                    key={style.id}
                    entering={BounceIn.delay(index * 100).duration(500)}
                    flex={1}
                    minWidth="45%"
                    padding="$4"
                    backgroundColor={isSelected ? '$blue2' : '$background'}
                    borderColor={isSelected ? '$blue8' : '$borderColor'}
                    borderWidth={isSelected ? 2 : 1}
                    opacity={isDisabled ? 0.5 : 1}
                    pressStyle={{ scale: 0.95 }}
                    onPress={() => !isDisabled && toggleStyle(style.id)}
                  >
                    <YStack alignItems="center" gap="$2">
                      <Text fontSize="$7">{style.image}</Text>
                      <Text fontSize="$4" fontWeight="600" textAlign="center">
                        {style.name}
                      </Text>
                      <Text fontSize="$2" color="$color11" textAlign="center">
                        {style.description}
                      </Text>
                      {isSelected && (
                        <YStack 
                          position="absolute" 
                          top="$2" 
                          right="$2"
                          backgroundColor="$blue10"
                          borderRadius="$6"
                          padding="$1"
                        >
                          <Ionicons name="checkmark" size={12} color="white" />
                        </YStack>
                      )}
                    </YStack>
                  </AnimatedCard>
                );
              })}
            </XStack>
          </AnimatedYStack>

          {/* Color Preferences */}
          <AnimatedYStack 
            gap="$4"
            entering={SlideInRight.delay(600).duration(600)}
          >
            <YStack gap="$2">
              <Text fontSize="$6" fontWeight="600" color="$color12">
                <Ionicons name="palette" size={20} /> Couleurs favorites
              </Text>
              <Text fontSize="$3" color="$color11">
                Choisissez les couleurs que vous aimez porter
              </Text>
            </YStack>

            <YStack gap="$3">
              {['Neutre', 'Classique', 'Vibrant', 'Nature'].map(category => (
                <YStack key={category} gap="$2">
                  <Text fontSize="$4" fontWeight="500" color="$color12">
                    {category}
                  </Text>
                  <XStack flexWrap="wrap" gap="$2">
                    {colorOptions
                      .filter(color => color.category === category)
                      .map(color => {
                        const isSelected = selectedColors.includes(color.id);
                        return (
                          <TouchableOpacity
                            key={color.id}
                            onPress={() => toggleColor(color.id)}
                          >
                            <YStack
                              width={60}
                              height={60}
                              borderRadius="$3"
                              backgroundColor={color.hex}
                              borderWidth={isSelected ? 3 : 1}
                              borderColor={isSelected ? '$blue10' : '$borderColor'}
                              alignItems="center"
                              justifyContent="center"
                              position="relative"
                            >
                              {isSelected && (
                                <YStack
                                  backgroundColor="rgba(0,0,0,0.6)"
                                  borderRadius="$6"
                                  padding="$1"
                                >
                                  <Ionicons name="checkmark" size={16} color="white" />
                                </YStack>
                              )}
                            </YStack>
                          </TouchableOpacity>
                        );
                      })}
                  </XStack>
                </YStack>
              ))}
            </YStack>
          </AnimatedYStack>

          {/* Budget Range */}
          <AnimatedYStack 
            gap="$4"
            entering={SlideInRight.delay(800).duration(600)}
          >
            <YStack gap="$2">
              <Text fontSize="$6" fontWeight="600" color="$color12">
                <Ionicons name="cash" size={20} /> Budget shopping
              </Text>
              <Text fontSize="$3" color="$color11">
                Fourchette de prix par article (en €)
              </Text>
            </YStack>

            <YStack gap="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$4" fontWeight="500">
                  {budgetRange[0]}€ - {budgetRange[1]}€
                </Text>
                <Text fontSize="$3" color="$color11">
                  par pièce
                </Text>
              </XStack>
              
              {/* Slider component would go here - using buttons as placeholder */}
              <XStack gap="$2" flexWrap="wrap">
                {[
                  { min: 20, max: 50, label: '20-50€' },
                  { min: 50, max: 100, label: '50-100€' },
                  { min: 100, max: 200, label: '100-200€' },
                  { min: 200, max: 500, label: '200-500€' },
                ].map(range => (
                  <Button
                    key={range.label}
                    variant={budgetRange[0] === range.min ? "default" : "outlined"}
                    size="$3"
                    onPress={() => setBudgetRange([range.min, range.max])}
                  >
                    <Text>{range.label}</Text>
                  </Button>
                ))}
              </XStack>
            </YStack>
          </AnimatedYStack>

          {/* Lifestyle */}
          <AnimatedYStack 
            gap="$4"
            entering={SlideInRight.delay(1000).duration(600)}
          >
            <YStack gap="$2">
              <Text fontSize="$6" fontWeight="600" color="$color12">
                Mode de vie
              </Text>
              <Text fontSize="$3" color="$color11">
                Quel style de vie vous correspond le mieux ?
              </Text>
            </YStack>

            <XStack flexWrap="wrap" gap="$3">
              {lifestyleOptions.map(lifestyle => (
                <Button
                  key={lifestyle.id}
                  variant={lifestyleType === lifestyle.id ? "default" : "outlined"}
                  size="$4"
                  onPress={() => setLifestyleType(lifestyle.id)}
                  minWidth="45%"
                >
                  <XStack alignItems="center" gap="$2">
                    <Text fontSize="$4">{lifestyle.icon}</Text>
                    <Text>{lifestyle.name}</Text>
                  </XStack>
                </Button>
              ))}
            </XStack>
          </AnimatedYStack>

          {/* Shopping Frequency */}
          <AnimatedYStack 
            gap="$4"
            entering={SlideInRight.delay(1200).duration(600)}
          >
            <YStack gap="$2">
              <Text fontSize="$6" fontWeight="600" color="$color12">
                Fréquence d'achat
              </Text>
              <Text fontSize="$3" color="$color11">
                À quelle fréquence achetez-vous des vêtements ?
              </Text>
            </YStack>

            <YStack gap="$2">
              {frequencyOptions.map(freq => (
                <Button
                  key={freq.id}
                  variant={shoppingFrequency === freq.id ? "default" : "outlined"}
                  justifyContent="flex-start"
                  padding="$4"
                  onPress={() => setShoppingFrequency(freq.id)}
                >
                  <YStack alignItems="flex-start" gap="$1">
                    <Text fontWeight="600">{freq.name}</Text>
                    <Text fontSize="$2" color="$color11">{freq.description}</Text>
                  </YStack>
                </Button>
              ))}
            </YStack>
          </AnimatedYStack>

          {/* Sustainability */}
          <AnimatedYStack 
            gap="$4"
            entering={SlideInRight.delay(1400).duration(600)}
          >
            <Button
              variant={sustainabilityFocus ? "default" : "outlined"}
              onPress={() => setSustainabilityFocus(!sustainabilityFocus)}
              justifyContent="flex-start"
              padding="$4"
            >
              <XStack alignItems="center" gap="$3">
                <YStack
                  width={24}
                  height={24}
                  borderRadius="$2"
                  backgroundColor={sustainabilityFocus ? '$green10' : 'transparent'}
                  borderWidth={1}
                  borderColor={sustainabilityFocus ? '$green10' : '$borderColor'}
                  alignItems="center"
                  justifyContent="center"
                >
                  {sustainabilityFocus && <Ionicons name="checkmark" size={16} color="white" />}
                </YStack>
                <YStack alignItems="flex-start" gap="$1">
                  <Text fontWeight="600">Mode durable</Text>
                  <Text fontSize="$2" color="$color11">
                    Privilégier les marques éco-responsables
                  </Text>
                </YStack>
              </XStack>
            </Button>
          </AnimatedYStack>

          {/* Summary */}
          {canProceed && (
            <AnimatedYStack 
              backgroundColor="$blue2" 
              padding="$4" 
              borderRadius="$4"
              gap="$2"
              entering={BounceIn.delay(1600).duration(600)}
            >
              <Text fontSize="$4" fontWeight="600" color="$blue11">
                <Ionicons name="heart" size={16} /> Votre profil style
              </Text>
              <Text fontSize="$3" color="$blue11">
                {selectedStyles.length} style{selectedStyles.length > 1 ? 's' : ''} • {' '}
                {selectedColors.length} couleur{selectedColors.length > 1 ? 's' : ''} • {' '}
                Budget {budgetRange[0]}-{budgetRange[1]}€
              </Text>
            </AnimatedYStack>
          )}
        </YStack>
      </ScrollView>
    </OnboardingContainer>
  );
}

export default EnhancedStylePreferencesScreen;