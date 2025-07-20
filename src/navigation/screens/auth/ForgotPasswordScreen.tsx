import React, { useState, useEffect } from 'react';
import { YStack, XStack, Text, styled } from '@tamagui/core';
import { AuthStackScreenProps } from '../../types';
import { useAuthNavigation } from '../../utils';
import { 
  AuthContainer, 
  AuthHeader, 
  AuthButton, 
  AuthFooter, 
  AuthInput,
} from '@/shared/components/auth';
import { TamaguiProvider } from '@/shared/theme';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/shared/validation';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay,
} from 'react-native-reanimated';

type ForgotPasswordScreenProps = AuthStackScreenProps<'ForgotPassword'>;

const FormContainer = styled(YStack, {
  name: 'ForgotPasswordForm',
  width: '100%',
  gap: '$lg',
  marginVertical: '$lg',
});

const InstructionsContainer = styled(YStack, {
  name: 'ForgotPasswordInstructions',
  backgroundColor: '$backgroundPress',
  borderRadius: '$md',
  padding: '$md',
  marginBottom: '$lg',
});

const InstructionsText = styled(Text, {
  name: 'ForgotPasswordInstructionsText',
  color: '$colorFocus',
  fontSize: '$sm',
  lineHeight: '$sm',
  textAlign: 'center',
});

const SuccessContainer = styled(YStack, {
  name: 'ForgotPasswordSuccess',
  backgroundColor: '$success',
  borderRadius: '$md',
  padding: '$md',
  marginBottom: '$lg',
  alignItems: 'center',
  gap: '$sm',
});

const SuccessIcon = styled(Text, {
  name: 'ForgotPasswordSuccessIcon',
  fontSize: '$xxl',
});

const SuccessText = styled(Text, {
  name: 'ForgotPasswordSuccessText',
  color: 'white',
  fontSize: '$md',
  fontWeight: '$medium',
  textAlign: 'center',
});

const SuccessSubtext = styled(Text, {
  name: 'ForgotPasswordSuccessSubtext',
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '$sm',
  textAlign: 'center',
  lineHeight: '$sm',
});

const LinkButton = styled(AuthButton, {
  name: 'ForgotPasswordLink',
  variant: 'link',
  padding: 0,
  height: 'auto',
  minWidth: 'auto',
});

const ErrorContainer = styled(YStack, {
  name: 'ForgotPasswordError',
  backgroundColor: '$error',
  borderRadius: '$sm',
  padding: '$sm',
  marginBottom: '$md',
});

const ErrorText = styled(Text, {
  name: 'ForgotPasswordErrorText',
  color: 'white',
  fontSize: '$sm',
  textAlign: 'center',
});

const AnimatedYStack = Animated.createAnimatedComponent(YStack);

export function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const authNavigation = useAuthNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string>('');

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  // Start animations when component mounts
  useEffect(() => {
    const animateIn = () => {
      // Header animation
      headerOpacity.value = withSpring(1);
      headerTranslateY.value = withSpring(0);
      
      // Content animation (delayed)
      contentOpacity.value = withDelay(200, withSpring(1));
      contentTranslateY.value = withDelay(200, withSpring(0));
    };
    
    animateIn();
  }, []);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Implement actual password reset logic
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      setSubmittedEmail(data.email);
      setIsSuccess(true);
      reset();
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    authNavigation.navigate('Login');
  };

  const handleResendEmail = async () => {
    if (submittedEmail) {
      await onSubmit({ email: submittedEmail });
    }
  };

  const handleTryDifferentEmail = () => {
    setIsSuccess(false);
    setSubmittedEmail('');
    setError(null);
  };

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  return (
    <TamaguiProvider>
      <AuthContainer enableScrolling enableKeyboardAvoidance>
        {/* Animated Header */}
        <AnimatedYStack style={headerAnimatedStyle}>
          <AuthHeader
            title={isSuccess ? "Check Your Email" : "Reset Password"}
            subtitle={
              isSuccess 
                ? "We've sent a reset link to your email"
                : "Enter your email to receive a reset link"
            }
            variant="default"
            showLogo
          />
        </AnimatedYStack>

        {/* Animated Content */}
        <AnimatedYStack style={contentAnimatedStyle}>
          {isSuccess ? (
            /* Success State */
            <YStack gap="$lg" width="100%">
              <SuccessContainer>
                <SuccessIcon>📧</SuccessIcon>
                <SuccessText>
                  Reset link sent!
                </SuccessText>
                <SuccessSubtext>
                  We've sent a password reset link to{'\n'}
                  <Text fontWeight="$medium">{submittedEmail}</Text>
                </SuccessSubtext>
              </SuccessContainer>

              <InstructionsContainer>
                <InstructionsText>
                  Check your email and click the reset link to create a new password.
                  {'\n\n'}
                  The link will expire in 1 hour for security reasons.
                </InstructionsText>
              </InstructionsContainer>

              <YStack gap="$md" width="100%">
                <AuthButton
                  variant="primary"
                  size="large"
                  fullWidth
                  onPress={handleResendEmail}
                  isLoading={isLoading}
                  loadingText="Resending..."
                  accessibilityLabel="Resend reset email"
                >
                  Resend Email
                </AuthButton>

                <AuthButton
                  variant="secondary"
                  size="large"
                  fullWidth
                  onPress={handleTryDifferentEmail}
                  disabled={isLoading}
                  accessibilityLabel="Try a different email"
                >
                  Try Different Email
                </AuthButton>
              </YStack>
            </YStack>
          ) : (
            /* Form State */
            <FormContainer>
              <InstructionsContainer>
                <InstructionsText>
                  Enter your email address and we'll send you a link to reset your password.
                </InstructionsText>
              </InstructionsContainer>

              {/* Error Display */}
              {error && (
                <ErrorContainer>
                  <ErrorText>{error}</ErrorText>
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

              <YStack gap="$md" width="100%">
                {/* Reset Password Button */}
                <AuthButton
                  variant="primary"
                  size="large"
                  fullWidth
                  isLoading={isLoading}
                  loadingText="Sending reset link..."
                  onPress={handleSubmit(onSubmit)}
                  disabled={!isValid}
                  accessibilityLabel="Send password reset email"
                >
                  Send Reset Link
                </AuthButton>

                {/* Back to Login */}
                <XStack justifyContent="center">
                  <LinkButton onPress={handleBackToLogin}>
                    ← Back to Sign In
                  </LinkButton>
                </XStack>
              </YStack>
            </FormContainer>
          )}
        </AnimatedYStack>

        {/* Footer */}
        <AuthFooter
          primaryText="Remember your password?"
          linkText="Sign in"
          onLinkPress={handleBackToLogin}
          variant="default"
        />
      </AuthContainer>
    </TamaguiProvider>
  );
}