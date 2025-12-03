/**
 * Tailwind CSS Configuration for Design System
 * 
 * Integrates design tokens from the Mykadoo design system
 */

const { tailwindTokens, breakpoints, zIndex } = require('./src/tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // Import design token colors
      colors: tailwindTokens.colors,
      
      // Import design token typography
      fontFamily: tailwindTokens.fontFamily,
      fontSize: tailwindTokens.fontSize,
      fontWeight: tailwindTokens.fontWeight,
      lineHeight: tailwindTokens.lineHeight,
      letterSpacing: tailwindTokens.letterSpacing,
      
      // Import design token spacing
      spacing: tailwindTokens.spacing,
      borderRadius: tailwindTokens.borderRadius,
      borderWidth: tailwindTokens.borderWidth,
      
      // Import design token shadows
      boxShadow: tailwindTokens.boxShadow,
      dropShadow: tailwindTokens.dropShadow,
      
      // Breakpoints
      screens: breakpoints,
      
      // Z-index scale
      zIndex,
      
      // Animation
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'fade-out': 'fadeOut 200ms ease-in',
        'slide-in-up': 'slideInUp 300ms ease-out',
        'slide-in-down': 'slideInDown 300ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    // Add plugins for better form styling, typography, etc.
    require('@tailwindcss/forms')({
      strategy: 'class', // Only apply to elements with .form-* classes
    }),
  ],
};
