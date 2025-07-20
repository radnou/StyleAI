import React, { useState, useEffect } from 'react';
import { YStack, XStack, Text, styled, Checkbox } from '@tamagui/core';
import { AuthStackScreenProps } from '../../types';
import { useAuthNavigation } from '../../utils';
import { useAppStore } from '@/store/store';
import { 
  AuthContainer, 
  AuthHeader, 
  AuthButton, 
  AuthFooter, 
  AuthInput,
  PasswordInput,
  SocialAuthButtons 
} from '@/shared/components/auth';
import { TamaguiProvider } from '@/shared/theme';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '@/shared/validation';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay,
} from 'react-native-reanimated';

type RegisterScreenProps = AuthStackScreenProps<'Register'>;

const FormContainer = styled(YStack, {
  name: 'RegisterForm',
  width: '100%',
  gap: '$md',
  marginVertical: '$lg',
});

const CheckboxContainer = styled(XStack, {
  name: 'RegisterCheckbox',
  alignItems: 'flex-start',
  gap: '$sm',
  marginVertical: '$sm',
});

const CheckboxLabel = styled(Text, {
  name: 'RegisterCheckboxLabel',
  color: '$color',
  fontSize: '$sm',
  flexShrink: 1,
  lineHeight: '$sm',
});

const LinkText = styled(Text, {
  name: 'RegisterLinkText',
  color: '$brand',
  fontSize: '$sm',
  textDecorationLine: 'underline',
});

const LinkButton = styled(AuthButton, {
  name: 'RegisterLink',
  variant: 'link',
  padding: 0,
  height: 'auto',
  minWidth: 'auto',
});

const ErrorContainer = styled(YStack, {
  name: 'RegisterError',
  backgroundColor: '$error',
  borderRadius: '$sm',
  padding: '$sm',
  marginBottom: '$md',
});

const ErrorText = styled(Text, {
  name: 'RegisterErrorText',
  color: 'white',
  fontSize: '$sm',
  textAlign: 'center',
});

