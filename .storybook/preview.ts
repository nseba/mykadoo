import type { Preview } from '@storybook/react';
import '@mykadoo/design-system';
import '../libs/ui/design-system/src/styles/globals.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#FFFFFF',
        },
        {
          name: 'dark',
          value: '#212121',
        },
        {
          name: 'neutral',
          value: '#FAFAFA',
        },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: {
        order: [
          'Design System',
          ['Introduction', 'Colors', 'Typography', 'Spacing', 'Shadows'],
          'Components',
          ['Buttons', 'Forms', 'Feedback', 'Navigation', 'Content', 'Layout'],
        ],
      },
    },
  },
  tags: ['autodocs'],
};

export default preview;
