/**
 * Test Utilities
 *
 * Reusable test helpers and utilities for component testing
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Custom render function that wraps components with providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add any custom options here (e.g., initial route, theme, etc.)
  route?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
  const { route = '/', ...renderOptions } = options || {};

  // Set up user event
  const user = userEvent.setup();

  // Create wrapper component with providers
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <>{children}</>;
  };

  // Render component
  const renderResult = render(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });

  return {
    ...renderResult,
    user,
  };
}

/**
 * Wait for a condition to be true
 */
export async function waitFor<T>(
  callback: () => T | Promise<T>,
  options?: {
    timeout?: number;
    interval?: number;
  }
): Promise<T> {
  const { timeout = 5000, interval = 50 } = options || {};
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const result = await callback();
      if (result) {
        return result;
      }
    } catch (error) {
      // Continue waiting
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}

/**
 * Create mock function with TypeScript support
 */
export function createMockFn<T extends (...args: any[]) => any>(): jest.MockedFunction<T> {
  return jest.fn() as jest.MockedFunction<T>;
}

/**
 * Mock Next.js router
 */
export function mockRouter(props: Partial<any> = {}) {
  return {
    basePath: '',
    pathname: '/',
    route: '/',
    asPath: '/',
    query: {},
    push: jest.fn(() => Promise.resolve(true)),
    replace: jest.fn(() => Promise.resolve(true)),
    reload: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(() => Promise.resolve()),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
    isLocaleDomain: false,
    isReady: true,
    isPreview: false,
    ...props,
  };
}

/**
 * Create mock file for file input testing
 */
export function createMockFile(
  name: string,
  size: number,
  type: string
): File {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

/**
 * Suppress console warnings/errors for specific tests
 */
export function suppressConsole(methods: ('log' | 'warn' | 'error')[] = ['error', 'warn']) {
  const originalMethods: Record<string, any> = {};

  beforeEach(() => {
    methods.forEach((method) => {
      originalMethods[method] = console[method];
      console[method] = jest.fn();
    });
  });

  afterEach(() => {
    methods.forEach((method) => {
      console[method] = originalMethods[method];
    });
  });
}

/**
 * Test accessibility with jest-axe
 */
export async function testA11y(container: HTMLElement) {
  const { axe } = await import('jest-axe');
  const results = await axe(container);
  expect(results).toHaveNoViolations();
}

// Re-export testing library utilities
export * from '@testing-library/react';
export { userEvent };
