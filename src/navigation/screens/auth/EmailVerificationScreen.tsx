import React, { useState, useEffect, useRef } from 'react';
import { TextInput } from 'react-native';
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
import { emailVerificationSchema, EmailVerificationFormData } from '@/shared/validation';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay,
} from 'react-native-reanimated';

type EmailVerificationScreenProps = AuthStackScreenProps<'EmailVerification'>;

const FormContainer = styled(YStack, {
  name: 'EmailVerificationForm',
  width: '100%',
  gap: '$lg',
  marginVertical: '$lg',
});

const InstructionsContainer = styled(YStack, {
  name: 'EmailVerificationInstructions',
  backgroundColor: '$backgroundPress',
  borderRadius: '$md',
  padding: '$md',
  marginBottom: '$lg',
  alignItems: 'center',
  gap: '$sm',
});

const InstructionsIcon = styled(Text, {
  name: 'EmailVerificationInstructionsIcon',
  fontSize: '$xxl',
});

const InstructionsText = styled(Text, {
  name: 'EmailVerificationInstructionsText',
  color: '$colorFocus',
  fontSize: '$sm',
  lineHeight: '$sm',
  textAlign: 'center',
});

const CodeContainer = styled(XStack, {
  name: 'EmailVerificationCodeContainer',
  gap: '$sm',
  justifyContent: 'center',
  alignItems: 'center',
});

const CodeInput = styled(TextInput, {
  name: 'EmailVerificationCodeInput',
  width: 50,
  height: 60,
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderWidth: 2,
  borderRadius: '$md',
  fontSize: '$xl',
  fontWeight: '$bold',
  textAlign: 'center',
  color: '$color',
  
  variants: {
    focused: {
      true: {
        borderColor: '$brand',
        backgroundColor: '$backgroundFocus',
      },
    },
    
    hasValue: {
      true: {
        borderColor: '$brand',
        backgroundColor: '$brandFocus',
        color: '$brand',
      },
    },
    
    hasError: {
      true: {
        borderColor: '$error',
        backgroundColor: '$error',
      },
    },
  },
});

const ResendContainer = styled(YStack, {
  name: 'EmailVerificationResend',
  alignItems: 'center',
  gap: '$sm',
});

const ResendText = styled(Text, {
  name: 'EmailVerificationResendText',
  color: '$colorFocus',
  fontSize: '$sm',
  textAlign: 'center',
});

const TimerText = styled(Text, {
  name: 'EmailVerificationTimerText',
  color: '$brand',
  fontSize: '$sm',
  fontWeight: '$medium',
});

const LinkButton = styled(AuthButton, {
  name: 'EmailVerificationLink',
  variant: 'link',
  padding: 0,
  height: 'auto',
  minWidth: 'auto',
});

const ErrorContainer = styled(YStack, {
  name: 'EmailVerificationError',
  backgroundColor: '$error',
  borderRadius: '$sm',
  padding: '$sm',
  marginBottom: '$md',
});

const ErrorText = styled(Text, {
  name: 'EmailVerificationErrorText',
  color: 'white',
  fontSize: '$sm',
  textAlign: 'center',
});

const AnimatedYStack = Animated.createAnimatedComponent(YStack);

export function EmailVerificationScreen({ navigation, route }: EmailVerificationScreenProps) {
  const authNavigation = useAuthNavigation();
  const email = route?.params?.email || 'user@example.com';
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EmailVerificationFormData>({
    resolver: zodResolver(emailVerificationSchema),
    mode: 'onChange',
    defaultValues: {
      email,
      verificationCode: '',
    },
  });

  const verificationCode = watch('verificationCode');

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

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Auto-submit when code is complete
  useEffect(() => {
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      setValue('verificationCode', fullCode);
      handleSubmit(onSubmit)();
    }
  }, [code, setValue, handleSubmit]);

  const onSubmit = async (data: EmailVerificationFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Implement actual email verification logic
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Navigate to main app or next step
      console.log('Email verified successfully');
    } catch (error) {
      setError('Invalid verification code. Please try again.');
      // Reset code inputs
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleCodeKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Implement actual resend logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setResendTimer(60);
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setFocusedIndex(0);
    } catch (error) {
      setError('Failed to resend verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    authNavigation.navigate('Login');
  };

  const handleChangeEmail = () => {
    authNavigation.navigate('Register');
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
            title="Verify Your Email"
            subtitle={`We've sent a 6-digit code to ${email}`}
            variant="default"
            showLogo
          />
        </AnimatedYStack>

        {/* Animated Content */}
        <AnimatedYStack style={contentAnimatedStyle}>
          <FormContainer>
            <InstructionsContainer>
              <InstructionsIcon>📱</InstructionsIcon>
              <InstructionsText>
                Enter the 6-digit verification code sent to your email address
              </InstructionsText>
            </InstructionsContainer>

            {/* Error Display */}
            {error && (
              <ErrorContainer>
                <ErrorText>{error}</ErrorText>
              </ErrorContainer>
            )}

            {/* Code Input */}
            <CodeContainer>
              {Array.from({ length: 6 }, (_, index) => (
                <CodeInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  value={code[index]}
                  onChangeText={(value) => handleCodeChange(value.slice(-1), index)}
                  onKeyPress={({ nativeEvent }) => handleCodeKeyPress(nativeEvent.key, index)}
                  onFocus={() => setFocusedIndex(index)}
                  maxLength={1}
                  keyboardType="numeric"
                  focused={focusedIndex === index}
                  hasValue={!!code[index]}
                  hasError={!!error}
                  accessibilityLabel={`Verification code digit ${index + 1}`}
                />
              ))}
            </CodeContainer>

            {/* Resend Code */}
            <ResendContainer>
              {canResend ? (
                <LinkButton
                  onPress={handleResendCode}
                  disabled={isLoading}
                  accessibilityLabel="Resend verification code"
                >
                  Resend Code
                </LinkButton>
              ) : (
                <ResendText>
                  Resend code in <TimerText>{resendTimer}s</TimerText>
                </ResendText>
              )}
            </ResendContainer>

            <YStack gap="$md" width="100%">
              {/* Verify Button */}
              <AuthButton
                variant="primary"
                size="large"
                fullWidth
                isLoading={isLoading}
                loadingText="Verifying..."
                onPress={handleSubmit(onSubmit)}
                disabled={code.join('').length !== 6}
                accessibilityLabel="Verify email address"
              >
                Verify Email
              </AuthButton>

              {/* Change Email */}
              <XStack justifyContent="center" gap="$sm">
                <Text color="$colorFocus" fontSize="$sm">Wrong email?</Text>
                <LinkButton onPress={handleChangeEmail}>
                  Change Email
                </LinkButton>
              </XStack>
            </YStack>
          </FormContainer>
        </AnimatedYStack>

        {/* Footer */}
        <AuthFooter
          primaryText="Need help?"
          linkText="Contact Support"
          onLinkPress={() => console.log('Contact support')}
          variant="default"
        />
      </AuthContainer>
    </TamaguiProvider>
  );
}