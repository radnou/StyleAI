import React, { useEffect } from 'react';
import { YStack, XStack, Text, styled } from '@tamagui/core';
import { AuthStackScreenProps } from '../../types';
import { useAuthNavigation } from '../../utils';
import { AuthContainer, AuthHeader, AuthButton, AuthFooter, SocialAuthButtons } from '@/shared/components/auth';
import { TamaguiProvider } from '@/shared/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withDelay,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';

type WelcomeScreenProps = AuthStackScreenProps<'Welcome'>;

const GradientBackground = styled(LinearGradient, {
  name: 'WelcomeGradientBackground',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
});

const ContentContainer = styled(YStack, {
  name: 'WelcomeContent',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: '$lg',
  gap: '$xl',
});

const LogoContainer = styled(YStack, {
  name: 'WelcomeLogo',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '$lg',
});

const BrandLogo = styled(YStack, {
  name: 'WelcomeBrandLogo',
  width: 120,
  height: 120,
  backgroundColor: 'white',
  borderRadius: '$xl',
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.15,
  shadowRadius: 20,
  elevation: 8,
});

const BrandText = styled(Text, {
  name: 'WelcomeBrandText',
  color: '$brand',
  fontSize: '$xxxl',
  fontWeight: '$bold',
  textAlign: 'center',
});

const WelcomeTitle = styled(Text, {
  name: 'WelcomeTitle',
  color: 'white',
  fontSize: '$display',
  fontWeight: '$bold',
  textAlign: 'center',
  lineHeight: 48,
  marginBottom: '$sm',
  textShadowColor: 'rgba(0, 0, 0, 0.3)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 4,
});

const WelcomeSubtitle = styled(Text, {
  name: 'WelcomeSubtitle',
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '$lg',
  textAlign: 'center',
  lineHeight: '$lg',
  marginBottom: '$xxl',
  textShadowColor: 'rgba(0, 0, 0, 0.2)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 2,
});

const ButtonsContainer = styled(YStack, {
  name: 'WelcomeButtons',
  width: '100%',
  gap: '$md',
  paddingHorizontal: '$md',
});

const FeatureHighlight = styled(XStack, {
  name: 'WelcomeFeature',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$sm',
  marginTop: '$lg',
});

const FeatureIcon = styled(Text, {
  name: 'WelcomeFeatureIcon',
  fontSize: '$lg',
});

const FeatureText = styled(Text, {
  name: 'WelcomeFeatureText',
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '$sm',
  fontWeight: '$medium',
});

const AnimatedYStack = Animated.createAnimatedComponent(YStack);

export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const authNavigation = useAuthNavigation();
  
  // Animation values
  const logoScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(30);
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(30);
  const featuresOpacity = useSharedValue(0);
  
  // Start animations when component mounts
  useEffect(() => {
    const animateIn = () => {
      // Logo animation
      logoScale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      
      // Title animation (delayed)
      titleOpacity.value = withDelay(200, withSpring(1));
      titleTranslateY.value = withDelay(200, withSpring(0));
      
      // Subtitle animation (delayed)
      subtitleOpacity.value = withDelay(400, withSpring(1));
      subtitleTranslateY.value = withDelay(400, withSpring(0));
      
      // Buttons animation (delayed)
      buttonsOpacity.value = withDelay(600, withSpring(1));
      buttonsTranslateY.value = withDelay(600, withSpring(0));
      
      // Features animation (delayed)
      featuresOpacity.value = withDelay(800, withSpring(1));
    };
    
    // Start animation sequence
    animateIn();
  }, []);

  const handleLogin = () => {
    authNavigation.navigate('Login');
  };

  const handleRegister = () => {
    authNavigation.navigate('Register');
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google Sign In
    console.log('Google Sign In pressed');
  };

  const handleAppleSignIn = () => {
    // TODO: Implement Apple Sign In
    console.log('Apple Sign In pressed');
  };

  const handleTermsPress = () => {
    // TODO: Navigate to terms
    console.log('Terms pressed');
  };

  const handlePrivacyPress = () => {
    // TODO: Navigate to privacy policy
    console.log('Privacy pressed');
  };

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  const featuresAnimatedStyle = useAnimatedStyle(() => ({
    opacity: featuresOpacity.value,
  }));

  return (
    <TamaguiProvider>
      <AuthContainer 
        enableKeyboardAvoidance={false} 
        enableScrolling={true}
        padding="lg"
      >
        {/* Gradient Background */}
        <GradientBackground
          colors={['#6366F1', '#8B5CF6', '#EC4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        <ContentContainer>
          {/* Animated Logo */}
          <LogoContainer>
            <AnimatedYStack style={logoAnimatedStyle}>
              <BrandLogo>
                <BrandText>SA</BrandText>
              </BrandLogo>
            </AnimatedYStack>
          </LogoContainer>
          
          {/* Animated Title */}
          <AnimatedYStack style={titleAnimatedStyle}>
            <WelcomeTitle
              accessibilityRole="header"
              accessibilityLevel={1}
            >
              Welcome to StyleAI
            </WelcomeTitle>
          </AnimatedYStack>
          
          {/* Animated Subtitle */}
          <AnimatedYStack style={subtitleAnimatedStyle}>
            <WelcomeSubtitle>
              Your personal AI styling assistant that helps you discover your perfect style
            </WelcomeSubtitle>
          </AnimatedYStack>
          
          {/* Animated Buttons */}
          <AnimatedYStack style={buttonsAnimatedStyle}>
            <ButtonsContainer>
              <AuthButton
                variant="primary"
                size="large"
                fullWidth
                onPress={handleLogin}
                accessibilityLabel="Sign in to your account"
              >
                Sign In
              </AuthButton>
              
              <AuthButton
                variant="secondary"
                size="large"
                fullWidth
                onPress={handleRegister}
                accessibilityLabel="Create a new account"
              >
                Create Account
              </AuthButton>
              
              <SocialAuthButtons
                onGooglePress={handleGoogleSignIn}
                onApplePress={handleAppleSignIn}
                providers={['google', 'apple']}
                showDivider
                dividerText="or continue with"
                buttonSize="large"
              />
            </ButtonsContainer>
          </AnimatedYStack>
          
          {/* Animated Features */}
          <AnimatedYStack style={featuresAnimatedStyle}>
            <YStack gap="$sm" alignItems="center">
              <FeatureHighlight>
                <FeatureIcon>✨</FeatureIcon>
                <FeatureText>AI-powered style recommendations</FeatureText>
              </FeatureHighlight>
              
              <FeatureHighlight>
                <FeatureIcon>👗</FeatureIcon>
                <FeatureText>Smart wardrobe management</FeatureText>
              </FeatureHighlight>
              
              <FeatureHighlight>
                <FeatureIcon>📱</FeatureIcon>
                <FeatureText>Personalized styling tips</FeatureText>
              </FeatureHighlight>
            </YStack>
          </AnimatedYStack>
        </ContentContainer>
        
        {/* Footer */}
        <AuthFooter
          showTerms
          onTermsPress={handleTermsPress}
          onPrivacyPress={handlePrivacyPress}
          variant="welcome"
        />
      </AuthContainer>
    </TamaguiProvider>
  );
}