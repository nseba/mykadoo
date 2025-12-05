import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Tabs, TabItem } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Navigation/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Tabs organize content into separate views where only one view can be visible at a time. Perfect for grouping related information without overwhelming users.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      description: 'Array of tab items with value, label, content, and optional disabled state',
      control: { type: 'object' },
    },
    defaultValue: {
      description: 'Default active tab value (uncontrolled)',
      control: { type: 'text' },
    },
    value: {
      description: 'Controlled active tab value',
      control: { type: 'text' },
    },
    onValueChange: {
      description: 'Callback when tab changes',
      action: 'changed',
    },
    variant: {
      description: 'Visual style variant',
      control: { type: 'select' },
      options: ['line', 'enclosed', 'soft'],
    },
    size: {
      description: 'Size variant',
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    orientation: {
      description: 'Tab orientation',
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
    },
    fullWidth: {
      description: 'Make tabs span full width',
      control: { type: 'boolean' },
    },
    className: {
      description: 'Additional CSS classes',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const basicItems: TabItem[] = [
  {
    value: 'account',
    label: 'Account',
    content: (
      <div className="text-neutral-700">
        <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
        <p>Manage your account preferences and security settings.</p>
      </div>
    ),
  },
  {
    value: 'notifications',
    label: 'Notifications',
    content: (
      <div className="text-neutral-700">
        <h3 className="text-lg font-semibold mb-2">Notification Preferences</h3>
        <p>Control how you receive updates and alerts.</p>
      </div>
    ),
  },
  {
    value: 'privacy',
    label: 'Privacy',
    content: (
      <div className="text-neutral-700">
        <h3 className="text-lg font-semibold mb-2">Privacy Settings</h3>
        <p>Manage your privacy and data sharing preferences.</p>
      </div>
    ),
  },
];

export const Default: Story = {
  args: {
    items: basicItems,
    variant: 'line',
    size: 'md',
  },
};

export const LineVariant: Story = {
  args: {
    items: basicItems,
    variant: 'line',
  },
  parameters: {
    docs: {
      description: {
        story: 'Line variant with bottom border indicator (default style).',
      },
    },
  },
};

export const EnclosedVariant: Story = {
  args: {
    items: basicItems,
    variant: 'enclosed',
  },
  parameters: {
    docs: {
      description: {
        story: 'Enclosed variant with background container and active tab highlighted with white background.',
      },
    },
  },
};

export const SoftVariant: Story = {
  args: {
    items: basicItems,
    variant: 'soft',
  },
  parameters: {
    docs: {
      description: {
        story: 'Soft variant with subtle background colors for active state.',
      },
    },
  },
};

export const SmallSize: Story = {
  args: {
    items: basicItems,
    size: 'sm',
  },
  parameters: {
    docs: {
      description: {
        story: 'Small size variant with compact padding.',
      },
    },
  },
};

export const LargeSize: Story = {
  args: {
    items: basicItems,
    size: 'lg',
  },
  parameters: {
    docs: {
      description: {
        story: 'Large size variant with generous padding.',
      },
    },
  },
};

export const VerticalOrientation: Story = {
  args: {
    items: basicItems,
    orientation: 'vertical',
    variant: 'line',
  },
  parameters: {
    docs: {
      description: {
        story: 'Vertical orientation with tabs stacked on the left side.',
      },
    },
  },
};

export const FullWidth: Story = {
  args: {
    items: basicItems,
    fullWidth: true,
    variant: 'line',
  },
  parameters: {
    docs: {
      description: {
        story: 'Full width tabs that expand to fill available space.',
      },
    },
  },
};

export const WithDisabledTabs: Story = {
  args: {
    items: [
      {
        value: 'overview',
        label: 'Overview',
        content: <div className="text-neutral-700">Overview content is accessible.</div>,
      },
      {
        value: 'analytics',
        label: 'Analytics',
        content: <div className="text-neutral-700">Analytics content.</div>,
        disabled: true,
      },
      {
        value: 'reports',
        label: 'Reports',
        content: <div className="text-neutral-700">Reports content.</div>,
        disabled: true,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Some tabs can be disabled to prevent interaction.',
      },
    },
  },
};

export const ControlledMode: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('tab1');

    const items: TabItem[] = [
      {
        value: 'tab1',
        label: 'Tab 1',
        content: (
          <div className="text-neutral-700">
            <p>Content for Tab 1</p>
            <p className="mt-2 text-sm text-neutral-500">Current tab: {activeTab}</p>
          </div>
        ),
      },
      {
        value: 'tab2',
        label: 'Tab 2',
        content: (
          <div className="text-neutral-700">
            <p>Content for Tab 2</p>
            <p className="mt-2 text-sm text-neutral-500">Current tab: {activeTab}</p>
          </div>
        ),
      },
      {
        value: 'tab3',
        label: 'Tab 3',
        content: (
          <div className="text-neutral-700">
            <p>Content for Tab 3</p>
            <p className="mt-2 text-sm text-neutral-500">Current tab: {activeTab}</p>
          </div>
        ),
      },
    ];

    return (
      <div>
        <Tabs items={items} value={activeTab} onValueChange={setActiveTab} />
        <div className="mt-4 p-4 bg-neutral-50 rounded">
          <p className="text-sm text-neutral-600">
            Active tab is controlled externally: <strong>{activeTab}</strong>
          </p>
          <div className="mt-2 space-x-2">
            <button
              onClick={() => setActiveTab('tab1')}
              className="px-3 py-1 text-sm bg-white border border-neutral-300 rounded hover:bg-neutral-50"
            >
              Set Tab 1
            </button>
            <button
              onClick={() => setActiveTab('tab2')}
              className="px-3 py-1 text-sm bg-white border border-neutral-300 rounded hover:bg-neutral-50"
            >
              Set Tab 2
            </button>
            <button
              onClick={() => setActiveTab('tab3')}
              className="px-3 py-1 text-sm bg-white border border-neutral-300 rounded hover:bg-neutral-50"
            >
              Set Tab 3
            </button>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Controlled mode allows external state management of the active tab.',
      },
    },
  },
};

