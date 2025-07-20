import React, { forwardRef } from 'react';
import { Button, ButtonProps, styled, Spinner, Text } from '@tamagui/core';
import { useTheme } from '../../theme';
import { tokens } from '../../theme/theme-tokens';

export interface AuthButtonProps extends Omit<ButtonProps, 'theme'> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'link';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const StyledButton = styled(Button, {
  name: 'AuthButton',
  borderRadius: '$md',
  fontWeight: '$semibold',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  
  variants: {
    variant: {
      primary: {
        backgroundColor: '$brand',
        color: 'white',
        borderColor: '$brand',
        borderWidth: 1,
        
        hoverStyle: {
          backgroundColor: '$brandHover',
          borderColor: '$brandHover',
          scale: 1.02,
        },
        
        pressStyle: {
          backgroundColor: '$brandPress',
          borderColor: '$brandPress',
          scale: 0.98,
        },
        
        focusStyle: {
          backgroundColor: '$brandFocus',
          borderColor: '$brandFocus',
          outlineColor: '$brandFocus',
          outlineWidth: 2,
          outlineOffset: 2,
        },
        
        disabledStyle: {
          backgroundColor: '$colorFocus',
          borderColor: '$colorFocus',
          color: '$background',
          opacity: 0.5,
        },
      },
      
      secondary: {
        backgroundColor: 'transparent',
        color: '$brand',
        borderColor: '$brand',
        borderWidth: 2,
        
        hoverStyle: {
          backgroundColor: '$brandFocus',
          color: 'white',
          borderColor: '$brandHover',
          scale: 1.02,
        },
        
        pressStyle: {
          backgroundColor: '$brandPress',
          color: 'white',
          borderColor: '$brandPress',
          scale: 0.98,
        },
        
        focusStyle: {
          backgroundColor: '$brandFocus',
          color: 'white',
          borderColor: '$brandFocus',
          outlineColor: '$brandFocus',
          outlineWidth: 2,
          outlineOffset: 2,
        },
        
        disabledStyle: {
          backgroundColor: 'transparent',
          color: '$colorFocus',
          borderColor: '$colorFocus',
          opacity: 0.5,
        },
      },
      
      tertiary: {
        backgroundColor: '$backgroundPress',
        color: '$color',
        borderColor: '$borderColor',
        borderWidth: 1,
        
        hoverStyle: {
          backgroundColor: '$backgroundHover',
          borderColor: '$borderColorHover',
          scale: 1.02,
        },
        
        pressStyle: {
          backgroundColor: '$backgroundFocus',
          borderColor: '$borderColorPress',
          scale: 0.98,
        },
        
        focusStyle: {
          backgroundColor: '$backgroundFocus',
          borderColor: '$borderColorFocus',
          outlineColor: '$borderColorFocus',
          outlineWidth: 2,
          outlineOffset: 2,
        },
        
        disabledStyle: {
          backgroundColor: '$backgroundPress',
          color: '$colorFocus',
          borderColor: '$borderColor',
          opacity: 0.5,
        },
      },
      
      ghost: {
        backgroundColor: 'transparent',
        color: '$color',
        borderColor: 'transparent',
        borderWidth: 1,
        
        hoverStyle: {
          backgroundColor: '$backgroundHover',
          color: '$colorHover',
          scale: 1.02,
        },
        
        pressStyle: {
          backgroundColor: '$backgroundPress',
          color: '$colorPress',
          scale: 0.98,
        },
        
        focusStyle: {
          backgroundColor: '$backgroundFocus',
          color: '$colorFocus',
          outlineColor: '$borderColorFocus',
          outlineWidth: 2,
          outlineOffset: 2,
        },
        
        disabledStyle: {
          backgroundColor: 'transparent',
          color: '$colorFocus',
          opacity: 0.5,
        },
      },
      
      link: {
        backgroundColor: 'transparent',
        color: '$brand',
        borderColor: 'transparent',
        borderWidth: 0,
        textDecorationLine: 'underline',
        
        hoverStyle: {
          color: '$brandHover',
          textDecorationLine: 'underline',
        },
        
        pressStyle: {
          color: '$brandPress',
          textDecorationLine: 'underline',
        },
        
        focusStyle: {
          color: '$brandFocus',
          textDecorationLine: 'underline',
          outlineColor: '$brandFocus',
          outlineWidth: 2,
          outlineOffset: 2,
        },
        
        disabledStyle: {
          color: '$colorFocus',
          textDecorationLine: 'none',
          opacity: 0.5,
        },
      },
    },
    
    size: {
      small: {
        paddingHorizontal: '$sm',
        paddingVertical: '$xs',
        fontSize: '$sm',
        height: 36,
        minWidth: 80,
      },
      
      medium: {
        paddingHorizontal: '$md',
        paddingVertical: '$sm',
        fontSize: '$md',
        height: 48,
        minWidth: 120,
      },
      
      large: {
        paddingHorizontal: '$lg',
        paddingVertical: '$md',
        fontSize: '$lg',
        height: 56,
        minWidth: 140,
      },
    },
    
    fullWidth: {
      true: {
        width: '100%',
        minWidth: '100%',
      },
    },
    
    isLoading: {
      true: {
        opacity: 0.8,
        cursor: 'not-allowed',
      },
    },
  },
  
  defaultVariants: {
    variant: 'primary',
    size: 'medium',
    fullWidth: false,
    isLoading: false,
  },
});

const ButtonContent = styled(Text, {
  name: 'AuthButtonContent',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$xs',
  fontWeight: 'inherit',
  color: 'inherit',
  fontSize: 'inherit',
});

const IconContainer = styled(Text, {
  name: 'AuthButtonIcon',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const AuthButton = forwardRef<any, AuthButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;
    const buttonText = isLoading && loadingText ? loadingText : children;
    
    return (
      <StyledButton
        ref={ref}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        isLoading={isLoading}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{
          disabled: isDisabled,
          busy: isLoading,
        }}
        accessibilityLabel={typeof buttonText === 'string' ? buttonText : undefined}
        {...props}
      >
        <ButtonContent>
          {isLoading ? (
            <Spinner size="small" color="currentColor" />
          ) : (
            leftIcon && <IconContainer>{leftIcon}</IconContainer>
          )}
          
          {buttonText}
          
          {!isLoading && rightIcon && (
            <IconContainer>{rightIcon}</IconContainer>
          )}
        </ButtonContent>
      </StyledButton>
    );
  }
);

AuthButton.displayName = 'AuthButton';

export default AuthButton;