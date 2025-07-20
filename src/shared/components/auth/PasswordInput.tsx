import React, { forwardRef, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { XStack, YStack, Text, styled } from '@tamagui/core';
import { AuthInput, AuthInputProps } from './AuthInput';
import { tokens } from '../../theme/theme-tokens';

// Icons (you can replace these with your preferred icon library)
const EyeIcon = ({ size = 20, color = '#666' }) => (
  <Text style={{ fontSize: size, color }}>👁</Text>
);

const EyeOffIcon = ({ size = 20, color = '#666' }) => (
  <Text style={{ fontSize: size, color }}>🙈</Text>
);

export interface PasswordInputProps extends Omit<AuthInputProps, 'secureTextEntry' | 'rightIcon'> {
  showToggle?: boolean;
  showStrengthIndicator?: boolean;
  onToggleVisibility?: (isVisible: boolean) => void;
}

const StrengthIndicator = styled(XStack, {
  name: 'PasswordStrengthIndicator',
  gap: '$xs',
  alignItems: 'center',
  marginTop: '$xs',
});

const StrengthBar = styled(YStack, {
  name: 'PasswordStrengthBar',
  height: 4,
  flex: 1,
  backgroundColor: '$borderColor',
  borderRadius: '$xs',
  overflow: 'hidden',
  
  variants: {
    strength: {
      weak: {
        backgroundColor: '$error',
      },
      fair: {
        backgroundColor: '$warning',
      },
      good: {
        backgroundColor: '$info',
      },
      strong: {
        backgroundColor: '$success',
      },
    },
    
    active: {
      true: {
        opacity: 1,
      },
      false: {
        opacity: 0.2,
      },
    },
  },
});

const StrengthText = styled(Text, {
  name: 'PasswordStrengthText',
  fontSize: '$xs',
  fontWeight: '$medium',
  minWidth: 60,
  textAlign: 'right',
  
  variants: {
    strength: {
      weak: {
        color: '$error',
      },
      fair: {
        color: '$warning',
      },
      good: {
        color: '$info',
      },
      strong: {
        color: '$success',
      },
    },
  },
});

const ToggleButton = styled(TouchableOpacity, {
  name: 'PasswordToggleButton',
  padding: '$xs',
  borderRadius: '$xs',
  alignItems: 'center',
  justifyContent: 'center',
  
  variants: {
    pressed: {
      true: {
        opacity: 0.7,
      },
    },
  },
});

// Password strength calculation
const calculatePasswordStrength = (password: string): {
  strength: 'weak' | 'fair' | 'good' | 'strong';
  score: number;
} => {
  if (!password) return { strength: 'weak', score: 0 };
  
  let score = 0;
  
  // Length
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character types
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  // Patterns
  if (!/(.)\1{2,}/.test(password)) score += 1; // No repeated characters
  if (!/012|123|234|345|456|567|678|789|890/.test(password)) score += 1; // No sequential numbers
  
  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  
  if (score >= 7) strength = 'strong';
  else if (score >= 5) strength = 'good';
  else if (score >= 3) strength = 'fair';
  
  return { strength, score };
};

const getStrengthText = (strength: 'weak' | 'fair' | 'good' | 'strong'): string => {
  switch (strength) {
    case 'weak':
      return 'Weak';
    case 'fair':
      return 'Fair';
    case 'good':
      return 'Good';
    case 'strong':
      return 'Strong';
    default:
      return 'Weak';
  }
};

export const PasswordInput = forwardRef<any, PasswordInputProps>(
  (
    {
      showToggle = true,
      showStrengthIndicator = false,
      onToggleVisibility,
      value,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    const passwordStrength = calculatePasswordStrength(value || '');
    const showStrength = showStrengthIndicator && isFocused && value && value.length > 0;
    
    const handleToggle = () => {
      const newVisibility = !isVisible;
      setIsVisible(newVisibility);
      onToggleVisibility?.(newVisibility);
    };
    
    const handleFocus = (e: any) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };
    
    const handleBlur = (e: any) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };
    
    const rightIcon = showToggle ? (
      <ToggleButton
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityLabel={isVisible ? 'Hide password' : 'Show password'}
        accessibilityHint="Toggle password visibility"
      >
        {isVisible ? (
          <EyeOffIcon size={20} color={tokens.colors.gray[500]} />
        ) : (
          <EyeIcon size={20} color={tokens.colors.gray[500]} />
        )}
      </ToggleButton>
    ) : undefined;
    
    return (
      <YStack width="100%" gap="$xs">
        <AuthInput
          ref={ref}
          secureTextEntry={!isVisible}
          rightIcon={rightIcon}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoComplete="password"
          textContentType="password"
          {...props}
        />
        
        {showStrength && (
          <StrengthIndicator>
            <XStack flex={1} gap="$xs">
              {[1, 2, 3, 4].map((index) => (
                <StrengthBar
                  key={index}
                  strength={passwordStrength.strength}
                  active={index <= Math.ceil(passwordStrength.score / 2)}
                />
              ))}
            </XStack>
            <StrengthText strength={passwordStrength.strength}>
              {getStrengthText(passwordStrength.strength)}
            </StrengthText>
          </StrengthIndicator>
        )}
      </YStack>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;