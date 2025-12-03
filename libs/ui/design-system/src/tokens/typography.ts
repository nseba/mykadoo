/**
 * Typography Tokens
 *
 * Font families, sizes, weights, and line heights
 * Based on brand guidelines with Inter as the primary typeface
 */

export const typography = {
  // Font Families
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Courier New', 'monospace'],
  },

  // Font Sizes (mobile-first approach)
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1' }],         // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px
    '7xl': ['4.5rem', { lineHeight: '1' }],       // 72px
    '8xl': ['6rem', { lineHeight: '1' }],         // 96px
    '9xl': ['8rem', { lineHeight: '1' }],         // 128px
  },

  // Font Weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Line Heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

/**
 * Semantic typography variants
 */
export const typographyVariants = {
  // Display
  display: {
    xl: { fontSize: typography.fontSize['5xl'], fontWeight: typography.fontWeight.bold },
    lg: { fontSize: typography.fontSize['4xl'], fontWeight: typography.fontWeight.bold },
    md: { fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold },
    sm: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold },
  },

  // Headings
  heading: {
    h1: { fontSize: typography.fontSize['4xl'], fontWeight: typography.fontWeight.bold },
    h2: { fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.semibold },
    h3: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.semibold },
    h4: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold },
    h5: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.medium },
    h6: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium },
  },

  // Body
  body: {
    xl: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.normal },
    lg: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.normal },
    base: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.normal },
    sm: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.normal },
    xs: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.normal },
  },

  // Code
  code: {
    base: { fontFamily: typography.fontFamily.mono, fontSize: typography.fontSize.sm },
    sm: { fontFamily: typography.fontFamily.mono, fontSize: typography.fontSize.xs },
  },
} as const;

/**
 * CSS custom properties
 */
export const cssTypographyVariables = {
  '--font-sans': typography.fontFamily.sans.join(', '),
  '--font-mono': typography.fontFamily.mono.join(', '),
  '--font-size-base': '16px',
  '--line-height-base': '1.5',
} as const;

export type TypographyToken = typeof typography;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
export type TypographyVariant = keyof typeof typographyVariants;
