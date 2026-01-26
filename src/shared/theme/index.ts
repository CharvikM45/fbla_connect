// Premium color palette with FBLA brand colors
import { MD3LightTheme, MD3DarkTheme, adaptNavigationTheme } from 'react-native-paper';
import {
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme
} from '@react-navigation/native';

export const colors = {
  // Primary - FBLA Navy & Blue
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#1d52bc', // Official FBLA Blue
    600: '#0a2e7f', // Official FBLA Navy
    700: '#082566',
    800: '#061c4d',
    900: '#041333',
  },
  // Secondary - FBLA Gold
  secondary: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#f4ab19', // Official FBLA Gold
    600: '#db9a17',
    700: '#c28814',
    800: '#a97712',
    900: '#906510',
  },
  // Neutral
  neutral: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
  },
  // Semantic
  success: {
    light: '#D1FAE5',
    main: '#10B981',
    dark: '#047857',
  },
  warning: {
    light: '#FEF3C7',
    main: '#F59E0B',
    dark: '#B45309',
  },
  error: {
    light: '#FEE2E2',
    main: '#EF4444',
    dark: '#B91C1C',
  },
  info: {
    light: '#DBEAFE',
    main: '#3B82F6',
    dark: '#1D4ED8',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// React Native Paper theme configuration
export const paperTheme = {
  ...MD3LightTheme,
  dark: false,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary[600],
    secondary: colors.secondary[500],
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    background: colors.neutral[50],
    surface: '#FFFFFF',
    error: colors.error.main,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: 'transparent',
      level1: colors.primary[50],
      level2: colors.primary[50],
      level3: colors.primary[50],
      level4: colors.primary[100],
      level5: colors.primary[100],
    }
  },
  roundness: borderRadius.md,
};

export const darkPaperTheme = {
  ...MD3DarkTheme,
  dark: true,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary[400],
    secondary: colors.secondary[400],
    onPrimary: colors.neutral[900],
    onSecondary: colors.neutral[900],
    background: colors.neutral[900],
    surface: colors.neutral[800],
    error: colors.error.light,
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level0: 'transparent',
      level1: colors.neutral[800],
      level2: colors.neutral[800],
      level3: colors.neutral[800],
      level4: colors.neutral[700],
      level5: colors.neutral[700],
    }
  },
  roundness: borderRadius.md,
};

// Adapt navigation themes
const { LightTheme: adaptedLightTheme, DarkTheme: adaptedDarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
  materialLight: paperTheme,
  materialDark: darkPaperTheme,
});

export const navigationLightTheme = adaptedLightTheme;
export const navigationDarkTheme = adaptedDarkTheme;

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  paperTheme,
  darkPaperTheme,
  navigationLightTheme,
  navigationDarkTheme,
};
