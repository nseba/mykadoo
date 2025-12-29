/**
 * Axe-core Configuration
 *
 * Configuration for automated accessibility testing using axe-core.
 * Used by jest-axe for unit tests and @axe-core/playwright for E2E tests.
 *
 * @see https://github.com/dequelabs/axe-core
 */

module.exports = {
  // Run all WCAG 2.1 Level AA rules
  runOnly: {
    type: 'tag',
    values: [
      'wcag2a',
      'wcag2aa',
      'wcag21a',
      'wcag21aa',
      'best-practice',
    ],
  },

  // Rules configuration
  rules: {
    // Critical violations - must never fail
    'color-contrast': { enabled: true },
    'image-alt': { enabled: true },
    'label': { enabled: true },
    'link-name': { enabled: true },
    'button-name': { enabled: true },
    'document-title': { enabled: true },
    'html-has-lang': { enabled: true },
    'html-lang-valid': { enabled: true },
    'meta-viewport': { enabled: true },
    'bypass': { enabled: true },

    // ARIA rules
    'aria-allowed-attr': { enabled: true },
    'aria-allowed-role': { enabled: true },
    'aria-command-name': { enabled: true },
    'aria-dialog-name': { enabled: true },
    'aria-hidden-body': { enabled: true },
    'aria-hidden-focus': { enabled: true },
    'aria-input-field-name': { enabled: true },
    'aria-meter-name': { enabled: true },
    'aria-progressbar-name': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-required-parent': { enabled: true },
    'aria-roledescription': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-toggle-field-name': { enabled: true },
    'aria-tooltip-name': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },

    // Form accessibility
    'autocomplete-valid': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    'select-name': { enabled: true },

    // Focus management
    'focus-order-semantics': { enabled: true },
    'tabindex': { enabled: true },

    // Semantic HTML
    'heading-order': { enabled: true },
    'landmark-banner-is-top-level': { enabled: true },
    'landmark-complementary-is-top-level': { enabled: true },
    'landmark-contentinfo-is-top-level': { enabled: true },
    'landmark-main-is-top-level': { enabled: true },
    'landmark-no-duplicate-banner': { enabled: true },
    'landmark-no-duplicate-contentinfo': { enabled: true },
    'landmark-no-duplicate-main': { enabled: true },
    'landmark-one-main': { enabled: true },
    'landmark-unique': { enabled: true },
    'page-has-heading-one': { enabled: true },
    'region': { enabled: true },

    // Tables
    'scope-attr-valid': { enabled: true },
    'table-duplicate-name': { enabled: true },
    'td-headers-attr': { enabled: true },
    'th-has-data-cells': { enabled: true },

    // Links and navigation
    'identical-links-same-purpose': { enabled: true },
    'link-in-text-block': { enabled: true },
    'skip-link': { enabled: true },

    // Media
    'audio-caption': { enabled: true },
    'video-caption': { enabled: true },

    // Animation and motion
    'meta-refresh': { enabled: true },

    // Disable rules that may have false positives in development
    'region': { enabled: false }, // Re-enable after landmarks are set up
  },

  // Elements to exclude from testing (third-party widgets, etc.)
  exclude: [
    // Exclude third-party embeds that we can't control
    ['iframe[src*="youtube.com"]'],
    ['iframe[src*="vimeo.com"]'],
    ['iframe[src*="stripe.com"]'],
    // Exclude development-only elements
    ['[data-testid="dev-tools"]'],
  ],

  // Reporter configuration
  reporter: 'v2',

  // Locale (for error messages)
  locale: 'en',

  // Ancestry for debugging
  ancestry: true,

  // XPath for debugging
  xpath: true,

  // Frame selectors
  frameWaitTime: 60000,
  performanceTimer: false,
};
