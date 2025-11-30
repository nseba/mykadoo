/**
 * Mykadoo Design System - Color Tokens
 *
 * Brand personality: Warm, friendly, trustworthy
 * Primary: Warm coral #FF6B6B (inviting, friendly)
 * Secondary: Trustworthy blue #339AF0
 */

export const colors = {
  // Primary palette - Warm Coral
  primary: {
    50: '#FFE5E5',
    100: '#FFCCCC',
    200: '#FF9999',
    300: '#FF6B6B', // Main brand color
    400: '#FF4D4D',
    500: '#FF3333',
    600: '#FF1A1A',
    700: '#E60000',
    800: '#CC0000',
    900: '#990000',
  },

  // Secondary palette - Trustworthy Blue
  secondary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#339AF0', // Main secondary color
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Neutral palette - Grays
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Semantic colors
  success: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Main success color
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  warning: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF9800', // Main warning color
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100',
  },

  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336', // Main error color
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },

  info: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Main info color
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Special colors
  white: '#FFFFFF',
  black: '#000000',

  // Background colors
  background: {
    default: '#FFFFFF',
    paper: '#FAFAFA',
    elevated: '#F5F5F5',
  },

  // Text colors
  text: {
    primary: '#212121',
    secondary: '#616161',
    disabled: '#9E9E9E',
    hint: '#BDBDBD',
  },

  // Border colors
  border: {
    default: '#E0E0E0',
    light: '#EEEEEE',
    dark: '#BDBDBD',
  },

  // Overlay colors
  overlay: {
    light: 'rgba(255, 255, 255, 0.9)',
    dark: 'rgba(0, 0, 0, 0.5)',
  },
} as const;

export type ColorToken = typeof colors;
export type ColorKey = keyof typeof colors;
