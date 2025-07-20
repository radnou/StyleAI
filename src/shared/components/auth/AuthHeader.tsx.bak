import React from 'react';
import { YStack, XStack, Text, styled } from '@tamagui/core';
import { tokens } from '../../theme/theme-tokens';

export interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  logo?: React.ReactNode;
  alignment?: 'left' | 'center' | 'right';
  variant?: 'default' | 'welcome' | 'minimal';
}

const Container = styled(YStack, {
  name: 'AuthHeader',
  marginBottom: '$xl',
  
  variants: {
    alignment: {
      left: {
        alignItems: 'flex-start',
      },
      center: {
        alignItems: 'center',
      },
      right: {
        alignItems: 'flex-end',
      },
    },
    
    variant: {
      default: {
        gap: '$md',
      },
      welcome: {
        gap: '$lg',
        marginBottom: '$xxl',
      },
      minimal: {
        gap: '$sm',
        marginBottom: '$lg',
      },
    },
  },
});

const LogoContainer = styled(XStack, {
  name: 'AuthHeaderLogo',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '$md',
});

const BrandLogo = styled(YStack, {
  name: 'AuthHeaderBrandLogo',
  width: 60,
  height: 60,
  backgroundColor: '$brand',
  borderRadius: '$md',
  alignItems: 'center',
  justifyContent: 'center',
  
  variants: {
    variant: {
      default: {
        width: 60,
        height: 60,
      },
      welcome: {
        width: 80,
        height: 80,
      },
      minimal: {
        width: 40,
        height: 40,
      },
    },
  },
});

const BrandText = styled(Text, {
  name: 'AuthHeaderBrandText',
  color: 'white',
  fontSize: '$lg',
  fontWeight: '$bold',
  textAlign: 'center',
  
  variants: {
    variant: {
      default: {
        fontSize: '$lg',
      },
      welcome: {
        fontSize: '$xl',
      },
      minimal: {
        fontSize: '$md',
      },
    },
  },
});

const Title = styled(Text, {
  name: 'AuthHeaderTitle',
  color: '$color',
  fontWeight: '$bold',
  textAlign: 'center',
  lineHeight: '$xl',
  
  variants: {
    variant: {
      default: {
        fontSize: '$xxl',
      },
      welcome: {
        fontSize: '$xxxl',
      },
      minimal: {
        fontSize: '$xl',
      },
    },
    
    alignment: {
      left: {
        textAlign: 'left',
      },
      center: {
        textAlign: 'center',
      },
      right: {
        textAlign: 'right',
      },
    },
  },
});

const Subtitle = styled(Text, {
  name: 'AuthHeaderSubtitle',
  color: '$colorFocus',
  textAlign: 'center',
  lineHeight: '$md',
  
  variants: {
    variant: {
      default: {
        fontSize: '$md',
      },
      welcome: {
        fontSize: '$lg',
      },
      minimal: {
        fontSize: '$sm',
      },
    },
    
    alignment: {
      left: {
        textAlign: 'left',
      },
      center: {
        textAlign: 'center',
      },
      right: {
        textAlign: 'right',
      },
    },
  },
});

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  showLogo = true,
  logo,
  alignment = 'center',
  variant = 'default',
}) => {
  return (
    <Container alignment={alignment} variant={variant}>
      {showLogo && (
        <LogoContainer>
          {logo || (
            <BrandLogo variant={variant}>
              <BrandText variant={variant}>SA</BrandText>
            </BrandLogo>
          )}
        </LogoContainer>
      )}
      
      <YStack gap="$xs" alignItems={alignment}>
        <Title
          variant={variant}
          alignment={alignment}
          accessibilityRole="header"
          accessibilityLevel={1}
        >
          {title}
        </Title>
        
        {subtitle && (
          <Subtitle
            variant={variant}
            alignment={alignment}
            accessibilityRole="text"
          >
            {subtitle}
          </Subtitle>
        )}
      </YStack>
    </Container>
  );
};

export default AuthHeader;