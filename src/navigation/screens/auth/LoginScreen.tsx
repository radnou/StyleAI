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
import { loginSchema, LoginFormData } from '@/shared/validation';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay,
} from 'react-native-reanimated';

type LoginScreenProps = AuthStackScreenProps<'Login'>;

const FormContainer = styled(YStack, {
  name: 'LoginForm',
  width: '100%',
  gap: '$md',
  marginVertical: '$lg',
});

const CheckboxContainer = styled(XStack, {
  name: 'LoginCheckbox',
  alignItems: 'center',
  gap: '$sm',
  marginVertical: '$sm',
});

const CheckboxLabel = styled(Text, {
  name: 'LoginCheckboxLabel',
  color: '$color',
  fontSize: '$sm',
  flexShrink: 1,
});

const LinkButton = styled(AuthButton, {
  name: 'LoginLink',
  variant: 'link',
  padding: 0,
  height: 'auto',
  minWidth: 'auto',
});

const ErrorContainer = styled(YStack, {
  name: 'LoginError',
  backgroundColor: '$error',
  borderRadius: '$sm',
  padding: '$sm',
  marginBottom: '$md',
});

const ErrorText = styled(Text, {
  name: 'LoginErrorText',
  color: 'white',
  fontSize: '$sm',
  textAlign: 'center',
});

const AnimatedYStack = Animated.createAnimatedComponent(YStack);

export function LoginScreen({ navigation }: LoginScreenProps) {
  const authNavigation = useAuthNavigation();
  const { login, auth } = useAppStore();
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
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

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

  const onSubmit = async (data: LoginFormData) => {
    try {
      setShowError(false);
      clearErrors();
      
      const result = await login(data.email, data.password);
      
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

  const handleForgotPassword = () => {
    authNavigation.navigate('ForgotPassword');
  };

  const handleBackToWelcome = () => {
    authNavigation.goBack();
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
            title="Welcome Back"
            subtitle="Sign in to your StyleAI account"
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
                  placeholder="Enter your password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  showToggle
                  required
                />
              )}
            />

            {/* Remember Me Checkbox */}
            <CheckboxContainer>
              <Controller
                control={control}
                name="rememberMe"
                render={({ field: { onChange, value } }) => (
                  <>
                    <Checkbox
                      checked={value}
                      onCheckedChange={onChange}
                      size="$4"
                      backgroundColor={value ? '$brand' : 'transparent'}
                      borderColor={value ? '$brand' : '$borderColor'}
                      accessibilityLabel="Remember me"
                    />
                    <CheckboxLabel>Remember me on this device</CheckboxLabel>
                  </>
                )}
              />
            </CheckboxContainer>

            {/* Forgot Password Link */}
            <XStack justifyContent="flex-end">
              <LinkButton onPress={handleForgotPassword}>
                Forgot your password?
              </LinkButton>
            </XStack>
          </FormContainer>
        </AnimatedYStack>

        {/* Animated Buttons */}
        <AnimatedYStack style={buttonsAnimatedStyle}>
          <YStack gap="$md" width="100%">
            {/* Sign In Button */}
            <AuthButton
              variant="primary"
              size="large"
              fullWidth
              isLoading={auth.isLoading}
              loadingText="Signing in..."
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid}
              accessibilityLabel="Sign in to your account"
            >
              Sign In
            </AuthButton>

            {/* Social Auth */}
            <SocialAuthButtons
              onGooglePress={handleGoogleSignIn}
              onApplePress={handleAppleSignIn}
              providers={['google', 'apple']}
              showDivider
              dividerText="or continue with"
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
          primaryText="Don't have an account?"
          linkText="Sign up"
          onLinkPress={handleRegister}
          variant="default"
        />
      </AuthContainer>
    </TamaguiProvider>
  );
}