const AnimatedYStack = Animated.createAnimatedComponent(YStack);

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const authNavigation = useAuthNavigation();
  const { register, auth } = useAppStore();
  const [showError, setShowError] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(30);
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(30);

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    clearErrors,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
      subscribeToNewsletter: false,
    },
  });

  // Watch password for strength indicator
  const password = watch('password');

  // Start animations when component mounts
  useEffect(() => {
    const animateIn = () => {
      // Header animation
      headerOpacity.value = withSpring(1);
      headerTranslateY.value = withSpring(0);
      
      // Form animation (delayed)
      formOpacity.value = withDelay(200, withSpring(1));
      formTranslateY.value = withDelay(200, withSpring(0));
      
      // Buttons animation (delayed)
      buttonsOpacity.value = withDelay(400, withSpring(1));
      buttonsTranslateY.value = withDelay(400, withSpring(0));
    };
    
    animateIn();
  }, []);

  // Show error when auth error changes
  useEffect(() => {
    if (auth.error) {
      setShowError(true);
      setError('root', { message: auth.error });
    } else {
      setShowError(false);
      clearErrors('root');
    }
  }, [auth.error, setError, clearErrors]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setShowError(false);
      clearErrors();
      
      const displayName = `${data.firstName} ${data.lastName}`;
      const result = await register(data.email, data.password, displayName);
      
      if (result.isErr()) {
        setShowError(true);
        setError('root', { message: result.error.message });
      }
      // Navigation will happen automatically via the auth store state change
    } catch (error) {
      setShowError(true);
      setError('root', { message: 'An unexpected error occurred. Please try again.' });
    }
  };

  const handleBackToWelcome = () => {
    authNavigation.goBack();
  };

  const handleLogin = () => {
    authNavigation.navigate('Login');
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
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  return (
    <TamaguiProvider>
      <AuthContainer enableScrolling enableKeyboardAvoidance>
        {/* Animated Header */}
        <AnimatedYStack style={headerAnimatedStyle}>
          <AuthHeader
            title="Create Account"
            subtitle="Join StyleAI and discover your perfect style"
            variant="default"
            showLogo
          />
        </AnimatedYStack>

        {/* Animated Form */}
        <AnimatedYStack style={formAnimatedStyle}>
          <FormContainer>
            {/* Error Display */}
            {showError && auth.error && (
              <ErrorContainer>
                <ErrorText>{auth.error}</ErrorText>
              </ErrorContainer>
            )}

            {/* Name Fields */}
            <XStack gap="$sm">
              <YStack flex={1}>
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <AuthInput
                      label="First Name"
                      placeholder="First name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.firstName?.message}
                      autoCapitalize="words"
                      autoComplete="given-name"
                      textContentType="givenName"
                      required
                    />
                  )}
                />
              </YStack>
              
              <YStack flex={1}>
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <AuthInput
                      label="Last Name"
                      placeholder="Last name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.lastName?.message}
                      autoCapitalize="words"
                      autoComplete="family-name"
                      textContentType="familyName"
                      required
                    />
                  )}
                />
              </YStack>
            </XStack>

            {/* Email Input */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value, onBlur } }) => (
                <AuthInput
                  label="Email Address"
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  required
                />
              )}
            />

            {/* Password Input */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value, onBlur } }) => (
                <PasswordInput
                  label="Password"
                  placeholder="Create a strong password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  showToggle
                  showStrengthIndicator
                  required
                />
              )}
            />

            {/* Confirm Password Input */}
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value, onBlur } }) => (
                <PasswordInput
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  showToggle
                  required
                />
              )}
            />

            {/* Terms Agreement Checkbox */}
            <CheckboxContainer>
              <Controller
                control={control}
                name="agreeToTerms"
                render={({ field: { onChange, value } }) => (
                  <>
                    <Checkbox
                      checked={value}
                      onCheckedChange={onChange}
                      size="$4"
                      backgroundColor={value ? '$brand' : 'transparent'}
                      borderColor={value ? '$brand' : '$borderColor'}
                      accessibilityLabel="Agree to terms and conditions"
                      marginTop="$xs"
                    />
                    <CheckboxLabel>
                      I agree to the{' '}
                      <LinkText onPress={handleTermsPress}>Terms of Service</LinkText>
                      {' '}and{' '}
                      <LinkText onPress={handlePrivacyPress}>Privacy Policy</LinkText>
                    </CheckboxLabel>
                  </>
                )}
              />
            </CheckboxContainer>
            {errors.agreeToTerms && (
              <ErrorText style={{ marginTop: -8, marginBottom: 8 }}>
                {errors.agreeToTerms.message}
              </ErrorText>
            )}

            {/* Newsletter Subscription Checkbox */}
            <CheckboxContainer>
              <Controller
                control={control}
                name="subscribeToNewsletter"
                render={({ field: { onChange, value } }) => (
                  <>
                    <Checkbox
                      checked={value}
                      onCheckedChange={onChange}
                      size="$4"
                      backgroundColor={value ? '$brand' : 'transparent'}
                      borderColor={value ? '$brand' : '$borderColor'}
                      accessibilityLabel="Subscribe to newsletter"
                      marginTop="$xs"
                    />
                    <CheckboxLabel>
                      I'd like to receive style tips and updates via email
                    </CheckboxLabel>
                  </>
                )}
              />
            </CheckboxContainer>
          </FormContainer>
        </AnimatedYStack>

        {/* Animated Buttons */}
        <AnimatedYStack style={buttonsAnimatedStyle}>
          <YStack gap="$md" width="100%">
            {/* Create Account Button */}
            <AuthButton
              variant="primary"
              size="large"
              fullWidth
              isLoading={auth.isLoading}
              loadingText="Creating account..."
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid}
              accessibilityLabel="Create your StyleAI account"
            >
              Create Account
            </AuthButton>

            {/* Social Auth */}
            <SocialAuthButtons
              onGooglePress={handleGoogleSignIn}
              onApplePress={handleAppleSignIn}
              providers={['google', 'apple']}
              showDivider
              dividerText="or sign up with"
              buttonSize="large"
              isLoading={auth.isLoading}
            />

            {/* Back to Welcome */}
            <XStack justifyContent="center" gap="$sm">
              <LinkButton onPress={handleBackToWelcome}>
                ← Back to Welcome
              </LinkButton>
            </XStack>
          </YStack>
        </AnimatedYStack>

        {/* Footer */}
        <AuthFooter
          primaryText="Already have an account?"
          linkText="Sign in"
          onLinkPress={handleLogin}
          variant="default"
        />
      </AuthContainer>
    </TamaguiProvider>
  );
}