import React from 'react';
import { XStack, YStack, Text, styled } from '@tamagui/core';
import { AuthButton, AuthButtonProps } from './AuthButton';
import { tokens } from '../../theme/theme-tokens';

// Social provider icons (you can replace these with your preferred icon library)
const GoogleIcon = ({ size = 20 }) => (
  <Text style={{ fontSize: size }}>🔍</Text>
);

const AppleIcon = ({ size = 20 }) => (
  <Text style={{ fontSize: size }}>🍎</Text>
);

const FacebookIcon = ({ size = 20 }) => (
  <Text style={{ fontSize: size }}>📘</Text>
);

const TwitterIcon = ({ size = 20 }) => (
  <Text style={{ fontSize: size }}>🐦</Text>
);

export interface SocialAuthButtonsProps {
  onGooglePress?: () => void;
  onApplePress?: () => void;
  onFacebookPress?: () => void;
  onTwitterPress?: () => void;
  isLoading?: boolean;
  loadingProvider?: 'google' | 'apple' | 'facebook' | 'twitter';
  showDivider?: boolean;
  dividerText?: string;
  providers?: ('google' | 'apple' | 'facebook' | 'twitter')[];
  buttonSize?: AuthButtonProps['size'];
  layout?: 'vertical' | 'horizontal';
}

const SocialButton = styled(AuthButton, {
  name: 'SocialAuthButton',
  
  variants: {
    provider: {
      google: {
        backgroundColor: 'white',
        borderColor: '$borderColor',
        borderWidth: 1,
        color: '$color',
        
        hoverStyle: {
          backgroundColor: '$backgroundHover',
          borderColor: '$borderColorHover',
        },
        
        pressStyle: {
          backgroundColor: '$backgroundPress',
          borderColor: '$borderColorPress',
        },
      },
      
      apple: {
        backgroundColor: 'black',
        borderColor: 'black',
        borderWidth: 1,
        color: 'white',
        
        hoverStyle: {
          backgroundColor: '#333333',
          borderColor: '#333333',
        },
        
        pressStyle: {
          backgroundColor: '#555555',
          borderColor: '#555555',
        },
      },
      
      facebook: {
        backgroundColor: '#1877F2',
        borderColor: '#1877F2',
        borderWidth: 1,
        color: 'white',
        
        hoverStyle: {
          backgroundColor: '#166FE5',
          borderColor: '#166FE5',
        },
        
        pressStyle: {
          backgroundColor: '#1464D6',
          borderColor: '#1464D6',
        },
      },
      
      twitter: {
        backgroundColor: '#1DA1F2',
        borderColor: '#1DA1F2',
        borderWidth: 1,
        color: 'white',
        
        hoverStyle: {
          backgroundColor: '#0C90E0',
          borderColor: '#0C90E0',
        },
        
        pressStyle: {
          backgroundColor: '#0A7BC4',
          borderColor: '#0A7BC4',
        },
      },
    },
  },
});

const Divider = styled(XStack, {
  name: 'SocialAuthDivider',
  alignItems: 'center',
  marginVertical: '$md',
  gap: '$md',
});

const DividerLine = styled(YStack, {
  name: 'SocialAuthDividerLine',
  height: 1,
  backgroundColor: '$borderColor',
  flex: 1,
});

const DividerText = styled(Text, {
  name: 'SocialAuthDividerText',
  fontSize: '$sm',
  color: '$colorFocus',
  backgroundColor: '$background',
  paddingHorizontal: '$sm',
  textAlign: 'center',
});

const ButtonContainer = styled(YStack, {
  name: 'SocialAuthButtonContainer',
  gap: '$sm',
  width: '100%',
  
  variants: {
    layout: {
      vertical: {
        flexDirection: 'column',
      },
      horizontal: {
        flexDirection: 'row',
      },
    },
  },
});

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onGooglePress,
  onApplePress,
  onFacebookPress,
  onTwitterPress,
  isLoading = false,
  loadingProvider,
  showDivider = true,
  dividerText = 'or continue with',
  providers = ['google', 'apple'],
  buttonSize = 'medium',
  layout = 'vertical',
}) => {
  const providerConfig = {
    google: {
      icon: <GoogleIcon size={20} />,
      text: 'Continue with Google',
      onPress: onGooglePress,
    },
    apple: {
      icon: <AppleIcon size={20} />,
      text: 'Continue with Apple',
      onPress: onApplePress,
    },
    facebook: {
      icon: <FacebookIcon size={20} />,
      text: 'Continue with Facebook',
      onPress: onFacebookPress,
    },
    twitter: {
      icon: <TwitterIcon size={20} />,
      text: 'Continue with Twitter',
      onPress: onTwitterPress,
    },
  };
  
  const availableProviders = providers.filter(
    (provider) => providerConfig[provider].onPress
  );
  
  if (availableProviders.length === 0) {
    return null;
  }
  
  return (
    <YStack width="100%" gap="$sm">
      {showDivider && (
        <Divider>
          <DividerLine />
          <DividerText>{dividerText}</DividerText>
          <DividerLine />
        </Divider>
      )}
      
      <ButtonContainer layout={layout}>
        {availableProviders.map((provider) => {
          const config = providerConfig[provider];
          const isCurrentLoading = isLoading && loadingProvider === provider;
          
          return (
            <SocialButton
              key={provider}
              provider={provider}
              size={buttonSize}
              fullWidth={layout === 'vertical'}
              leftIcon={config.icon}
              isLoading={isCurrentLoading}
              loadingText={`Signing in...`}
              onPress={config.onPress}
              accessibilityLabel={config.text}
              accessibilityHint={`Sign in using ${provider}`}
            >
              {config.text}
            </SocialButton>
          );
        })}
      </ButtonContainer>
    </YStack>
  );
};

export default SocialAuthButtons;