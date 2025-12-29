/**
 * Accessibility Utilities
 * Centralized exports for all accessibility-related utilities
 */

export {
  getFocusableElements,
  FocusTrap,
  createFocusTrap,
  moveFocus,
  announce,
  type FocusTrapOptions,
} from './focus-management';

export {
  accessibleTextOnWhite,
  accessibleBgForWhiteText,
  focusRingColors,
} from './colors';
