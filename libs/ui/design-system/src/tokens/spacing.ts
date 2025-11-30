/**
 * Mykadoo Design System - Spacing Tokens
 *
 * Base grid: 4px
 * Scale: 0px - 128px
 */

export const spacing = {
  0: '0', // 0px
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
} as const;

// Border radius scale (4px - 24px)
export const borderRadius = {
  none: '0',
  sm: '0.25rem', // 4px
  base: '0.5rem', // 8px
  md: '0.75rem', // 12px
  lg: '1rem', // 16px
  xl: '1.5rem', // 24px
  '2xl': '2rem', // 32px
  full: '9999px', // Fully rounded
} as const;

// Common spacing patterns
export const spacingPatterns = {
  // Component internal spacing
  componentPadding: {
    sm: spacing[2], // 8px
    md: spacing[4], // 16px
    lg: spacing[6], // 24px
  },

  // Gap between elements
  gap: {
    xs: spacing[1], // 4px
    sm: spacing[2], // 8px
    md: spacing[4], // 16px
    lg: spacing[6], // 24px
    xl: spacing[8], // 32px
  },

  // Section spacing
  section: {
    sm: spacing[8], // 32px
    md: spacing[12], // 48px
    lg: spacing[16], // 64px
    xl: spacing[24], // 96px
  },

  // Container max widths
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;
