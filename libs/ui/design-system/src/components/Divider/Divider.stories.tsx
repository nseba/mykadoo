import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Layout/Divider',
  component: Divider,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Divider orientation',
    },
    label: {
      control: 'text',
      description: 'Optional label text',
    },
    labelPosition: {
      control: 'select',
      options: ['left', 'center', 'right'],
      description: 'Label position (only for horizontal)',
    },
    thickness: {
      control: 'select',
      options: ['thin', 'normal', 'thick'],
      description: 'Divider thickness',
    },
    variant: {
      control: 'select',
      options: ['solid', 'dashed', 'dotted'],
      description: 'Border style',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  args: {},
};

export const Thin: Story = {
  args: {
    thickness: 'thin',
  },
};

export const Thick: Story = {
  args: {
    thickness: 'thick',
  },
};

export const Dashed: Story = {
  args: {
    variant: 'dashed',
  },
};

export const Dotted: Story = {
  args: {
    variant: 'dotted',
  },
};

export const WithLabelCenter: Story = {
  args: {
    label: 'OR',
    labelPosition: 'center',
  },
};

export const WithLabelLeft: Story = {
  args: {
    label: 'Additional Information',
    labelPosition: 'left',
  },
};

export const WithLabelRight: Story = {
  args: {
    label: 'Continue Reading',
    labelPosition: 'right',
  },
};

export const ThickDashed: Story = {
  args: {
    thickness: 'thick',
    variant: 'dashed',
  },
};

export const ThickDottedWithLabel: Story = {
  args: {
    thickness: 'thick',
    variant: 'dotted',
    label: 'Section Break',
  },
};

export const Vertical: Story = {
  render: () => (
    <div className="flex items-stretch h-32 gap-4">
      <div className="flex-1 bg-coral-100 rounded-lg flex items-center justify-center">
        Left Content
      </div>
      <Divider orientation="vertical" />
      <div className="flex-1 bg-blue-100 rounded-lg flex items-center justify-center">
        Right Content
      </div>
    </div>
  ),
};

export const VerticalThick: Story = {
  render: () => (
    <div className="flex items-stretch h-32 gap-4">
      <div className="flex-1 bg-coral-100 rounded-lg flex items-center justify-center">
        Left Content
      </div>
      <Divider orientation="vertical" thickness="thick" />
      <div className="flex-1 bg-blue-100 rounded-lg flex items-center justify-center">
        Right Content
      </div>
    </div>
  ),
};

export const VerticalDashed: Story = {
  render: () => (
    <div className="flex items-stretch h-32 gap-4">
      <div className="flex-1 bg-coral-100 rounded-lg flex items-center justify-center">
        Left Content
      </div>
      <Divider orientation="vertical" variant="dashed" />
      <div className="flex-1 bg-blue-100 rounded-lg flex items-center justify-center">
        Right Content
      </div>
    </div>
  ),
};

export const SectionSeparator: Story = {
  render: () => (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-3">Welcome to Mykadoo</h2>
        <p className="text-neutral-600">
          Discover the perfect gifts for your loved ones with our AI-powered recommendations.
          Our platform makes gift-giving effortless and enjoyable.
        </p>
      </div>

      <Divider />

      <div>
        <h2 className="text-2xl font-bold mb-3">How It Works</h2>
        <p className="text-neutral-600">
          Simply tell us about the person you're shopping for, and our AI agents will suggest
          personalized gift ideas based on their interests and preferences.
        </p>
      </div>

      <Divider variant="dashed" />

      <div>
        <h2 className="text-2xl font-bold mb-3">Get Started</h2>
        <p className="text-neutral-600">
          Create your free account today and start finding amazing gifts in minutes.
        </p>
      </div>
    </div>
  ),
};

