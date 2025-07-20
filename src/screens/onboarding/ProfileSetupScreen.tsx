import React, { useState } from 'react';
import { YStack, XStack, Text, Input, Button, Select, Avatar, Sheet } from 'tamagui';
import { TouchableOpacity, Platform } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { OnboardingStackScreenProps } from '@/navigation/types';
import { OnboardingContainer } from '@/shared/components/onboarding';
import { useOnboardingActions, useOnboarding } from '@/store/store';

const AnimatedYStack = Animated.createAnimatedComponent(YStack);

type Props = OnboardingStackScreenProps<'PersonalInfo'>;

// Schema de validation
const profileSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  birthDate: z.string().optional(),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say']).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  occupation: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

/**
 * Écran de configuration du profil personnel
 */
export function ProfileSetupScreen({ navigation }: Props) {
  const { updatePersonalInfo, completeStep, getCurrentStep, canProceedToNext } = useOnboardingActions();
  const onboarding = useOnboarding();
  const [profileImage, setProfileImage] = useState<string | undefined>(onboarding.personalInfo.profilePictureUri);
  const [showCountrySelect, setShowCountrySelect] = useState(false);
  const [showGenderSelect, setShowGenderSelect] = useState(false);

  const currentStep = getCurrentStep();
  const stepIndex = currentStep ? onboarding.steps.findIndex(s => s.id === currentStep.id) : 0;

  const { control, handleSubmit, formState: { errors, isValid } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: onboarding.personalInfo.firstName || '',
      lastName: onboarding.personalInfo.lastName || '',
      birthDate: onboarding.personalInfo.birthDate?.toISOString().split('T')[0] || '',
      gender: onboarding.personalInfo.gender || undefined,
      country: onboarding.personalInfo.country || '',
      city: onboarding.personalInfo.city || '',
      occupation: onboarding.personalInfo.occupation || '',
    },
    mode: 'onChange',
  });

  const genderOptions = [
    { value: 'male', label: 'Homme' },
    { value: 'female', label: 'Femme' },
    { value: 'non-binary', label: 'Non-binaire' },
    { value: 'prefer-not-to-say', label: 'Préfère ne pas dire' },
  ];

  const countryOptions = [
    { value: 'fr', label: 'France' },
    { value: 'be', label: 'Belgique' },
    { value: 'ch', label: 'Suisse' },
    { value: 'ca', label: 'Canada' },
    { value: 'us', label: 'États-Unis' },
    { value: 'uk', label: 'Royaume-Uni' },
    { value: 'other', label: 'Autre' },
  ];

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Désolé, nous avons besoin de permissions pour accéder à vos photos!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
      updatePersonalInfo({ profilePictureUri: result.assets[0].uri });
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Désolé, nous avons besoin de permissions pour accéder à votre caméra!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
      updatePersonalInfo({ profilePictureUri: result.assets[0].uri });
    }
  };

  const onSubmit = (data: ProfileFormData) => {
    const personalInfo = {
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      profilePictureUri: profileImage,
    };
    
    updatePersonalInfo(personalInfo);
    completeStep('personal-info', personalInfo);
    navigation.navigate('StylePreferences');
  };

  const handleNext = () => {
    handleSubmit(onSubmit)();
  };

  const handlePrevious = () => {
    navigation.goBack();
  };

  const handleSkip = () => {
    navigation.navigate('StylePreferences');
  };

  return (
    <OnboardingContainer
      currentStep={stepIndex}
      totalSteps={onboarding.totalSteps}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSkip={handleSkip}
      nextDisabled={!isValid}
      showSkip={true}
    >
      <YStack flex={1} gap="$6">
        {/* Header */}
        <AnimatedYStack entering={FadeInDown.delay(200).duration(600)}>
          <Text fontSize="$8" fontWeight="bold" color="$color12" marginBottom="$2">
            Parlez-nous de vous
          </Text>
          <Text fontSize="$4" color="$color11" lineHeight="$5">
            Ces informations nous aident à personnaliser votre expérience StyleAI
          </Text>
        </AnimatedYStack>

        {/* Profile Picture */}
        <AnimatedYStack 
          alignItems="center" 
          gap="$3"
          entering={SlideInRight.delay(400).duration(600)}
        >
          <TouchableOpacity onPress={handleImagePicker}>
            <YStack position="relative">
              <Avatar circular size="$8" backgroundColor="$color4">
                {profileImage ? (
                  <Avatar.Image source={{ uri: profileImage }} />
                ) : (
                  <User size="$4" color="$color10" />
                )}
              </Avatar>
              
              <YStack
                position="absolute"
                bottom={0}
                right={0}
                backgroundColor="$blue10"
                borderRadius="$6"
                padding="$2"
                borderWidth={2}
                borderColor="$background"
              >
                <Ionicons name="camera" size={16} color="white" />
              </YStack>
            </YStack>
          </TouchableOpacity>
          
          <XStack gap="$3">
            <Button 
              size="$2" 
              variant="outlined" 
              onPress={handleImagePicker}
              chromeless
            >
              <Text fontSize="$2">Galerie</Text>
            </Button>
            <Button 
              size="$2" 
              variant="outlined" 
              onPress={handleTakePhoto}
              chromeless
            >
              <Text fontSize="$2">Photo</Text>
            </Button>
          </XStack>
        </AnimatedYStack>

        {/* Form Fields */}
        <AnimatedYStack 
          gap="$4"
          entering={SlideInRight.delay(600).duration(600)}
        >
          {/* Name fields */}
          <XStack gap="$3">
            <YStack flex={1}>
              <Text fontSize="$3" fontWeight="600" color="$color12" marginBottom="$2">
                Prénom *
              </Text>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Votre prénom"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    borderColor={errors.firstName ? '$red8' : '$borderColor'}
                    focusStyle={{ borderColor: '$blue8' }}
                  />
                )}
              />
              {errors.firstName && (
                <Text color="$red10" fontSize="$2" marginTop="$1">
                  {errors.firstName.message}
                </Text>
              )}
            </YStack>

            <YStack flex={1}>
              <Text fontSize="$3" fontWeight="600" color="$color12" marginBottom="$2">
                Nom *
              </Text>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Votre nom"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    borderColor={errors.lastName ? '$red8' : '$borderColor'}
                    focusStyle={{ borderColor: '$blue8' }}
                  />
                )}
              />
              {errors.lastName && (
                <Text color="$red10" fontSize="$2" marginTop="$1">
                  {errors.lastName.message}
                </Text>
              )}
            </YStack>
          </XStack>

          {/* Birth date */}
          <YStack>
            <Text fontSize="$3" fontWeight="600" color="$color12" marginBottom="$2">
              <Ionicons name="calendar" size={16} /> Date de naissance
            </Text>
            <Controller
              control={control}
              name="birthDate"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="AAAA-MM-JJ"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
                />
              )}
            />
          </YStack>

          {/* Gender */}
          <YStack>
            <Text fontSize="$3" fontWeight="600" color="$color12" marginBottom="$2">
              Genre
            </Text>
            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange, value } }) => (
                <Button
                  variant="outlined"
                  justifyContent="flex-start"
                  onPress={() => setShowGenderSelect(true)}
                >
                  <Text color="$color11">
                    {value ? genderOptions.find(g => g.value === value)?.label : 'Sélectionner...'}
                  </Text>
                </Button>
              )}
            />
          </YStack>

          {/* Location */}
          <XStack gap="$3">
            <YStack flex={1}>
              <Text fontSize="$3" fontWeight="600" color="$color12" marginBottom="$2">
                <Ionicons name="mappin" size={16} /> Pays
              </Text>
              <Controller
                control={control}
                name="country"
                render={({ field: { onChange, value } }) => (
                  <Button
                    variant="outlined"
                    justifyContent="flex-start"
                    onPress={() => setShowCountrySelect(true)}
                  >
                    <Text color="$color11">
                      {value ? countryOptions.find(c => c.value === value)?.label : 'Pays...'}
                    </Text>
                  </Button>
                )}
              />
            </YStack>

            <YStack flex={1}>
              <Text fontSize="$3" fontWeight="600" color="$color12" marginBottom="$2">
                Ville
              </Text>
              <Controller
                control={control}
                name="city"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Votre ville"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </YStack>
          </XStack>

          {/* Occupation */}
          <YStack>
            <Text fontSize="$3" fontWeight="600" color="$color12" marginBottom="$2">
              <Ionicons name="briefcase" size={16} /> Profession
            </Text>
            <Controller
              control={control}
              name="occupation"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Votre profession"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </YStack>
        </AnimatedYStack>

        {/* Gender Selection Sheet */}
        <Sheet
          modal
          open={showGenderSelect}
          onOpenChange={setShowGenderSelect}
          snapPointsMode="fit"
          dismissOnSnapToBottom
        >
          <Sheet.Overlay />
          <Sheet.Frame padding="$4">
            <Sheet.Handle />
            <YStack gap="$3">
              <Text fontSize="$5" fontWeight="600" textAlign="center" marginBottom="$2">
                Sélectionner votre genre
              </Text>
              {genderOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="outlined"
                  onPress={() => {
                    // Set gender value via controller
                    setShowGenderSelect(false);
                  }}
                >
                  <Text>{option.label}</Text>
                </Button>
              ))}
            </YStack>
          </Sheet.Frame>
        </Sheet>

        {/* Country Selection Sheet */}
        <Sheet
          modal
          open={showCountrySelect}
          onOpenChange={setShowCountrySelect}
          snapPointsMode="fit"
          dismissOnSnapToBottom
        >
          <Sheet.Overlay />
          <Sheet.Frame padding="$4" maxHeight="80%">
            <Sheet.Handle />
            <Sheet.ScrollView>
              <YStack gap="$3">
                <Text fontSize="$5" fontWeight="600" textAlign="center" marginBottom="$2">
                  Sélectionner votre pays
                </Text>
                {countryOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant="outlined"
                    onPress={() => {
                      // Set country value via controller
                      setShowCountrySelect(false);
                    }}
                  >
                    <Text>{option.label}</Text>
                  </Button>
                ))}
              </YStack>
            </Sheet.ScrollView>
          </Sheet.Frame>
        </Sheet>
      </YStack>
    </OnboardingContainer>
  );
}

export default ProfileSetupScreen;