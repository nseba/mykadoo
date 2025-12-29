/**
 * Component Accessibility Tests
 *
 * Tests UI components for WCAG 2.1 AA compliance using jest-axe.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Test utility for accessibility
async function testA11y(ui: React.ReactElement) {
  const { container } = render(ui);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
}

describe('Accessibility Tests', () => {
  describe('Basic HTML Elements', () => {
    it('button with text should be accessible', async () => {
      await testA11y(<button type="button">Click me</button>);
    });

    it('button with aria-label should be accessible', async () => {
      await testA11y(
        <button type="button" aria-label="Close dialog">
          <span aria-hidden="true">×</span>
        </button>
      );
    });

    it('link with text should be accessible', async () => {
      await testA11y(<a href="/page">Go to page</a>);
    });

    it('image with alt text should be accessible', async () => {
      await testA11y(<img src="/image.jpg" alt="Description of image" />);
    });

    it('decorative image with empty alt should be accessible', async () => {
      await testA11y(<img src="/decorative.jpg" alt="" />);
    });
  });

  describe('Form Elements', () => {
    it('input with label should be accessible', async () => {
      await testA11y(
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" />
        </div>
      );
    });

    it('input with aria-label should be accessible', async () => {
      await testA11y(
        <input type="search" aria-label="Search products" />
      );
    });

    it('select with label should be accessible', async () => {
      await testA11y(
        <div>
          <label htmlFor="country">Country</label>
          <select id="country" name="country">
            <option value="us">United States</option>
            <option value="ca">Canada</option>
          </select>
        </div>
      );
    });

    it('checkbox with label should be accessible', async () => {
      await testA11y(
        <div>
          <input type="checkbox" id="terms" name="terms" />
          <label htmlFor="terms">I agree to the terms</label>
        </div>
      );
    });

    it('fieldset with legend should be accessible', async () => {
      await testA11y(
        <fieldset>
          <legend>Personal Information</legend>
          <label htmlFor="fname">First Name</label>
          <input type="text" id="fname" name="fname" />
        </fieldset>
      );
    });

    it('form with error message should be accessible', async () => {
      await testA11y(
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            aria-invalid="true"
            aria-describedby="password-error"
          />
          <span id="password-error" role="alert">
            Password must be at least 8 characters
          </span>
        </div>
      );
    });
  });

  describe('Interactive Components', () => {
    it('dialog with proper ARIA should be accessible', async () => {
      await testA11y(
        <div
          role="dialog"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-desc"
          aria-modal="true"
        >
          <h2 id="dialog-title">Confirm Action</h2>
          <p id="dialog-desc">Are you sure you want to proceed?</p>
          <button type="button">Cancel</button>
          <button type="button">Confirm</button>
        </div>
      );
    });

    it('tab list should be accessible', async () => {
      await testA11y(
        <div>
          <div role="tablist" aria-label="Content sections">
            <button
              role="tab"
              id="tab-1"
              aria-controls="panel-1"
              aria-selected="true"
            >
              Tab 1
            </button>
            <button
              role="tab"
              id="tab-2"
              aria-controls="panel-2"
              aria-selected="false"
            >
              Tab 2
            </button>
          </div>
          <div
            role="tabpanel"
            id="panel-1"
            aria-labelledby="tab-1"
          >
            Content for tab 1
          </div>
        </div>
      );
    });

    it('accordion should be accessible', async () => {
      await testA11y(
        <div>
          <h3>
            <button
              type="button"
              aria-expanded="true"
              aria-controls="accordion-content"
            >
              Section Title
            </button>
          </h3>
          <div id="accordion-content">
            Accordion content here
          </div>
        </div>
      );
    });

    it('tooltip trigger should be accessible', async () => {
      await testA11y(
        <button
          type="button"
          aria-describedby="tooltip-1"
        >
          Hover for info
          <span id="tooltip-1" role="tooltip">
            Additional information
          </span>
        </button>
      );
    });

    it('menu button should be accessible', async () => {
      await testA11y(
        <div>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded="false"
            id="menu-button"
          >
            Options
          </button>
          <ul role="menu" aria-labelledby="menu-button" hidden>
            <li role="menuitem">
              <button type="button">Edit</button>
            </li>
            <li role="menuitem">
              <button type="button">Delete</button>
            </li>
          </ul>
        </div>
      );
    });
  });

  describe('Semantic Structure', () => {
    it('heading hierarchy should be accessible', async () => {
      await testA11y(
        <article>
          <h1>Main Title</h1>
          <section>
            <h2>Section Title</h2>
            <p>Content here</p>
            <h3>Subsection</h3>
            <p>More content</p>
          </section>
        </article>
      );
    });

    it('list should be accessible', async () => {
      await testA11y(
        <ul aria-label="Features">
          <li>Feature one</li>
          <li>Feature two</li>
          <li>Feature three</li>
        </ul>
      );
    });

    it('navigation should be accessible', async () => {
      await testA11y(
        <nav aria-label="Main navigation">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </nav>
      );
    });

    it('table should be accessible', async () => {
      await testA11y(
        <table>
          <caption>Product Comparison</caption>
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Price</th>
              <th scope="col">Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Product A</th>
              <td>$29.99</td>
              <td>4.5</td>
            </tr>
          </tbody>
        </table>
      );
    });
  });

  describe('Live Regions', () => {
    it('status message should be accessible', async () => {
      await testA11y(
        <div role="status" aria-live="polite">
          3 results found
        </div>
      );
    });

    it('alert should be accessible', async () => {
      await testA11y(
        <div role="alert" aria-live="assertive">
          Error: Please fill in all required fields
        </div>
      );
    });

    it('loading indicator should be accessible', async () => {
      await testA11y(
        <div
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="sr-only">Loading...</span>
        </div>
      );
    });
  });
});
