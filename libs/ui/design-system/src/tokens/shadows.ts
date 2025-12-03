/**
 * Shadow Tokens
 *
 * Elevation system for depth and hierarchy
 */

export const shadows = {
  // Shadow scale (xs to 2xl)
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

  // Inner shadows
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',

  // No shadow
  none: '0 0 #0000',
} as const;

/**
 * Drop shadows (for filters)
 */
export const dropShadow = {
  sm: '0 1px 1px rgb(0 0 0 / 0.05)',
  DEFAULT: ['0 1px 2px rgb(0 0 0 / 0.1)', '0 1px 1px rgb(0 0 0 / 0.06)'],
  md: ['0 4px 3px rgb(0 0 0 / 0.07)', '0 2px 2px rgb(0 0 0 / 0.06)'],
  lg: ['0 10px 8px rgb(0 0 0 / 0.04)', '0 4px 3px rgb(0 0 0 / 0.1)'],
  xl: ['0 20px 13px rgb(0 0 0 / 0.03)', '0 8px 5px rgb(0 0 0 / 0.08)'],
  '2xl': '0 25px 25px rgb(0 0 0 / 0.15)',
  none: '0 0 #0000',
} as const;

/**
 * Semantic elevation levels
 */
export const elevation = {
  base: shadows.none,        // 0 - Flush with background
  raised: shadows.sm,        // 1 - Slightly elevated (cards)
  overlay: shadows.lg,       // 2 - Overlays (dropdowns, popovers)
  modal: shadows.xl,         // 3 - Modal dialogs
  popout: shadows['2xl'],    // 4 - Notifications, tooltips
} as const;

/**
 * Focus ring styles
 */
export const focusRing = {
  DEFAULT: '0 0 0 3px rgba(255, 107, 107, 0.2)', // Coral focus ring
  secondary: '0 0 0 3px rgba(51, 154, 240, 0.2)', // Blue focus ring
  error: '0 0 0 3px rgba(255, 107, 107, 0.3)',
  none: 'none',
} as const;

/**
 * CSS custom properties
 */
export const cssShadowVariables = {
  '--shadow-sm': shadows.sm,
  '--shadow-md': shadows.md,
  '--shadow-lg': shadows.lg,
  '--shadow-xl': shadows.xl,
  '--focus-ring': focusRing.DEFAULT,
} as const;

export type ShadowKey = keyof typeof shadows;
export type ElevationKey = keyof typeof elevation;
export type FocusRingKey = keyof typeof focusRing;
