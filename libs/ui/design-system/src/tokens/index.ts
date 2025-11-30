/**
 * Mykadoo Design System - Design Tokens
 *
 * Centralized export of all design tokens
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, spacingPatterns } from './spacing';
import { shadows, elevation } from './shadows';

export { colors, type ColorToken, type ColorKey } from './colors';
export {
  typography,
  type TypographyToken,
  type FontSize,
  type FontWeight,
  type TextStyle,
} from './typography';
export {
  spacing,
  borderRadius,
  spacingPatterns,
  type SpacingKey,
  type BorderRadiusKey,
} from './spacing';
export {
  shadows,
  elevation,
  type ShadowKey,
  type FocusShadowKey,
  type ElevationKey,
} from './shadows';

// Re-export all tokens as a single object
export const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  spacingPatterns,
  shadows,
  elevation,
} as const;

export type DesignTokens = typeof tokens;
