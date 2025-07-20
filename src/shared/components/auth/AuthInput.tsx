import React, { forwardRef, useState } from 'react';
import { Input, InputProps, XStack, YStack, Text, styled } from '@tamagui/core';
import { useTheme } from '../../theme';
import { tokens } from '../../theme/theme-tokens';

export interface AuthInputProps extends Omit<InputProps, 'theme'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'small' | 'medium' | 'large';
}

const StyledInput = styled(Input, {
  name: 'AuthInput',
  
  variants: {
    variant: {
      default: {
        backgroundColor: '$background',
        borderColor: '$borderColor',
        borderWidth: 1,
        borderRadius: '$md',
        paddingHorizontal: '$md',
        paddingVertical: '$sm',
        fontSize: '$md',
        color: '$color',
        
        focusStyle: {
          borderColor: '$brand',
          backgroundColor: '$backgroundFocus',
        },
        
        hoverStyle: {
          borderColor: '$borderColorHover',
          backgroundColor: '$backgroundHover',
        },
      },
      
      filled: {
        backgroundColor: '$backgroundPress',
        borderColor: 'transparent',
        borderWidth: 1,
        borderRadius: '$md',
        paddingHorizontal: '$md',
        paddingVertical: '$sm',
        fontSize: '$md',
        color: '$color',
        
        focusStyle: {
          backgroundColor: '$background',
          borderColor: '$brand',
        },
        
        hoverStyle: {
          backgroundColor: '$backgroundHover',
        },
      },
      
      outlined: {
        backgroundColor: 'transparent',
        borderColor: '$borderColor',
        borderWidth: 2,
        borderRadius: '$md',
        paddingHorizontal: '$md',
        paddingVertical: '$sm',
        fontSize: '$md',
        color: '$color',
        
        focusStyle: {
          borderColor: '$brand',
          borderWidth: 2,
        },
        
        hoverStyle: {
          borderColor: '$borderColorHover',
        },
      },
    },
    
    size: {
      small: {
        paddingHorizontal: '$sm',
        paddingVertical: '$xs',
        fontSize: '$sm',
        height: 36,
      },
      
      medium: {
        paddingHorizontal: '$md',
        paddingVertical: '$sm',
        fontSize: '$md',
        height: 48,
      },
      
      large: {
        paddingHorizontal: '$lg',
        paddingVertical: '$md',
        fontSize: '$lg',
        height: 56,
      },
    },
    
    hasError: {
      true: {
        borderColor: '$error',
        
        focusStyle: {
          borderColor: '$error',
        },
        
        hoverStyle: {
          borderColor: '$error',
        },
      },
    },
  },
  
  defaultVariants: {
    variant: 'default',
    size: 'medium',
    hasError: false,
  },
});

const StyledLabel = styled(Text, {
  name: 'AuthInputLabel',
  fontSize: '$sm',
  fontWeight: '$medium',
  color: '$color',
  marginBottom: '$xs',
  
  variants: {
    required: {
      true: {
        '::after': {
          content: ' *',
          color: '$error',
        },
      },
    },
  },
});

const StyledError = styled(Text, {
  name: 'AuthInputError',
  fontSize: '$xs',
  color: '$error',
  marginTop: '$xs',
  lineHeight: '$xs',
});

const StyledHelper = styled(Text, {
  name: 'AuthInputHelper',
  fontSize: '$xs',
  color: '$colorFocus',
  marginTop: '$xs',
  lineHeight: '$xs',
});

const InputContainer = styled(XStack, {
  name: 'AuthInputContainer',
  position: 'relative',
  alignItems: 'center',
  width: '100%',
});

const IconContainer = styled(XStack, {
  name: 'AuthInputIcon',
  position: 'absolute',
  zIndex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  
  variants: {
    position: {
      left: {
        left: '$sm',
      },
      right: {
        right: '$sm',
      },
    },
  },
});

export const AuthInput = forwardRef<any, AuthInputProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      leftIcon,
      rightIcon,
      variant = 'default',
      size = 'medium',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasError = Boolean(error);
    
    const handleFocus = (e: any) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };
    
    const handleBlur = (e: any) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };
    
    const leftPadding = leftIcon ? '$xl' : undefined;
    const rightPadding = rightIcon ? '$xl' : undefined;
    
    return (
      <YStack width="100%" gap="$xs">
        {label && (
          <StyledLabel required={required}>
            {label}
          </StyledLabel>
        )}
        
        <InputContainer>
          {leftIcon && (
            <IconContainer position="left">
              {leftIcon}
            </IconContainer>
          )}
          
          <StyledInput
            ref={ref}
            variant={variant}
            size={size}
            hasError={hasError}
            paddingLeft={leftPadding}
            paddingRight={rightPadding}
            onFocus={handleFocus}
            onBlur={handleBlur}
            accessibilityLabel={label}
            accessibilityHint={helperText}
            accessibilityInvalid={hasError}
            accessibilityRequired={required}
            {...props}
          />
          
          {rightIcon && (
            <IconContainer position="right">
              {rightIcon}
            </IconContainer>
          )}
        </InputContainer>
        
        {error && (
          <StyledError
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
          >
            {error}
          </StyledError>
        )}
        
        {helperText && !error && (
          <StyledHelper>
            {helperText}
          </StyledHelper>
        )}
      </YStack>
    );
  }
);

AuthInput.displayName = 'AuthInput';

export default AuthInput;