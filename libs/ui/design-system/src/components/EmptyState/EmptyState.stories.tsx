import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';

/**
 * EmptyState component for displaying when no content is available.
 * Used for empty search results, empty lists, or initial states.
 */
const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Title text',
    },
    description: {
      control: 'text',
      description: 'Description text',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

/**
 * Basic empty state with title and description
 */
export const Default: Story = {
  args: {
    title: 'No results found',
    description: 'Try adjusting your search or filters to find what you\'re looking for',
  },
};

/**
 * Empty state with action button
 */
export const WithAction: Story = {
  args: {
    title: 'No items yet',
    description: 'Get started by adding your first item',
    action: (
      <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
        Add Item
      </button>
    ),
  },
};

/**
 * Empty state with custom icon
 */
export const WithCustomIcon: Story = {
  args: {
    title: 'Empty inbox',
    description: 'All caught up! No new messages',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="8" y="16" width="48" height="32" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M8 20l24 16 24-16" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    ),
  },
};

/**
 * Small size variant
 */
export const SmallSize: Story = {
  args: {
    title: 'No data',
    description: 'There is no data to display',
    size: 'sm',
  },
};

/**
 * Medium size variant (default)
 */
export const MediumSize: Story = {
  args: {
    title: 'No results',
    description: 'We couldn\'t find any matches for your search',
    size: 'md',
  },
};

/**
 * Large size variant
 */
export const LargeSize: Story = {
  args: {
    title: 'Welcome to your dashboard',
    description: 'Start by creating your first project to see it appear here',
    size: 'lg',
    action: (
      <button className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-lg">
        Create Project
      </button>
    ),
  },
};

/**
 * Title only without description
 */
export const TitleOnly: Story = {
  args: {
    title: 'No notifications',
  },
};

/**
 * Without icon
 */
export const WithoutIcon: Story = {
  args: {
    title: 'Coming soon',
    description: 'This feature will be available shortly',
    icon: null,
  },
};

/**
 * Empty search results
 */
export const EmptySearch: Story = {
  args: {
    title: 'No search results',
    description: 'We couldn\'t find any results for "chocolate gift basket"',
    action: (
      <button className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300">
        Clear Search
      </button>
    ),
  },
};

/**
 * Empty favorites list
 */
export const EmptyFavorites: Story = {
  args: {
    title: 'No favorites yet',
    description: 'Items you favorite will appear here',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path
          d="M32 12l8 16 18 2-13 12 3 18-16-9-16 9 3-18-13-12 18-2z"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
};

/**
 * Empty cart
 */
export const EmptyCart: Story = {
  args: {
    title: 'Your cart is empty',
    description: 'Add some items to get started',
    action: (
      <button className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
        Start Shopping
      </button>
    ),
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="24" cy="54" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="48" cy="54" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
        <path
          d="M8 8h8l8 32h28l6-24H18"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
};
