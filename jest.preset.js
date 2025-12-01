/**
 * Jest Preset
 *
 * Shared Jest configuration that can be extended by individual projects
 */

const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,

  // Coverage directory
  coverageDirectory: '../../coverage',

  // Coverage reporters
  coverageReporters: [
    'html',
    'text',
    'text-summary',
    'lcov',
    'json',
    'clover',
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@radix-ui|lucide-react))',
  ],

  // Globals
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      isolatedModules: true,
    },
  },

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Reset mocks between tests
  resetMocks: true,

  // Test timeout
  testTimeout: 10000,

  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};
