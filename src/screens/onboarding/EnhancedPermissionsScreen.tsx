import React, { useState, useEffect } from 'react';
import { YStack, XStack, Text, Button, Card, Circle } from 'tamagui';
import { Alert, Linking } from 'react-native';
import Animated, { 
  FadeInDown, 
  SlideInRight, 
  BounceIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';

import { OnboardingStackScreenProps } from '@/navigation/types';
import { OnboardingContainer } from '@/shared/components/onboarding';
import { useOnboardingActions, useOnboarding } from '@/store/store';

const AnimatedYStack = Animated.createAnimatedComponent(YStack);
const AnimatedCard = Animated.createAnimatedComponent(Card);

type Props = OnboardingStackScreenProps<'Permissions'>;

interface Permission {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;
  icon: React.ComponentType<any>;
  isEssential: boolean;
  status: 'pending' | 'granted' | 'denied';
  onRequest: () => Promise<boolean>;
}

/**
 * Écran de gestion des permissions avec explications contextuelles
 */
export function EnhancedPermissionsScreen({ navigation }: Props) {
  const { 
    updatePermissions, 
    completeStep, 
    getCurrentStep,
    requestCameraPermission,
    requestPhotosPermission,
    requestNotificationsPermission 
  } = useOnboardingActions();
  const onboarding = useOnboarding();
  
  const currentStep = getCurrentStep();
  const stepIndex = currentStep ? onboarding.steps.findIndex(s => s.id === currentStep.id) : 0;

  const [permissionStates, setPermissionStates] = useState<Record<string, 'pending' | 'granted' | 'denied'>>({
    camera: 'pending',
    photos: 'pending',
    notifications: 'pending',
  });

  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    camera: false,
    photos: false,
    notifications: false,
  });

  // Vérifier les permissions existantes au chargement
  useEffect(() => {
    checkExistingPermissions();
  }, []);

  const checkExistingPermissions = async () => {
    try {
      // Vérifier les permissions existantes
      const [cameraStatus, mediaLibraryStatus, notificationStatus] = await Promise.all([
        ImagePicker.getCameraPermissionsAsync(),
        ImagePicker.getMediaLibraryPermissionsAsync(),
        Notifications.getPermissionsAsync(),
      ]);

      setPermissionStates({
        camera: cameraStatus.granted ? 'granted' : cameraStatus.canAskAgain ? 'pending' : 'denied',
        photos: mediaLibraryStatus.granted ? 'granted' : mediaLibraryStatus.canAskAgain ? 'pending' : 'denied',
        notifications: notificationStatus.granted ? 'granted' : notificationStatus.canAskAgain ? 'pending' : 'denied',
      });

      // Mettre à jour le store avec les permissions existantes
      updatePermissions({
        camera: {
          requested: true,
          granted: cameraStatus.granted,
          denied: !cameraStatus.granted && !cameraStatus.canAskAgain,
        },
        photos: {
          requested: true,
          granted: mediaLibraryStatus.granted,
          denied: !mediaLibraryStatus.granted && !mediaLibraryStatus.canAskAgain,
        },
        notifications: {
          requested: true,
          granted: notificationStatus.granted,
          denied: !notificationStatus.granted && !notificationStatus.canAskAgain,
        },
      });
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
    }
  };

  const handleCameraPermission = async (): Promise<boolean> => {
    try {
      const result = await ImagePicker.requestCameraPermissionsAsync();
      const granted = result.granted;
      
      setPermissionStates(prev => ({ ...prev, camera: granted ? 'granted' : 'denied' }));
      
      updatePermissions({
        camera: {
          requested: true,
          granted,
          denied: !granted,
          requestedAt: new Date(),
        }
      });

      return granted;
    } catch (error) {
      console.error('Erreur demande permission caméra:', error);
      return false;
    }
  };

  const handlePhotosPermission = async (): Promise<boolean> => {
    try {
      const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const granted = result.granted;
      
      setPermissionStates(prev => ({ ...prev, photos: granted ? 'granted' : 'denied' }));
      
      updatePermissions({
        photos: {
          requested: true,
          granted,
          denied: !granted,
          requestedAt: new Date(),
        }
      });

      return granted;
    } catch (error) {
      console.error('Erreur demande permission photos:', error);
      return false;
    }
  };

  const handleNotificationsPermission = async (): Promise<boolean> => {
    try {
      const result = await Notifications.requestPermissionsAsync();
      const granted = result.granted;
      
      setPermissionStates(prev => ({ ...prev, notifications: granted ? 'granted' : 'denied' }));
      
      updatePermissions({
        notifications: {
          requested: true,
          granted,
          denied: !granted,
          requestedAt: new Date(),
        }
      });

      return granted;
    } catch (error) {
      console.error('Erreur demande permission notifications:', error);
      return false;
    }
  };

  const permissions: Permission[] = [
    {
      id: 'camera',
      title: 'Appareil photo',
      description: 'Pour prendre des photos de vos tenues',
      detailedDescription: 'L\'accès à votre appareil photo vous permet de capturer instantanément vos looks et de recevoir des analyses de style en temps réel. Vous pouvez également documenter votre garde-robe facilement.',
      icon: Camera,
      isEssential: true,
      status: permissionStates.camera,
      onRequest: handleCameraPermission,
    },
    {
      id: 'photos',
      title: 'Galerie photos',
      description: 'Pour importer des images de votre garde-robe',
      detailedDescription: 'L\'accès à votre galerie vous permet d\'importer facilement vos photos existantes de vêtements et accessoires pour créer votre garde-robe virtuelle complète.',
      icon: ImageIcon,
      isEssential: true,
      status: permissionStates.photos,
      onRequest: handlePhotosPermission,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Pour recevoir des conseils style personnalisés',
      detailedDescription: 'Les notifications vous permettent de recevoir des conseils quotidiens, des rappels pour vos événements importants, et des alertes sur les nouvelles tendances qui correspondent à votre style.',
      icon: Bell,
      isEssential: false,
      status: permissionStates.notifications,
      onRequest: handleNotificationsPermission,
    },
  ];

  const handleRequestPermission = async (permission: Permission) => {
    setIsLoading(prev => ({ ...prev, [permission.id]: true }));
    
    try {
      const granted = await permission.onRequest();
      
      if (!granted && permission.status === 'denied') {
        // Afficher une alert pour rediriger vers les paramètres
        Alert.alert(
          'Permission refusée',
          `Pour utiliser cette fonctionnalité, vous devez autoriser l'accès ${permission.title.toLowerCase()} dans les paramètres de votre appareil.`,
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Ouvrir les paramètres', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } catch (error) {
      console.error(`Erreur lors de la demande de permission ${permission.id}:`, error);
    } finally {
      setIsLoading(prev => ({ ...prev, [permission.id]: false }));
    }
  };

  const handleNext = () => {
    // Sauvegarder l'état final des permissions
    const permissionsData = {
      camera: {
        requested: true,
        granted: permissionStates.camera === 'granted',
        denied: permissionStates.camera === 'denied',
      },
      photos: {
        requested: true,
        granted: permissionStates.photos === 'granted',
        denied: permissionStates.photos === 'denied',
      },
      notifications: {
        requested: true,
        granted: permissionStates.notifications === 'granted',
        denied: permissionStates.notifications === 'denied',
      },
    };

    updatePermissions(permissionsData);
    completeStep('permissions', permissionsData);
    navigation.navigate('Complete');
  };

  const handlePrevious = () => {
    navigation.goBack();
  };

  const handleSkip = () => {
    navigation.navigate('Complete');
  };

  const grantedCount = Object.values(permissionStates).filter(status => status === 'granted').length;
  const essentialGranted = permissions.filter(p => p.isEssential).every(p => p.status === 'granted');

  return (
    <OnboardingContainer
      currentStep={stepIndex}
      totalSteps={onboarding.totalSteps}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSkip={handleSkip}
      showSkip={true}
    >
      <YStack gap="$6">
        {/* Header */}
        <AnimatedYStack entering={FadeInDown.delay(200).duration(600)}>
          <Text fontSize="$8" fontWeight="bold" color="$color12" marginBottom="$2">
            Autorisations d'accès
          </Text>
          <Text fontSize="$4" color="$color11" lineHeight="$5">
            Accordez les permissions pour profiter pleinement de StyleAI
          </Text>
        </AnimatedYStack>

        {/* Progress summary */}
        <AnimatedYStack 
          backgroundColor="$blue2" 
          padding="$4" 
          borderRadius="$4"
          entering={SlideInRight.delay(400).duration(600)}
        >
          <XStack alignItems="center" gap="$3" marginBottom="$2">
            <Ionicons name="shield" size={20} color="$blue10" />
            <Text fontSize="$4" fontWeight="600" color="$blue11">
              Progression des autorisations
            </Text>
          </XStack>
          <Text fontSize="$3" color="$blue11">
            {grantedCount}/{permissions.length} permission{grantedCount > 1 ? 's' : ''} accordée{grantedCount > 1 ? 's' : ''}
          </Text>
          {essentialGranted && (
            <XStack alignItems="center" gap="$2" marginTop="$2">
              <Ionicons name="checkmark" size={16} color="$green10" />
              <Text fontSize="$3" color="$green11" fontWeight="500">
                Toutes les permissions essentielles sont accordées
              </Text>
            </XStack>
          )}
        </AnimatedYStack>

        {/* Permissions list */}
        <YStack gap="$4">
          {permissions.map((permission, index) => {
            const IconComponent = permission.icon;
            const isLoading = isLoading[permission.id];
            
            return (
              <AnimatedCard
                key={permission.id}
                padding="$4"
                borderWidth={1}
                borderColor={
                  permission.status === 'granted' 
                    ? '$green8' 
                    : permission.status === 'denied' 
                      ? '$red8' 
                      : '$borderColor'
                }
                backgroundColor={
                  permission.status === 'granted' 
                    ? '$green2' 
                    : permission.status === 'denied' 
                      ? '$red2' 
                      : '$background'
                }
                entering={BounceIn.delay(600 + index * 200).duration(600)}
              >
                <YStack gap="$3">
                  {/* Header */}
                  <XStack alignItems="flex-start" justifyContent="space-between">
                    <XStack alignItems="center" gap="$3" flex={1}>
                      <YStack
                        width={48}
                        height={48}
                        borderRadius="$6"
                        backgroundColor={
                          permission.status === 'granted' 
                            ? '$green10' 
                            : permission.status === 'denied' 
                              ? '$red10' 
                              : '$blue10'
                        }
                        alignItems="center"
                        justifyContent="center"
                      >
                        <IconComponent size={24} color="white" />
                      </YStack>
                      
                      <YStack flex={1}>
                        <XStack alignItems="center" gap="$2">
                          <Text fontSize="$5" fontWeight="600" color="$color12">
                            {permission.title}
                          </Text>
                          {permission.isEssential && (
                            <YStack
                              backgroundColor="$orange10"
                              paddingHorizontal="$2"
                              paddingVertical="$1"
                              borderRadius="$2"
                            >
                              <Text fontSize="$1" color="white" fontWeight="600">
                                ESSENTIEL
                              </Text>
                            </YStack>
                          )}
                        </XStack>
                        <Text fontSize="$3" color="$color11" marginTop="$1">
                          {permission.description}
                        </Text>
                      </YStack>
                    </XStack>

                    {/* Status indicator */}
                    <YStack alignItems="center" justifyContent="center">
                      {permission.status === 'granted' && (
                        <YStack
                          width={32}
                          height={32}
                          borderRadius="$6"
                          backgroundColor="$green10"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Ionicons name="checkmark" size={20} color="white" />
                        </YStack>
                      )}
                      {permission.status === 'denied' && (
                        <YStack
                          width={32}
                          height={32}
                          borderRadius="$6"
                          backgroundColor="$red10"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Ionicons name="close" size={20} color="white" />
                        </YStack>
                      )}
                      {permission.status === 'pending' && (
                        <YStack
                          width={32}
                          height={32}
                          borderRadius="$6"
                          backgroundColor="$orange10"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Ionicons name="alert-circle" size={20} color="white" />
                        </YStack>
                      )}
                    </YStack>
                  </XStack>

                  {/* Detailed description */}
                  <YStack
                    backgroundColor="$color2"
                    padding="$3"
                    borderRadius="$3"
                    borderLeftWidth={3}
                    borderLeftColor="$blue8"
                  >
                    <XStack alignItems="flex-start" gap="$2">
                      <Info size={16} color="$blue10" marginTop="$1" />
                      <Text fontSize="$3" color="$color11" lineHeight="$4" flex={1}>
                        {permission.detailedDescription}
                      </Text>
                    </XStack>
                  </YStack>

                  {/* Action button */}
                  {permission.status === 'pending' && (
                    <Button
                      onPress={() => handleRequestPermission(permission)}
                      backgroundColor="$blue10"
                      disabled={isLoading}
                      opacity={isLoading ? 0.7 : 1}
                    >
                      <Text color="white" fontWeight="600">
                        {isLoading ? 'Demande en cours...' : 'Autoriser l\'accès'}
                      </Text>
                    </Button>
                  )}

                  {permission.status === 'denied' && (
                    <Button
                      variant="outlined"
                      onPress={() => Linking.openSettings()}
                      borderColor="$red8"
                    >
                      <Text color="$red10" fontWeight="600">
                        Ouvrir les paramètres
                      </Text>
                    </Button>
                  )}

                  {permission.status === 'granted' && (
                    <YStack
                      backgroundColor="$green10"
                      padding="$3"
                      borderRadius="$3"
                      alignItems="center"
                    >
                      <Text color="white" fontWeight="600">
                        Permission accordée ✓
                      </Text>
                    </YStack>
                  )}
                </YStack>
              </AnimatedCard>
            );
          })}
        </YStack>

        {/* Privacy note */}
        <AnimatedYStack 
          backgroundColor="$color2" 
          padding="$4" 
          borderRadius="$4"
          entering={FadeInDown.delay(1000).duration(600)}
        >
          <XStack alignItems="flex-start" gap="$3">
            <Shield size={20} color="$blue10" marginTop="$1" />
            <YStack flex={1}>
              <Text fontSize="$4" fontWeight="600" color="$color12" marginBottom="$2">
                Votre vie privée est protégée
              </Text>
              <Text fontSize="$3" color="$color11" lineHeight="$4">
                Vos données personnelles restent sur votre appareil. Nous n'accédons jamais à vos photos sans votre permission explicite et ne les partageons jamais avec des tiers.
              </Text>
            </YStack>
          </XStack>
        </AnimatedYStack>
      </YStack>
    </OnboardingContainer>
  );
}

export default EnhancedPermissionsScreen;