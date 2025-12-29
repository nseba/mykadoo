/**
 * Accessibility E2E Tests
 *
 * Automated accessibility testing using Playwright and axe-core.
 * These tests verify WCAG 2.1 AA compliance across all major pages.
 *
 * @see https://www.w3.org/WAI/WCAG21/quickref/
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Note: axeConfig is imported dynamically when needed for custom rule configuration
// For now, we use the default AxeBuilder configuration which includes WCAG 2.1 AA rules

/**
 * Custom expect for axe results
 */
function expectNoViolations(
  violations: Array<{
    id: string;
    impact: string | undefined;
    description: string;
    nodes: Array<{ html: string; target: string[] }>;
  }>
) {
  if (violations.length > 0) {
    const violationMessages = violations.map(
      (v) =>
        `${v.id} (${v.impact}): ${v.description}\n` +
        `  Affected elements:\n` +
        v.nodes.map((n) => `    - ${n.target.join(' > ')}`).join('\n')
    );
    throw new Error(
      `Found ${violations.length} accessibility violations:\n\n${violationMessages.join('\n\n')}`
    );
  }
}

test.describe('Accessibility Tests', () => {
  test.describe('Homepage', () => {
    test('should have no accessibility violations', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expectNoViolations(results.violations);
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/');

      // Check for h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);

      // Check heading order (h2 should not appear before h1)
      const headings = await page.evaluate(() => {
        const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        return Array.from(headingElements).map((h) => ({
          level: parseInt(h.tagName[1]),
          text: h.textContent?.trim(),
        }));
      });

      // Verify proper hierarchy
      let lastLevel = 0;
      for (const heading of headings) {
        // Level should not jump by more than 1 (e.g., h1 -> h3 is invalid)
        expect(heading.level).toBeLessThanOrEqual(lastLevel + 1);
        lastLevel = heading.level;
      }
    });

    test('should have accessible images', async ({ page }) => {
      await page.goto('/');

      const images = await page.locator('img').all();
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        const ariaHidden = await img.getAttribute('aria-hidden');
        const role = await img.getAttribute('role');

        // Every image should have alt text OR be decorative
        const isDecorative = ariaHidden === 'true' || role === 'presentation' || alt === '';
        const hasAlt = alt !== null;

        expect(isDecorative || hasAlt).toBeTruthy();
      }
    });
  });

  test.describe('Authentication Pages', () => {
    test('login page should be accessible', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expectNoViolations(results.violations);
    });

    test('signup page should be accessible', async ({ page }) => {
      await page.goto('/signup');
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expectNoViolations(results.violations);
    });

    test('login form should have proper labels', async ({ page }) => {
      await page.goto('/login');

      // Check that all inputs have associated labels
      const inputs = await page.locator('input:not([type="hidden"])').all();
      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        // Placeholder should not be used as sole accessible name
        const _placeholder = await input.getAttribute('placeholder');

        if (id) {
          const label = await page.locator(`label[for="${id}"]`).count();
          // Note: placeholder is intentionally not included as a valid label source per WCAG
          const hasLabel = label > 0 || ariaLabel || ariaLabelledBy;
          expect(hasLabel).toBeTruthy();
        }
      }
    });
  });

  test.describe('Search Page', () => {
    test('search page should be accessible', async ({ page }) => {
      await page.goto('/search');
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expectNoViolations(results.violations);
    });

    test('search input should be properly labeled', async ({ page }) => {
      await page.goto('/search');

      const searchInput = page.locator('input[type="search"], input[role="searchbox"], input[name*="search"], input[placeholder*="search" i]').first();

      if (await searchInput.count() > 0) {
        const ariaLabel = await searchInput.getAttribute('aria-label');
        const id = await searchInput.getAttribute('id');

        if (id) {
          const labelCount = await page.locator(`label[for="${id}"]`).count();
          expect(ariaLabel || labelCount > 0).toBeTruthy();
        } else {
          expect(ariaLabel).toBeTruthy();
        }
      }
    });
  });

  test.describe('Pricing Page', () => {
    test('pricing page should be accessible', async ({ page }) => {
      await page.goto('/pricing');
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expectNoViolations(results.violations);
    });
  });

  test.describe('Blog Pages', () => {
    test('blog listing should be accessible', async ({ page }) => {
      await page.goto('/blog');
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expectNoViolations(results.violations);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should be able to navigate with Tab key', async ({ page }) => {
      await page.goto('/');

      // Start from the beginning
      await page.keyboard.press('Tab');

      // Should focus on first focusable element
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();

      // Tab through several elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        const focused = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tag: el?.tagName,
            hasVisibleFocus: el
              ? window.getComputedStyle(el).outlineWidth !== '0px' ||
                window.getComputedStyle(el).boxShadow !== 'none'
              : false,
          };
        });
        expect(focused.tag).toBeTruthy();
      }
    });

    test('interactive elements should be keyboard accessible', async ({ page }) => {
      await page.goto('/');

      // Find all interactive elements
      const interactive = await page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])').all();

      for (const element of interactive.slice(0, 10)) {
        // Check if element can receive focus
        await element.focus();
        const isFocused = await element.evaluate((el) => document.activeElement === el);
        expect(isFocused).toBeTruthy();
      }
    });

    test('should not have keyboard traps', async ({ page }) => {
      await page.goto('/');

      // Tab through many elements to ensure we can eventually exit
      const maxTabs = 100;
      const seenElements = new Set<string>();

      for (let i = 0; i < maxTabs; i++) {
        await page.keyboard.press('Tab');
        const focused = await page.evaluate(() => {
          const el = document.activeElement;
          return el ? `${el.tagName}#${el.id}.${el.className}` : 'body';
        });

        if (seenElements.has(focused) && seenElements.size > 5) {
          // We've cycled through - no trap
          break;
        }
        seenElements.add(focused);
      }

      // Should have found multiple unique focusable elements
      expect(seenElements.size).toBeGreaterThan(1);
    });
  });

  test.describe('Color Contrast', () => {
    test('text should have sufficient color contrast', async ({ page }) => {
      await page.goto('/');

      const results = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();

      // Color contrast violations should be zero
      const contrastViolations = results.violations.filter((v) => v.id === 'color-contrast');
      expectNoViolations(contrastViolations);
    });
  });

  test.describe('ARIA Landmarks', () => {
    test('should have main landmark', async ({ page }) => {
      await page.goto('/');

      const mainCount = await page.locator('main, [role="main"]').count();
      expect(mainCount).toBeGreaterThanOrEqual(1);
    });

    test('should have navigation landmark', async ({ page }) => {
      await page.goto('/');

      const navCount = await page.locator('nav, [role="navigation"]').count();
      expect(navCount).toBeGreaterThanOrEqual(1);
    });

    test('landmarks should be unique or labeled', async ({ page }) => {
      await page.goto('/');

      // If there are multiple nav elements, they should have aria-label
      const navs = await page.locator('nav, [role="navigation"]').all();
      if (navs.length > 1) {
        for (const nav of navs) {
          const label = await nav.getAttribute('aria-label');
          const labelledBy = await nav.getAttribute('aria-labelledby');
          expect(label || labelledBy).toBeTruthy();
        }
      }
    });
  });

  test.describe('Focus Visibility', () => {
    test('focused elements should have visible focus indicator', async ({ page }) => {
      await page.goto('/');

      // Tab to a few elements and check focus visibility
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');

        const hasVisibleFocus = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return true; // Skip body

          const styles = window.getComputedStyle(el);
          const outline = styles.outline;
          const outlineWidth = styles.outlineWidth;
          const boxShadow = styles.boxShadow;

          // Check for visible focus indicators
          return (
            (outlineWidth && outlineWidth !== '0px') ||
            (boxShadow && boxShadow !== 'none') ||
            outline !== 'none'
          );
        });

        // Every focusable element should have a visible focus indicator
        expect(hasVisibleFocus).toBeTruthy();
      }
    });
  });
});

test.describe('Accessibility - Screen Reader Announcements', () => {
  test('page should have title', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('page should have lang attribute', async ({ page }) => {
    await page.goto('/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // e.g., 'en' or 'en-US'
  });
});
