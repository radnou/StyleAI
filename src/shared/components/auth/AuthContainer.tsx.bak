import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { YStack, styled } from '@tamagui/core';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '../../theme/theme-tokens';

export interface AuthContainerProps {
  children: React.ReactNode;
  showBackgroundGradient?: boolean;
  enableKeyboardAvoidance?: boolean;
  enableScrolling?: boolean;
  padding?: keyof typeof tokens.space;
}

const Container = styled(YStack, {
  name: 'AuthContainer',
  flex: 1,
  backgroundColor: '$background',
  
  variants: {
    gradient: {
      true: {
        backgroundColor: 'transparent',
        backgroundImage: 'linear-gradient(135deg, $gradientStart 0%, $gradientEnd 100%)',
      },
      false: {
        backgroundColor: '$background',
      },
    },
  },
});

const GradientOverlay = styled(YStack, {
  name: 'AuthGradientOverlay',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'transparent',
  backgroundImage: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
  opacity: 0.05,
});

const ContentContainer = styled(YStack, {
  name: 'AuthContentContainer',
  flex: 1,
  position: 'relative',
  zIndex: 1,
  
  variants: {
    padding: {
      xs: {
        padding: '$xs',
      },
      sm: {
        padding: '$sm',
      },
      md: {
        padding: '$md',
      },
      lg: {
        padding: '$lg',
      },
      xl: {
        padding: '$xl',
      },
      xxl: {
        padding: '$xxl',
      },
    },
  },
});

const ScrollContainer = styled(ScrollView, {
  name: 'AuthScrollContainer',
  flex: 1,
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: {
    flexGrow: 1,
  },
});

const KeyboardContainer = styled(KeyboardAvoidingView, {
  name: 'AuthKeyboardContainer',
  flex: 1,
});

export const AuthContainer: React.FC<AuthContainerProps> = ({
  children,
  showBackgroundGradient = false,
  enableKeyboardAvoidance = true,
  enableScrolling = true,
  padding = 'lg',
}) => {
  const insets = useSafeAreaInsets();
  
  const content = (
    <ContentContainer
      padding={padding}
      style={{
        paddingTop: Math.max(insets.top, 16),
        paddingBottom: Math.max(insets.bottom, 16),
        paddingLeft: Math.max(insets.left, 16),
        paddingRight: Math.max(insets.right, 16),
      }}
    >
      {children}
    </ContentContainer>
  );
  
  const wrappedContent = enableScrolling ? (
    <ScrollContainer
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
      }}
      keyboardShouldPersistTaps="handled"
      bounces={false}
    >
      {content}
    </ScrollContainer>
  ) : (
    content
  );
  
  const keyboardAvoidingContent = enableKeyboardAvoidance ? (
    <KeyboardContainer
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {wrappedContent}
    </KeyboardContainer>
  ) : (
    wrappedContent
  );
  
  return (
    <Container gradient={showBackgroundGradient}>
      {showBackgroundGradient && <GradientOverlay />}
      {keyboardAvoidingContent}
    </Container>
  );
};

export default AuthContainer;