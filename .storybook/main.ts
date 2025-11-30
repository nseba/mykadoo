import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../libs/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../apps/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {},
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};

export default config;
