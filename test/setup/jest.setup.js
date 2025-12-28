/**
 * Jest Setup File
 *
 * This file runs before each test suite and sets up the testing environment
 */

// Import testing library extensions
import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia (only in browser environments)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock scrollTo
  window.scrollTo = jest.fn();
}

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb) => {
  return setTimeout(cb, 0);
};

global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};

// Suppress console errors in tests (optional)
// You can comment this out if you want to see all console output
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    // Suppress specific React warnings
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Warning: useLayoutEffect') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Set default test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});
