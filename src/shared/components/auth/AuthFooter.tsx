import React from 'react';
import { TouchableOpacity } from 'react-native';
import { YStack, XStack, Text, styled } from '@tamagui/core';
import { tokens } from '../../theme/theme-tokens';

export interface AuthFooterProps {
  primaryText?: string;
  secondaryText?: string;
  linkText?: string;
  onLinkPress?: () => void;
  showTerms?: boolean;
  onTermsPress?: () => void;
  onPrivacyPress?: () => void;
  alignment?: 'left' | 'center' | 'right';
  variant?: 'default' | 'compact' | 'detailed';
}

const Container = styled(YStack, {
  name: 'AuthFooter',
  marginTop: '$xl',
  gap: '$md',
  
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
      compact: {
        gap: '$sm',
        marginTop: '$lg',
      },
      detailed: {
        gap: '$lg',
        marginTop: '$xxl',
      },
    },
  },
});

const ActionContainer = styled(XStack, {
  name: 'AuthFooterAction',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$xs',
  flexWrap: 'wrap',
});

const PrimaryText = styled(Text, {
  name: 'AuthFooterPrimaryText',
  color: '$colorFocus',
  textAlign: 'center',
  
  variants: {
    variant: {
      default: {
        fontSize: '$md',
      },
      compact: {
        fontSize: '$sm',
      },
      detailed: {
        fontSize: '$md',
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

const LinkText = styled(Text, {
  name: 'AuthFooterLinkText',
  color: '$brand',
  fontWeight: '$medium',
  textAlign: 'center',
  
  variants: {
    variant: {
      default: {
        fontSize: '$md',
      },
      compact: {
        fontSize: '$sm',
      },
      detailed: {
        fontSize: '$md',
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

const TermsContainer = styled(YStack, {
  name: 'AuthFooterTerms',
  gap: '$sm',
  alignItems: 'center',
});

const TermsText = styled(Text, {
  name: 'AuthFooterTermsText',
  color: '$colorFocus',
  textAlign: 'center',
  lineHeight: '$sm',
  
  variants: {
    variant: {
      default: {
        fontSize: '$xs',
      },
      compact: {
        fontSize: '$xs',
      },
      detailed: {
        fontSize: '$sm',
      },
    },
  },
});

const TermsLinksContainer = styled(XStack, {
  name: 'AuthFooterTermsLinks',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$md',
  flexWrap: 'wrap',
});

const TermsLink = styled(TouchableOpacity, {
  name: 'AuthFooterTermsLink',
  padding: '$xs',
  borderRadius: '$xs',
});

const TermsLinkText = styled(Text, {
  name: 'AuthFooterTermsLinkText',
  color: '$brand',
  fontWeight: '$medium',
  textDecorationLine: 'underline',
  
  variants: {
    variant: {
      default: {
        fontSize: '$xs',
      },
      compact: {
        fontSize: '$xs',
      },
      detailed: {
        fontSize: '$sm',
      },
    },
  },
});

const Divider = styled(Text, {
  name: 'AuthFooterDivider',
  color: '$colorFocus',
  fontSize: '$xs',
});

export const AuthFooter: React.FC<AuthFooterProps> = ({
  primaryText,
  secondaryText,
  linkText,
  onLinkPress,
  showTerms = true,
  onTermsPress,
  onPrivacyPress,
  alignment = 'center',
  variant = 'default',
}) => {
  return (
    <Container alignment={alignment} variant={variant}>
      {(primaryText || linkText) && (
        <ActionContainer>
          {primaryText && (
            <PrimaryText variant={variant} alignment={alignment}>
              {primaryText}
            </PrimaryText>
          )}
          
          {linkText && onLinkPress && (
            <TouchableOpacity
              onPress={onLinkPress}
              accessibilityRole="button"
              accessibilityLabel={linkText}
            >
              <LinkText variant={variant} alignment={alignment}>
                {linkText}
              </LinkText>
            </TouchableOpacity>
          )}
        </ActionContainer>
      )}
      
      {secondaryText && (
        <PrimaryText variant={variant} alignment={alignment}>
          {secondaryText}
        </PrimaryText>
      )}
      
      {showTerms && (
        <TermsContainer>
          <TermsText variant={variant}>
            By continuing, you agree to our
          </TermsText>
          
          <TermsLinksContainer>
            {onTermsPress && (
              <TermsLink
                onPress={onTermsPress}
                accessibilityRole="button"
                accessibilityLabel="Terms of Service"
              >
                <TermsLinkText variant={variant}>
                  Terms of Service
                </TermsLinkText>
              </TermsLink>
            )}
            
            {onTermsPress && onPrivacyPress && (
              <Divider>•</Divider>
            )}
            
            {onPrivacyPress && (
              <TermsLink
                onPress={onPrivacyPress}
                accessibilityRole="button"
                accessibilityLabel="Privacy Policy"
              >
                <TermsLinkText variant={variant}>
                  Privacy Policy
                </TermsLinkText>
              </TermsLink>
            )}
          </TermsLinksContainer>
        </TermsContainer>
      )}
    </Container>
  );
};

export default AuthFooter;