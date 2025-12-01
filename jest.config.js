/**
 * Root Jest Configuration
 *
 * This file provides the base configuration for all Jest tests across the monorepo.
 * Individual projects can extend this configuration with their own jest.config.js files.
 */

module.exports = {
  // Use the preset file for shared configuration
  preset: './jest.preset.js',

  // Collect coverage from all projects
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/.storybook/**',
    '!**/.next/**',
    '!**/storybook-static/**',
  ],

  // Coverage thresholds (global)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/dist/',
    '/coverage/',
    '/storybook-static/',
  ],

  // Module path aliases
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',

    // Handle CSS imports (without CSS modules)
    '^.+\\.(css|sass|scss)$': '<rootDir>/test/mocks/styleMock.js',

    // Handle image imports
    '^.+\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/test/mocks/fileMock.js',

    // Handle module aliases
    '^@mykadoo/(.*)$': '<rootDir>/libs/$1/src',
    '^@/(.*)$': '<rootDir>/apps/$1',
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test/setup/jest.setup.js'],

  // Test environment
  testEnvironment: 'jsdom',

  // Transform files
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.base.json',
      isolatedModules: true,
    }],
    '^.+\\.(js|jsx)$': ['babel-jest', {
      presets: ['@babel/preset-env', '@babel/preset-react'],
    }],
  },

  // Reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './coverage',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
  ],

  // Verbose output
  verbose: true,

  // Bail on first failure in CI
  bail: process.env.CI === 'true' ? 1 : 0,

  // Max workers
  maxWorkers: process.env.CI === 'true' ? 2 : '50%',
};