export const RealWorldProductDetails: Story = {
  args: {
    items: [
      {
        value: 'description',
        label: 'Description',
        content: (
          <div className="prose text-neutral-700">
            <p>
              This premium wireless headphone features advanced noise cancellation technology,
              delivering crystal-clear audio in any environment.
            </p>
            <ul className="mt-4">
              <li>40mm dynamic drivers</li>
              <li>Active noise cancellation</li>
              <li>30-hour battery life</li>
              <li>Bluetooth 5.0 connectivity</li>
            </ul>
          </div>
        ),
      },
      {
        value: 'specifications',
        label: 'Specifications',
        content: (
          <div className="text-neutral-700">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-medium">Weight</td>
                  <td className="py-2">250g</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Battery</td>
                  <td className="py-2">30 hours</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Connectivity</td>
                  <td className="py-2">Bluetooth 5.0, 3.5mm jack</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Colors</td>
                  <td className="py-2">Black, Silver, Rose Gold</td>
                </tr>
              </tbody>
            </table>
          </div>
        ),
      },
      {
        value: 'reviews',
        label: 'Reviews (24)',
        content: (
          <div className="text-neutral-700">
            <div className="flex items-center mb-4">
              <span className="text-3xl font-bold">4.5</span>
              <span className="ml-2 text-neutral-500">out of 5</span>
            </div>
            <p className="text-sm text-neutral-600">Based on 24 customer reviews</p>
          </div>
        ),
      },
    ],
    variant: 'line',
  },
  parameters: {
    docs: {
      description: {
        story: 'Product details page with description, specifications, and reviews.',
      },
    },
  },
};

export const RealWorldDashboard: Story = {
  args: {
    items: [
      {
        value: 'overview',
        label: 'Overview',
        content: (
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="text-sm text-neutral-600">Total Sales</div>
              <div className="text-2xl font-bold mt-1">$45,231</div>
            </div>
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="text-sm text-neutral-600">Orders</div>
              <div className="text-2xl font-bold mt-1">1,245</div>
            </div>
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="text-sm text-neutral-600">Customers</div>
              <div className="text-2xl font-bold mt-1">892</div>
            </div>
          </div>
        ),
      },
      {
        value: 'analytics',
        label: 'Analytics',
        content: (
          <div className="text-neutral-700">
            <p className="text-sm text-neutral-600">Analytics charts and graphs would appear here.</p>
          </div>
        ),
      },
      {
        value: 'reports',
        label: 'Reports',
        content: (
          <div className="text-neutral-700">
            <p className="text-sm text-neutral-600">Generated reports and exports.</p>
          </div>
        ),
      },
      {
        value: 'settings',
        label: 'Settings',
        content: (
          <div className="text-neutral-700">
            <p className="text-sm text-neutral-600">Dashboard configuration and preferences.</p>
          </div>
        ),
      },
    ],
    variant: 'enclosed',
    fullWidth: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Dashboard with multiple data views organized in tabs.',
      },
    },
  },
};