export const FormSections: Story = {
  render: () => (
    <div className="max-w-md bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Account Settings</h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
            defaultValue="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
            defaultValue="john@example.com"
          />
        </div>
      </div>

      <Divider label="Security" labelPosition="left" />

      <div className="space-y-4 my-6">
        <div>
          <label className="block text-sm font-medium mb-1">Current Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
          />
        </div>
      </div>

      <Divider label="Preferences" labelPosition="left" />

      <div className="space-y-3 mt-6">
        <label className="flex items-center gap-2">
          <input type="checkbox" defaultChecked />
          <span className="text-sm">Email notifications</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" defaultChecked />
          <span className="text-sm">Marketing emails</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" />
          <span className="text-sm">SMS notifications</span>
        </label>
      </div>

      <Divider className="my-6" />

      <button className="w-full bg-coral-500 text-white py-2 rounded-lg hover:bg-coral-600">
        Save Changes
      </button>
    </div>
  ),
};

export const MenuDividers: Story = {
  render: () => (
    <div className="max-w-xs bg-white rounded-lg shadow-lg p-2">
      <button className="w-full text-left px-4 py-2 hover:bg-neutral-100 rounded">
        Profile
      </button>
      <button className="w-full text-left px-4 py-2 hover:bg-neutral-100 rounded">
        Settings
      </button>
      <button className="w-full text-left px-4 py-2 hover:bg-neutral-100 rounded">
        Billing
      </button>

      <Divider className="my-2" thickness="thin" />

      <button className="w-full text-left px-4 py-2 hover:bg-neutral-100 rounded">
        Help Center
      </button>
      <button className="w-full text-left px-4 py-2 hover:bg-neutral-100 rounded">
        Documentation
      </button>

      <Divider className="my-2" thickness="thin" />

      <button className="w-full text-left px-4 py-2 hover:bg-neutral-100 rounded text-red-600">
        Sign Out
      </button>
    </div>
  ),
};

export const ContentBreak: Story = {
  render: () => (
    <div className="max-w-2xl">
      <article className="prose max-w-none">
        <h1 className="text-3xl font-bold mb-4">The Ultimate Gift Guide</h1>

        <p className="text-neutral-700 mb-4">
          Finding the perfect gift doesn't have to be stressful. With our comprehensive guide,
          you'll discover amazing ideas for every occasion and every person on your list.
        </p>

        <p className="text-neutral-700 mb-6">
          Whether you're shopping for birthdays, holidays, or just because, we've got you covered
          with thoughtful suggestions that show you care.
        </p>

        <Divider label="Chapter 1: Understanding Your Recipient" className="my-8" />

        <p className="text-neutral-700 mb-4">
          The first step to finding a great gift is understanding the person you're shopping for.
          Consider their hobbies, interests, and lifestyle when making your selection.
        </p>

        <Divider label="Chapter 2: Budget-Friendly Options" className="my-8" variant="dashed" />

        <p className="text-neutral-700 mb-4">
          You don't need to spend a fortune to give a meaningful gift. We've curated a selection
          of thoughtful presents that won't break the bank.
        </p>

        <Divider label="Chapter 3: Luxury Gifts" className="my-8" variant="dotted" />

        <p className="text-neutral-700">
          For those special occasions when you want to splurge, explore our collection of
          premium gift ideas that are sure to impress.
        </p>
      </article>
    </div>
  ),
};

export const DashboardSections: Story = {
  render: () => (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-neutral-600">Metric {i}</p>
              <p className="text-2xl font-bold">$1,234</p>
            </div>
          ))}
        </div>
      </div>

      <Divider label="Recent Activity" labelPosition="left" thickness="thick" />

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <span>Activity {i}</span>
              <span className="text-sm text-neutral-500">2 hours ago</span>
            </div>
          ))}
        </div>
      </div>

      <Divider label="Analytics" labelPosition="left" thickness="thick" />

      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-48 bg-neutral-100 rounded flex items-center justify-center">
          Chart Placeholder
        </div>
      </div>
    </div>
  ),
};

export const ToolbarDividers: Story = {
  render: () => (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center gap-2">
        <button className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded">
          Bold
        </button>
        <button className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded">
          Italic
        </button>
        <button className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded">
          Underline
        </button>

        <Divider orientation="vertical" thickness="thin" className="h-8 mx-2" />

        <button className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded">
          Left
        </button>
        <button className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded">
          Center
        </button>
        <button className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded">
          Right
        </button>

        <Divider orientation="vertical" thickness="thin" className="h-8 mx-2" />

        <button className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded">
          Link
        </button>
        <button className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded">
          Image
        </button>
      </div>
    </div>
  ),
};
