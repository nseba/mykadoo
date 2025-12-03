/**
 * Design Tokens
 *
 * Central export for all design tokens
 */

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './shadows';

import { colors, tailwindColors, cssColorVariables } from './colors';
import { typography, typographyVariants, cssTypographyVariables } from './typography';
import { spacing, borderRadius, borderWidth, containerMaxWidth, cssSpacingVariables } from './spacing';
import { shadows, dropShadow, elevation, focusRing, cssShadowVariables } from './shadows';

/**
 * All design tokens combined
 */
export const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  borderWidth,
  shadows,
  dropShadow,
  elevation,
  focusRing,
  containerMaxWidth,
  typographyVariants,
} as const;

/**
 * Tailwind-compatible tokens
 */
export const tailwindTokens = {
  colors: tailwindColors,
  fontFamily: typography.fontFamily,
  fontSize: typography.fontSize,
  fontWeight: typography.fontWeight,
  lineHeight: typography.lineHeight,
  letterSpacing: typography.letterSpacing,
  spacing,
  borderRadius,
  borderWidth,
  boxShadow: shadows,
  dropShadow,
} as const;

/**
 * CSS custom properties (for runtime theming)
 */
export const cssVariables = {
  ...cssColorVariables,
  ...cssTypographyVariables,
  ...cssSpacingVariables,
  ...cssShadowVariables,
} as const;

/**
 * Breakpoints (mobile-first)
 */
export const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet portrait
  lg: '1024px',  // Tablet landscape / small desktop
  xl: '1280px',  // Desktop
  '2xl': '1536px', // Large desktop
} as const;

/**
 * Z-index scale
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
} as const;

/**
 * Animation durations
 */
export const duration = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms',
} as const;

/**
 * Animation easings
 */
export const easing = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;
