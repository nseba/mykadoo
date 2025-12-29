/* eslint-disable */
export default {
  displayName: 'web',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', tsx: true },
          transform: { react: { runtime: 'automatic' } },
        },
        // Ignore .swcrc to avoid conflicts with test file exclusions
        swcrc: false,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/web',
  setupFilesAfterEnv: ['<rootDir>/../../test/setup/jest.setup.js'],
  moduleNameMapper: {
    '^@mykadoo/design-system$': '<rootDir>/../../libs/ui/design-system/src/index.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^next/image$': '<rootDir>/../../test/mocks/next-image.js',
    '^next/link$': '<rootDir>/../../test/mocks/next-link.js',
    '^next/navigation$': '<rootDir>/../../test/mocks/next-navigation.js',
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/e2e/'],
};
