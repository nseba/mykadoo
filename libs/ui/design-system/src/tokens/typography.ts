/**
 * Mykadoo Design System - Typography Tokens
 *
 * Font family: Inter (display and body)
 * Scale: 12px - 48px
 */

export const typography = {
  // Font families
  fontFamily: {
    display: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    body: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
  },

  // Font sizes
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
  },

  // Font weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Text styles (combinations)
  textStyles: {
    h1: {
      fontSize: '3rem', // 48px
      fontWeight: '700',
      lineHeight: '1.2',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '2.25rem', // 36px
      fontWeight: '700',
      lineHeight: '1.25',
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.875rem', // 30px
      fontWeight: '600',
      lineHeight: '1.3',
      letterSpacing: '0',
    },
    h4: {
      fontSize: '1.5rem', // 24px
      fontWeight: '600',
      lineHeight: '1.35',
      letterSpacing: '0',
    },
    h5: {
      fontSize: '1.25rem', // 20px
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '0',
    },
    h6: {
      fontSize: '1.125rem', // 18px
      fontWeight: '600',
      lineHeight: '1.45',
      letterSpacing: '0',
    },
    body1: {
      fontSize: '1rem', // 16px
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    body2: {
      fontSize: '0.875rem', // 14px
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    caption: {
      fontSize: '0.75rem', // 12px
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0.025em',
    },
    button: {
      fontSize: '0.875rem', // 14px
      fontWeight: '600',
      lineHeight: '1',
      letterSpacing: '0.025em',
      textTransform: 'uppercase' as const,
    },
    overline: {
      fontSize: '0.75rem', // 12px
      fontWeight: '600',
      lineHeight: '1.5',
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
    },
  },
} as const;

export type TypographyToken = typeof typography;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
export type TextStyle = keyof typeof typography.textStyles;
