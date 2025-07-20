import { createAnimations } from '@tamagui/animations-react-native';
import { createInterFont } from '@tamagui/font-inter';
import { createMedia } from '@tamagui/responsive-media';
import { shorthands } from '@tamagui/shorthands';
import { themes, tokens } from '@tamagui/themes';
import { createTamagui } from '@tamagui/core';

const animations = createAnimations({
  bouncy: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  lazy: {
    type: 'spring',
    damping: 20,
    stiffness: 60,
  },
  slow: {
    type: 'spring',
    damping: 20,
    stiffness: 40,
  },
  quick: {
    type: 'spring',
    damping: 20,
    stiffness: 120,
  },
  tooltip: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
});

const headingFont = createInterFont();
const bodyFont = createInterFont();

const config = createTamagui({
  animations,
  defaultTheme: 'light',
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  themes: {
    ...themes,
    light: {
      ...themes.light,
      // StyleAI Brand Colors
      brand: '#6366F1', // Indigo 500
      brandHover: '#4F46E5', // Indigo 600
      brandPress: '#4338CA', // Indigo 700
      brandFocus: '#818CF8', // Indigo 400
      
      // Semantic Colors
      success: '#10B981', // Emerald 500
      warning: '#F59E0B', // Amber 500
      error: '#EF4444', // Red 500
      info: '#3B82F6', // Blue 500
      
      // Neutral Colors
      background: '#FFFFFF',
      backgroundHover: '#F9FAFB',
      backgroundPress: '#F3F4F6',
      backgroundFocus: '#E5E7EB',
      
      color: '#111827', // Gray 900
      colorHover: '#1F2937', // Gray 800
      colorPress: '#374151', // Gray 700
      colorFocus: '#6B7280', // Gray 500
      
      // Border Colors
      borderColor: '#E5E7EB', // Gray 200
      borderColorHover: '#D1D5DB', // Gray 300
      borderColorPress: '#9CA3AF', // Gray 400
      borderColorFocus: '#6366F1', // Brand
      
      // Shadow Colors
      shadowColor: '#00000020',
      shadowColorHover: '#00000030',
      shadowColorPress: '#00000040',
      shadowColorFocus: '#6366F130',
      
      // Glass morphism
      glass: '#FFFFFF80',
      glassBorder: '#FFFFFF40',
      
      // Gradients
      gradientStart: '#6366F1',
      gradientEnd: '#8B5CF6',
      gradientSoft: '#F3F4F6',
    },
    dark: {
      ...themes.dark,
      // StyleAI Brand Colors (adjusted for dark mode)
      brand: '#818CF8', // Indigo 400
      brandHover: '#6366F1', // Indigo 500
      brandPress: '#4F46E5', // Indigo 600
      brandFocus: '#A5B4FC', // Indigo 300
      
      // Semantic Colors
      success: '#34D399', // Emerald 400
      warning: '#FBBF24', // Amber 400
      error: '#F87171', // Red 400
      info: '#60A5FA', // Blue 400
      
      // Neutral Colors
      background: '#0F172A', // Slate 900
      backgroundHover: '#1E293B', // Slate 800
      backgroundPress: '#334155', // Slate 700
      backgroundFocus: '#475569', // Slate 600
      
      color: '#F1F5F9', // Slate 100
      colorHover: '#E2E8F0', // Slate 200
      colorPress: '#CBD5E1', // Slate 300
      colorFocus: '#94A3B8', // Slate 400
      
      // Border Colors
      borderColor: '#334155', // Slate 700
      borderColorHover: '#475569', // Slate 600
      borderColorPress: '#64748B', // Slate 500
      borderColorFocus: '#818CF8', // Brand
      
      // Shadow Colors
      shadowColor: '#00000060',
      shadowColorHover: '#00000070',
      shadowColorPress: '#00000080',
      shadowColorFocus: '#818CF860',
      
      // Glass morphism
      glass: '#0F172A80',
      glassBorder: '#FFFFFF20',
      
      // Gradients
      gradientStart: '#818CF8',
      gradientEnd: '#C084FC',
      gradientSoft: '#1E293B',
    },
  },
  tokens: {
    ...tokens,
    // Custom spacing tokens
    space: {
      ...tokens.space,
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
      xxxl: 64,
    },
    // Custom size tokens
    size: {
      ...tokens.size,
      xs: 16,
      sm: 24,
      md: 32,
      lg: 48,
      xl: 64,
      xxl: 96,
      xxxl: 128,
    },
    // Custom radius tokens
    radius: {
      ...tokens.radius,
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      xxl: 32,
      round: 999,
    },
    // Custom z-index tokens
    zIndex: {
      ...tokens.zIndex,
      modal: 1000,
      toast: 1100,
      tooltip: 1200,
      dropdown: 1300,
    },
  },
  media: createMedia({
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  }),
});

export type Conf = typeof config;

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
}

export default config;