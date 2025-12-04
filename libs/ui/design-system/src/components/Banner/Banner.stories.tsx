import type { Meta, StoryObj } from '@storybook/react';
import { Banner } from './Banner';

/**
 * Banner component for prominent messages and announcements.
 * Supports multiple variants, positions, and dismissal.
 */
const meta: Meta<typeof Banner> = {
  title: 'Components/Banner',
  component: Banner,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
      description: 'Visual variant',
      table: {
        defaultValue: { summary: 'info' },
      },
    },
    position: {
      control: 'select',
      options: ['inline', 'top', 'bottom'],
      description: 'Position of the banner',
      table: {
        defaultValue: { summary: 'inline' },
      },
    },
    showIcon: {
      control: 'boolean',
      description: 'Show variant icon',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Banner>;

/**
 * Default info banner
 */
export const Default: Story = {
  args: {
    children: 'This is an informational banner with important information.',
  },
};

/**
 * Info variant
 */
export const InfoVariant: Story = {
  args: {
    variant: 'info',
    children: 'New features are now available! Check out our latest updates.',
  },
};

/**
 * Success variant
 */
export const SuccessVariant: Story = {
  args: {
    variant: 'success',
    children: 'Your changes have been saved successfully.',
  },
};

/**
 * Warning variant
 */
export const WarningVariant: Story = {
  args: {
    variant: 'warning',
    children: 'Your session will expire in 5 minutes. Please save your work.',
  },
};

/**
 * Error variant
 */
export const ErrorVariant: Story = {
  args: {
    variant: 'error',
    children: 'System maintenance scheduled for tonight at 10 PM EST.',
  },
};

/**
 * Dismissible banner
 */
export const Dismissible: Story = {
  args: {
    variant: 'info',
    children: 'This banner can be dismissed by clicking the X button.',
    onDismiss: () => alert('Banner dismissed!'),
  },
};

/**
 * Banner with action button
 */
export const WithAction: Story = {
  args: {
    variant: 'warning',
    children: 'A new version is available. Update now to get the latest features.',
    action: (
      <button className="px-3 py-1 bg-warning-600 text-white rounded hover:bg-warning-700 text-sm font-medium">
        Update Now
      </button>
    ),
  },
};

/**
 * Banner with action and dismiss
 */
export const WithActionAndDismiss: Story = {
  args: {
    variant: 'info',
    children: 'We use cookies to improve your experience.',
    action: (
      <button className="px-3 py-1 bg-info-600 text-white rounded hover:bg-info-700 text-sm font-medium">
        Learn More
      </button>
    ),
    onDismiss: () => alert('Banner dismissed!'),
  },
};

/**
 * Without icon
 */
export const WithoutIcon: Story = {
  args: {
    showIcon: false,
    variant: 'info',
    children: 'This banner has no icon.',
  },
};

/**
 * Inline position (default)
 */
export const InlinePosition: Story = {
  args: {
    position: 'inline',
    variant: 'info',
    children: 'This banner is inline with the content.',
  },
  decorators: [
    (Story) => (
      <div className="p-8">
        <div className="mb-4 text-neutral-700">Content above banner</div>
        <Story />
        <div className="mt-4 text-neutral-700">Content below banner</div>
      </div>
    ),
  ],
};

/**
 * Top fixed position
 */
export const TopPosition: Story = {
  args: {
    position: 'top',
    variant: 'warning',
    children: 'This banner is fixed at the top of the page.',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '400px', position: 'relative' }}>
        <Story />
        <div className="p-8 pt-24">
          <h2 className="text-xl font-semibold mb-4">Page Content</h2>
          <p className="text-neutral-700">
            The banner is fixed at the top and stays visible when scrolling.
          </p>
        </div>
      </div>
    ),
  ],
};

/**
 * Bottom fixed position
 */
export const BottomPosition: Story = {
  args: {
    position: 'bottom',
    variant: 'info',
    children: 'This banner is fixed at the bottom of the page.',
    action: (
      <button className="px-3 py-1 bg-info-600 text-white rounded hover:bg-info-700 text-sm font-medium">
        Accept
      </button>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ height: '400px', position: 'relative' }}>
        <div className="p-8">
          <h2 className="text-xl font-semibold mb-4">Page Content</h2>
          <p className="text-neutral-700">
            The banner is fixed at the bottom and stays visible when scrolling.
          </p>
        </div>
        <Story />
      </div>
    ),
  ],
};

/**
 * Cookie consent banner
 */
export const CookieConsent: Story = {
  args: {
    position: 'bottom',
    variant: 'info',
    children: 'We use cookies to enhance your browsing experience and analyze our traffic.',
    action: (
      <button className="px-4 py-2 bg-info-600 text-white rounded hover:bg-info-700 text-sm font-medium">
        Accept All
      </button>
    ),
    onDismiss: () => alert('Dismissed'),
  },
  decorators: [
    (Story) => (
      <div style={{ height: '400px', position: 'relative' }}>
        <div className="p-8">
          <h2 className="text-xl font-semibold mb-4">Website Content</h2>
          <p className="text-neutral-700">
            This is a typical cookie consent banner implementation.
          </p>
        </div>
        <Story />
      </div>
    ),
  ],
};

/**
 * Announcement banner
 */
export const Announcement: Story = {
  args: {
    position: 'top',
    variant: 'success',
    children: '🎉 Limited time offer: Get 50% off all premium plans!',
    action: (
      <button className="px-4 py-2 bg-success-600 text-white rounded hover:bg-success-700 text-sm font-medium">
        Claim Offer
      </button>
    ),
    onDismiss: () => alert('Dismissed'),
  },
  decorators: [
    (Story) => (
      <div style={{ height: '400px', position: 'relative' }}>
        <Story />
        <div className="p-8 pt-24">
          <h2 className="text-xl font-semibold mb-4">Store</h2>
          <p className="text-neutral-700">
            Browse our products while the announcement stays visible.
          </p>
        </div>
      </div>
    ),
  ],
};

/**
 * Maintenance warning
 */
export const MaintenanceWarning: Story = {
  args: {
    variant: 'warning',
    children: 'Scheduled maintenance: The site will be unavailable from 2-4 AM EST.',
    showIcon: true,
  },
};

/**
 * Error notification
 */
export const ErrorNotification: Story = {
  args: {
    variant: 'error',
    children: 'Unable to connect to the server. Please check your internet connection.',
    action: (
      <button className="px-3 py-1 bg-error-600 text-white rounded hover:bg-error-700 text-sm font-medium">
        Retry
      </button>
    ),
  },
};
