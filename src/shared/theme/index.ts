// FBLA Connect - Design System Theme
// Premium color palette with FBLA brand colors

export const colors = {
  // Primary - FBLA Blue
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  // Secondary - FBLA Gold
  secondary: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
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
  dark: false,
  colors: {
    primary: colors.primary[600],
    accent: colors.secondary[500],
    background: colors.neutral[50],
    surface: '#FFFFFF',
    text: colors.neutral[900],
    onSurface: colors.neutral[900],
    disabled: colors.neutral[400],
    placeholder: colors.neutral[500],
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: colors.error.main,
    error: colors.error.main,
  },
  roundness: borderRadius.md,
};

export const darkPaperTheme = {
  dark: true,
  colors: {
    primary: colors.primary[400],
    accent: colors.secondary[400],
    background: colors.neutral[900],
    surface: colors.neutral[800],
    text: colors.neutral[50],
    onSurface: colors.neutral[50],
    disabled: colors.neutral[600],
    placeholder: colors.neutral[500],
    backdrop: 'rgba(0, 0, 0, 0.7)',
    notification: colors.error.main,
    error: colors.error.light,
  },
  roundness: borderRadius.md,
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  paperTheme,
  darkPaperTheme,
};
