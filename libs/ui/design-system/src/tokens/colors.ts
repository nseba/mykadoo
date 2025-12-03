/**
 * Mykadoo Design System - Color Tokens
 *
 * Brand personality: Warm, friendly, trustworthy
 * Primary: Warm coral #FF6B6B (inviting, friendly)
 * Secondary: Trustworthy blue #339AF0
 *
 * Color scales follow industry standard 50-900 convention where:
 * - 50 is the lightest tint
 * - 500 is the main brand color
 * - 900 is the darkest shade
 */

export const colors = {
  // Brand Colors
  brand: {
    primary: {
      50: '#FFF5F5',  // Lightest - backgrounds
      100: '#FFE3E3',
      200: '#FFC9C9',
      300: '#FFA8A8',
      400: '#FF8787',
      500: '#FF6B6B',  // Main brand color - warm coral
      600: '#FA5252',
      700: '#F03E3E',
      800: '#E03131',
      900: '#C92A2A',  // Darkest - text on light
    },
    secondary: {
      50: '#E7F5FF',  // Lightest - backgrounds
      100: '#D0EBFF',
      200: '#A5D8FF',
      300: '#74C0FC',
      400: '#4DABF7',
      500: '#339AF0',  // Main secondary color - trustworthy blue
      600: '#228BE6',
      700: '#1C7ED6',
      800: '#1971C2',
      900: '#1864AB',  // Darkest - text on light
    },
  },

  // Neutral Colors
  neutral: {
    50: '#F8F9FA',  // Page background
    100: '#F1F3F5',  // Card background
    200: '#E9ECEF',  // Dividers
    300: '#DEE2E6',  // Borders
    400: '#CED4DA',  // Disabled states
    500: '#ADB5BD',  // Placeholder text
    600: '#868E96',  // Secondary text
    700: '#495057',  // Body text
    800: '#343A40',  // Headings
    900: '#212529',  // High emphasis text
  },

  // Semantic Colors
  semantic: {
    success: {
      50: '#EBFBEE',
      500: '#51CF66',  // Success states
      700: '#2F9E44',  // Success dark
      900: '#2B8A3E',
    },
    warning: {
      50: '#FFF9DB',
      500: '#FFD43B',  // Warning states
      700: '#FAB005',  // Warning dark
      900: '#F08C00',
    },
    error: {
      50: '#FFF5F5',
      500: '#FF6B6B',  // Error states (same as primary)
      700: '#F03E3E',  // Error dark
      900: '#C92A2A',
    },
    info: {
      50: '#E7F5FF',
      500: '#339AF0',  // Info states (same as secondary)
      700: '#1C7ED6',  // Info dark
      900: '#1864AB',
    },
  },

  // Special colors
  white: '#FFFFFF',
  black: '#000000',

  // Background colors
  background: {
    default: '#FFFFFF',
    paper: '#F8F9FA',
    elevated: '#F1F3F5',
  },

  // Text colors (derived from neutral scale)
  text: {
    primary: '#212529',    // neutral-900
    secondary: '#495057',  // neutral-700
    disabled: '#ADB5BD',   // neutral-500
    hint: '#868E96',       // neutral-600
  },

  // Border colors (derived from neutral scale)
  border: {
    default: '#DEE2E6',  // neutral-300
    light: '#E9ECEF',    // neutral-200
    dark: '#CED4DA',     // neutral-400
  },

  // Overlay colors
  overlay: {
    light: 'rgba(255, 255, 255, 0.9)',
    dark: 'rgba(0, 0, 0, 0.5)',
  },
} as const;

/**
 * Tailwind-compatible color export
 * Maps our color system to Tailwind's naming convention
 */
export const tailwindColors = {
  primary: colors.brand.primary,
  secondary: colors.brand.secondary,
  neutral: colors.neutral,
  success: {
    50: colors.semantic.success[50],
    500: colors.semantic.success[500],
    700: colors.semantic.success[700],
    900: colors.semantic.success[900],
  },
  warning: {
    50: colors.semantic.warning[50],
    500: colors.semantic.warning[500],
    700: colors.semantic.warning[700],
    900: colors.semantic.warning[900],
  },
  error: {
    50: colors.semantic.error[50],
    500: colors.semantic.error[500],
    700: colors.semantic.error[700],
    900: colors.semantic.error[900],
  },
  info: {
    50: colors.semantic.info[50],
    500: colors.semantic.info[500],
    700: colors.semantic.info[700],
    900: colors.semantic.info[900],
  },
  white: colors.white,
  black: colors.black,
} as const;

/**
 * CSS custom properties for runtime theming
 */
export const cssColorVariables = {
  // Primary
  '--color-primary-50': colors.brand.primary[50],
  '--color-primary-500': colors.brand.primary[500],
  '--color-primary-900': colors.brand.primary[900],

  // Secondary
  '--color-secondary-50': colors.brand.secondary[50],
  '--color-secondary-500': colors.brand.secondary[500],
  '--color-secondary-900': colors.brand.secondary[900],

  // Neutral
  '--color-neutral-50': colors.neutral[50],
  '--color-neutral-500': colors.neutral[500],
  '--color-neutral-900': colors.neutral[900],

  // Semantic
  '--color-success': colors.semantic.success[500],
  '--color-warning': colors.semantic.warning[500],
  '--color-error': colors.semantic.error[500],
  '--color-info': colors.semantic.info[500],
} as const;

export type ColorToken = typeof colors;
export type ColorKey = keyof typeof colors;
