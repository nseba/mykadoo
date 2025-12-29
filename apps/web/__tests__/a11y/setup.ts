/**
 * Accessibility Testing Setup
 *
 * Configures jest-axe for component-level accessibility testing.
 */

import { configureAxe, toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Configure axe for our project
export const axe = configureAxe({
  rules: {
    // Disable region rule during component testing (no landmarks in isolated components)
    region: { enabled: false },
    // Disable skip-link during component testing
    'skip-link': { enabled: false },
    // Disable landmark rules for isolated components
    'landmark-one-main': { enabled: false },
    'landmark-banner-is-top-level': { enabled: false },
    'landmark-contentinfo-is-top-level': { enabled: false },
  },
});

/**
 * Helper to render and test accessibility of a component
 */
export async function testAccessibility(html: string) {
  const results = await axe(html);
  expect(results).toHaveNoViolations();
}

// Type declarations for jest-axe
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}
