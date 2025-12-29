/**
 * Lighthouse CI Configuration
 *
 * This config ensures accessibility standards are maintained
 * throughout the development process.
 *
 * @see https://github.com/GoogleChrome/lighthouse-ci
 */

module.exports = {
  ci: {
    collect: {
      // Start the Next.js development server before running Lighthouse
      startServerCommand: 'yarn nx serve web',
      startServerReadyPattern: 'ready on',
      startServerReadyTimeout: 30000,

      // URLs to audit
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/login',
        'http://localhost:3000/signup',
        'http://localhost:3000/search',
        'http://localhost:3000/pricing',
        'http://localhost:3000/blog',
      ],

      // Number of runs per URL for more accurate results
      numberOfRuns: 3,

      // Lighthouse settings
      settings: {
        // Focus on accessibility
        onlyCategories: ['accessibility', 'best-practices'],

        // Chrome flags for CI environment
        chromeFlags: '--no-sandbox --headless --disable-gpu',

        // Skip specific audits if needed
        skipAudits: [],
      },
    },

    assert: {
      // Assertions for CI pass/fail
      assertions: {
        // Accessibility score must be at least 90 (target: 100)
        'categories:accessibility': ['error', { minScore: 0.9 }],

        // Best practices score
        'categories:best-practices': ['warn', { minScore: 0.85 }],

        // Specific accessibility audits - WCAG 2.1 AA requirements

        // Color contrast (WCAG 1.4.3)
        'color-contrast': 'error',

        // Images must have alt text (WCAG 1.1.1)
        'image-alt': 'error',

        // Form elements must have labels (WCAG 1.3.1, 4.1.2)
        'label': 'error',

        // Links must have discernible text (WCAG 2.4.4)
        'link-name': 'error',

        // Buttons must have discernible text (WCAG 4.1.2)
        'button-name': 'error',

        // Document must have title (WCAG 2.4.2)
        'document-title': 'error',

        // HTML must have lang attribute (WCAG 3.1.1)
        'html-has-lang': 'error',

        // Valid lang attribute
        'html-lang-valid': 'error',

        // Heading order should be sequential (WCAG 1.3.1)
        'heading-order': 'warn',

        // Bypass blocks (skip links) (WCAG 2.4.1)
        'bypass': 'warn',

        // ARIA attributes must be valid
        'aria-valid-attr': 'error',
        'aria-valid-attr-value': 'error',
        'aria-allowed-attr': 'error',
        'aria-required-attr': 'error',
        'aria-required-children': 'error',
        'aria-required-parent': 'error',
        'aria-roles': 'error',

        // Focus management
        'focus-traps': 'error',
        'focusable-controls': 'error',
        'interactive-element-affordance': 'warn',
        'logical-tab-order': 'warn',

        // Lists must be structured correctly
        'list': 'warn',
        'listitem': 'warn',

        // Tables must have headers
        'td-headers-attr': 'warn',
        'th-has-data-cells': 'warn',

        // Meta viewport must not disable zoom (WCAG 1.4.4)
        'meta-viewport': 'error',

        // Target size for touch targets
        'target-size': 'warn',
      },
    },

    upload: {
      // Upload results to temporary public storage for PR comments
      target: 'temporary-public-storage',
    },
  },
};
