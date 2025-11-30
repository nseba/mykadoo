/**
 * Mykadoo Design System - Shadow Tokens
 *
 * Shadow system: xs - xl
 * Soft, subtle shadows for depth
 */

export const shadows = {
  // No shadow
  none: 'none',

  // Extra small - Subtle elevation
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',

  // Small - Cards, buttons
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',

  // Base - Default elevation
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',

  // Medium - Dropdowns, popovers
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',

  // Large - Modals, overlays
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',

  // Extra large - Maximum elevation
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  // 2XL - Hero elements
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.4)',

  // Inner shadow
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

  // Colored shadows (for focus states)
  focus: {
    primary: '0 0 0 3px rgba(255, 107, 107, 0.3)', // Warm coral
    secondary: '0 0 0 3px rgba(51, 154, 240, 0.3)', // Blue
    error: '0 0 0 3px rgba(244, 67, 54, 0.3)', // Red
    success: '0 0 0 3px rgba(76, 175, 80, 0.3)', // Green
  },
} as const;

// Elevation levels (for z-index)
export const elevation = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
} as const;

export type ShadowKey = keyof Omit<typeof shadows, 'focus'>;
export type FocusShadowKey = keyof typeof shadows.focus;
export type ElevationKey = keyof typeof elevation;
