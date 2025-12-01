/* eslint-disable */
export default {
  displayName: 'design-system',
  preset: '../../../jest.preset.js',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', tsx: true },
          transform: { react: { runtime: 'automatic' } },
        },
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/ui/design-system',
  setupFilesAfterEnv: ['<rootDir>/../../../test/setup/jest.setup.js'],
  moduleNameMapper: {
    '^@mykadoo/design-system$': '<rootDir>/src/index.ts',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};
