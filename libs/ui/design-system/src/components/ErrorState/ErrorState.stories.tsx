import type { Meta, StoryObj } from '@storybook/react';
import { ErrorState } from './ErrorState';

/**
 * ErrorState component for displaying error messages with retry functionality.
 * Supports error, warning, and info variants.
 */
const meta: Meta<typeof ErrorState> = {
  title: 'Components/ErrorState',
  component: ErrorState,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Error title',
    },
    message: {
      control: 'text',
      description: 'Error message/description',
    },
    variant: {
      control: 'select',
      options: ['error', 'warning', 'info'],
      description: 'Error severity level',
      table: {
        defaultValue: { summary: 'error' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    showIcon: {
      control: 'boolean',
      description: 'Show error icon',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ErrorState>;

/**
 * Default error state
 */
export const Default: Story = {
  args: {
    title: 'Something went wrong',
    message: 'An error occurred. Please try again.',
  },
};

/**
 * Error with retry button
 */
export const WithRetry: Story = {
  args: {
    title: 'Failed to load data',
    message: 'We couldn\'t load your data. Please try again.',
    onRetry: () => alert('Retrying...'),
  },
};

/**
 * Error variant (default)
 */
export const ErrorVariant: Story = {
  args: {
    variant: 'error',
    title: 'Error loading page',
    message: 'The page could not be loaded. Please refresh and try again.',
    onRetry: () => alert('Retrying...'),
  },
};

/**
 * Warning variant
 */
export const WarningVariant: Story = {
  args: {
    variant: 'warning',
    title: 'Partial failure',
    message: 'Some items couldn\'t be loaded, but the rest are available.',
    onRetry: () => alert('Retrying failed items...'),
  },
};

/**
 * Info variant
 */
export const InfoVariant: Story = {
  args: {
    variant: 'info',
    title: 'No connection',
    message: 'You appear to be offline. Some features may be unavailable.',
  },
};

/**
 * Small size
 */
export const SmallSize: Story = {
  args: {
    size: 'sm',
    title: 'Error',
    message: 'Something went wrong',
    onRetry: () => alert('Retrying...'),
  },
};

/**
 * Medium size (default)
 */
export const MediumSize: Story = {
  args: {
    size: 'md',
    title: 'Unable to save',
    message: 'Your changes could not be saved. Please try again.',
    onRetry: () => alert('Retrying...'),
  },
};

/**
 * Large size
 */
export const LargeSize: Story = {
  args: {
    size: 'lg',
    title: 'Connection lost',
    message: 'We lost connection to the server. Your work has been saved locally.',
    onRetry: () => alert('Reconnecting...'),
  },
};

/**
 * Without icon
 */
export const WithoutIcon: Story = {
  args: {
    showIcon: false,
    title: 'Permission denied',
    message: 'You don\'t have permission to access this resource.',
  },
};

/**
 * With custom action button
 */
export const WithCustomAction: Story = {
  args: {
    title: 'Access denied',
    message: 'You don\'t have permission to view this content.',
    action: (
      <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
        Go Back
      </button>
    ),
  },
};

/**
 * Network error
 */
export const NetworkError: Story = {
  args: {
    variant: 'error',
    title: 'Network error',
    message: 'Unable to connect to the server. Please check your internet connection.',
    onRetry: () => alert('Checking connection...'),
  },
};

/**
 * 404 Not Found
 */
export const NotFound: Story = {
  args: {
    variant: 'info',
    title: '404 - Page not found',
    message: 'The page you\'re looking for doesn\'t exist or has been moved.',
    action: (
      <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
        Go Home
      </button>
    ),
  },
};

/**
 * Server error
 */
export const ServerError: Story = {
  args: {
    variant: 'error',
    title: '500 - Server error',
    message: 'Our servers are experiencing issues. Please try again later.',
    onRetry: () => alert('Retrying...'),
  },
};

/**
 * Validation error
 */
export const ValidationError: Story = {
  args: {
    variant: 'warning',
    title: 'Validation failed',
    message: 'Please check your input and try again.',
    action: (
      <button className="px-4 py-2 bg-warning-500 text-white rounded-lg hover:bg-warning-600">
        Review Form
      </button>
    ),
  },
};
