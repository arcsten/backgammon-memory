export const colors = {
  primary: '#1a365d',
  secondary: '#d69e2e',
  background: '#1a202c',
  surface: '#2d3748',
  text: '#e2e8f0',
  textSecondary: '#a0aec0',
  accent: '#38a169',
  error: '#e53e3e',
  warning: '#ed8936',
  info: '#3182ce',
  
  // Specific colors
  white: '#ffffff',
  black: '#000000',
  boardBrown: '#8b4513',
  pieceWhite: '#f7fafc',
  pieceRed: '#c53030',
  
  // Opacity variants
  overlay: 'rgba(0, 0, 0, 0.6)',
  highlight: 'rgba(255, 255, 255, 0.1)',
  border: 'rgba(255, 255, 255, 0.2)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    bold: 'Inter-Bold',
    mono: 'FiraCode-Regular',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
};

