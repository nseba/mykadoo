const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.spec).{ts,tsx,html}'
    ),
    join(__dirname, 'apps/web/src/**/*!(*.spec).{ts,tsx,html}'),
    join(__dirname, 'libs/ui/design-system/src/**/*!(*.spec).{ts,tsx,html}'),
    join(__dirname, 'libs/ui/design-system/src/**/*.stories.{ts,tsx}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      // Colors from design tokens
      colors: {
        // Coral - Brand primary color (warm, inviting)
        coral: {
          50: '#FFF5F5',
          100: '#FFE5E5',
          200: '#FFB8B8',
          300: '#FF8A8A',
          400: '#FF6B6B',
          500: '#FF5252',
          600: '#E63946',
          700: '#CC2936',
          800: '#B31B28',
          900: '#8B1420',
          DEFAULT: '#FF6B6B',
        },
        primary: {
          50: '#FFE5E5',
          100: '#FFCCCC',
          200: '#FF9999',
          300: '#FF6B6B',
          400: '#FF4D4D',
          500: '#FF3333',
          600: '#FF1A1A',
          700: '#E60000',
          800: '#CC0000',
          900: '#990000',
          DEFAULT: '#FF6B6B',
        },
        secondary: {
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#339AF0',
          600: '#1E88E5',
          700: '#1976D2',
          800: '#1565C0',
          900: '#0D47A1',
          DEFAULT: '#339AF0',
        },
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
        success: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#4CAF50',
          600: '#43A047',
          700: '#388E3C',
          800: '#2E7D32',
          900: '#1B5E20',
          DEFAULT: '#4CAF50',
        },
        warning: {
          50: '#FFF3E0',
          100: '#FFE0B2',
          200: '#FFCC80',
          300: '#FFB74D',
          400: '#FFA726',
          500: '#FF9800',
          600: '#FB8C00',
          700: '#F57C00',
          800: '#EF6C00',
          900: '#E65100',
          DEFAULT: '#FF9800',
        },
        error: {
          50: '#FFEBEE',
          100: '#FFCDD2',
          200: '#EF9A9A',
          300: '#E57373',
          400: '#EF5350',
          500: '#F44336',
          600: '#E53935',
          700: '#D32F2F',
          800: '#C62828',
          900: '#B71C1C',
          DEFAULT: '#F44336',
        },
        info: {
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#2196F3',
          600: '#1E88E5',
          700: '#1976D2',
          800: '#1565C0',
          900: '#0D47A1',
          DEFAULT: '#2196F3',
        },
      },

      // Typography
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          '"Courier New"',
          'monospace',
        ],
      },

      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.5' }],
        lg: ['1.125rem', { lineHeight: '1.5' }],
        xl: ['1.25rem', { lineHeight: '1.4' }],
        '2xl': ['1.5rem', { lineHeight: '1.35' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.25' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
      },

      // Spacing (already good in default Tailwind, but can extend)
      spacing: {
        0.5: '0.125rem',
        1.5: '0.375rem',
        2.5: '0.625rem',
        3.5: '0.875rem',
      },

      // Border radius
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
      },

      // Box shadows
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        DEFAULT:
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        focus: '0 0 0 3px rgba(255, 107, 107, 0.3)',
        'focus-primary': '0 0 0 3px rgba(255, 107, 107, 0.3)',
        'focus-secondary': '0 0 0 3px rgba(51, 154, 240, 0.3)',
        'focus-error': '0 0 0 3px rgba(244, 67, 54, 0.3)',
        'focus-success': '0 0 0 3px rgba(76, 175, 80, 0.3)',
      },

      // Z-index
      zIndex: {
        dropdown: '1000',
        sticky: '1100',
        fixed: '1200',
        overlay: '1300',
        modal: '1400',
        popover: '1500',
        tooltip: '1600',
        toast: '1700',
      },

      // Keyframes for animations
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
