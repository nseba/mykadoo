import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Accordion, AccordionItem } from './Accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Content/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Accordions display collapsible content panels for presenting information in a limited space. Users can expand and collapse items to reveal or hide content. Built with Radix UI for accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      description: 'Array of accordion items with value, title, and content',
      control: { type: 'object' },
    },
    type: {
      description: 'Single or multiple items can be open at once',
      control: { type: 'select' },
      options: ['single', 'multiple'],
    },
    collapsible: {
      description: 'Allow closing all items (single type only)',
      control: { type: 'boolean' },
    },
    variant: {
      description: 'Visual style variant',
      control: { type: 'select' },
      options: ['default', 'bordered', 'separated'],
    },
    defaultValue: {
      description: 'Default open item(s)',
      control: { type: 'text' },
    },
    value: {
      description: 'Controlled open item(s)',
      control: { type: 'text' },
    },
    onValueChange: {
      description: 'Callback when value changes',
      action: 'value changed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

const basicItems: AccordionItem[] = [
  {
    value: 'item-1',
    title: 'What is your return policy?',
    content:
      'We offer a 30-day return policy on all items. Products must be unused and in their original packaging. Shipping costs are non-refundable.',
  },
  {
    value: 'item-2',
    title: 'How long does shipping take?',
    content:
      'Standard shipping takes 5-7 business days. Express shipping (2-3 days) and overnight shipping are also available at checkout.',
  },
  {
    value: 'item-3',
    title: 'Do you ship internationally?',
    content:
      'Yes, we ship to over 100 countries worldwide. International shipping times vary by destination and typically take 10-21 business days.',
  },
];

export const Default: Story = {
  args: {
    items: basicItems,
    type: 'single',
    variant: 'default',
  },
};

export const DefaultVariant: Story = {
  args: {
    items: basicItems,
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default variant with individual borders for each item.',
      },
    },
  },
};

export const BorderedVariant: Story = {
  args: {
    items: basicItems,
    variant: 'bordered',
  },
  parameters: {
    docs: {
      description: {
        story: 'Bordered variant with all items contained in a single border.',
      },
    },
  },
};

export const SeparatedVariant: Story = {
  args: {
    items: basicItems,
    variant: 'separated',
  },
  parameters: {
    docs: {
      description: {
        story: 'Separated variant with spacing and shadows between items.',
      },
    },
  },
};

export const SingleType: Story = {
  args: {
    items: basicItems,
    type: 'single',
  },
  parameters: {
    docs: {
      description: {
        story: 'Single type allows only one item to be open at a time.',
      },
    },
  },
};

export const MultipleType: Story = {
  args: {
    items: basicItems,
    type: 'multiple',
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple type allows several items to be open simultaneously.',
      },
    },
  },
};

export const NotCollapsible: Story = {
  args: {
    items: basicItems,
    type: 'single',
    collapsible: false,
    defaultValue: 'item-1',
  },
  parameters: {
    docs: {
      description: {
        story: 'Non-collapsible mode ensures at least one item is always open.',
      },
    },
  },
};

export const WithDefaultOpen: Story = {
  args: {
    items: basicItems,
    type: 'single',
    defaultValue: 'item-2',
  },
  parameters: {
    docs: {
      description: {
        story: 'Accordion with a specific item open by default.',
      },
    },
  },
};

export const WithMultipleDefaultOpen: Story = {
  args: {
    items: basicItems,
    type: 'multiple',
    defaultValue: ['item-1', 'item-3'],
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple type with several items open by default.',
      },
    },
  },
};

export const WithDisabledItems: Story = {
  args: {
    items: [
      {
        value: 'item-1',
        title: 'Available Item',
        content: 'This item is available and can be expanded.',
      },
      {
        value: 'item-2',
        title: 'Disabled Item',
        content: 'This content is not accessible.',
        disabled: true,
      },
      {
        value: 'item-3',
        title: 'Another Available Item',
        content: 'This item can also be expanded.',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Accordion with some items disabled to prevent interaction.',
      },
    },
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('item-1');

    return (
      <div className="w-full max-w-2xl space-y-4">
        <Accordion
          items={basicItems}
          type="single"
          value={value}
          onValueChange={(v) => setValue(v as string)}
        />
        <div className="p-4 bg-neutral-50 rounded text-sm text-neutral-600">
          Currently open: <strong>{value || 'None'}</strong>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setValue('item-1')}
              className="px-3 py-1 bg-white border border-neutral-300 rounded hover:bg-neutral-50"
            >
              Open Item 1
            </button>
            <button
              onClick={() => setValue('item-2')}
              className="px-3 py-1 bg-white border border-neutral-300 rounded hover:bg-neutral-50"
            >
              Open Item 2
            </button>
            <button
              onClick={() => setValue('item-3')}
              className="px-3 py-1 bg-white border border-neutral-300 rounded hover:bg-neutral-50"
            >
              Open Item 3
            </button>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Controlled accordion with external state management.',
      },
    },
  },
};

export const WithRichContent: Story = {
  args: {
    items: [
      {
        value: 'features',
        title: 'Product Features',
        content: (
          <div className="space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li>Premium materials and construction</li>
              <li>Ergonomic design for comfort</li>
              <li>Multiple color options available</li>
              <li>One year warranty included</li>
            </ul>
          </div>
        ),
      },
      {
        value: 'specs',
        title: 'Technical Specifications',
        content: (
          <div className="space-y-2">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-medium">Dimensions</td>
                  <td className="py-2">15 x 10 x 3 inches</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Weight</td>
                  <td className="py-2">2.5 lbs</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Material</td>
                  <td className="py-2">Aluminum, Polycarbonate</td>
                </tr>
              </tbody>
            </table>
          </div>
        ),
      },
      {
        value: 'warranty',
        title: 'Warranty Information',
        content: (
          <div className="space-y-3">
            <p>
              All products come with a comprehensive one-year warranty covering manufacturing
              defects.
            </p>
            <div className="p-3 bg-info-50 border border-info-200 rounded">
              <p className="text-sm font-medium text-info-900">Extended Warranty Available</p>
              <p className="text-sm text-info-700 mt-1">
                Extend your coverage for an additional 2 years at checkout.
              </p>
            </div>
          </div>
        ),
      },
    ],
    variant: 'bordered',
  },
  parameters: {
    docs: {
      description: {
        story: 'Accordion with rich content including lists, tables, and styled alerts.',
      },
    },
  },
};

export const RealWorldFAQ: Story = {
  render: () => {
    const faqItems: AccordionItem[] = [
      {
        value: 'account',
        title: 'How do I create an account?',
        content:
          'Click the "Sign Up" button in the top right corner. Fill in your email, create a password, and verify your email address. You\'ll be ready to start shopping!',
      },
      {
        value: 'payment',
        title: 'What payment methods do you accept?',
        content:
          'We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, and Google Pay. All transactions are encrypted and secure.',
      },
      {
        value: 'shipping',
        title: 'How can I track my order?',
        content:
          'Once your order ships, you\'ll receive an email with a tracking number. You can also view your order status by logging into your account and visiting the "Orders" page.',
      },
      {
        value: 'returns',
        title: 'What is your return policy?',
        content:
          'We offer a 30-day return policy. Items must be unused, in original packaging, and with all tags attached. Return shipping is free for defective items, but customer-initiated returns may incur a restocking fee.',
      },
      {
        value: 'support',
        title: 'How do I contact customer support?',
        content:
          'You can reach our customer support team via email at support@example.com, through our live chat (available 9 AM - 6 PM EST), or by calling 1-800-EXAMPLE.',
      },
    ];

    return (
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Frequently Asked Questions</h2>
        <Accordion items={faqItems} type="single" variant="separated" />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'FAQ section with common customer questions and answers.',
      },
    },
  },
};

export const RealWorldProductDetails: Story = {
  render: () => {
    const productItems: AccordionItem[] = [
      {
        value: 'description',
        title: 'Product Description',
        content: (
          <div className="space-y-3">
            <p>
              Experience unparalleled comfort and style with our premium wireless headphones.
              Featuring advanced noise cancellation technology and immersive sound quality.
            </p>
            <p>
              Perfect for commuters, travelers, and audiophiles who demand the best in audio
              performance.
            </p>
          </div>
        ),
      },
      {
        value: 'features',
        title: 'Key Features',
        content: (
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-success-600 mt-0.5">✓</span>
              <span>Active Noise Cancellation - Block out ambient noise</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success-600 mt-0.5">✓</span>
              <span>30-Hour Battery Life - All-day listening without recharging</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success-600 mt-0.5">✓</span>
              <span>Premium Audio Drivers - Crystal clear highs and deep bass</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success-600 mt-0.5">✓</span>
              <span>Comfortable Design - Memory foam ear cushions</span>
            </li>
          </ul>
        ),
      },
      {
        value: 'compatibility',
        title: 'Compatibility',
        content: (
          <div className="space-y-2">
            <p className="font-medium">Works with:</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-neutral-100 text-sm rounded">iOS devices</span>
              <span className="px-3 py-1 bg-neutral-100 text-sm rounded">Android devices</span>
              <span className="px-3 py-1 bg-neutral-100 text-sm rounded">Windows PC</span>
              <span className="px-3 py-1 bg-neutral-100 text-sm rounded">Mac</span>
              <span className="px-3 py-1 bg-neutral-100 text-sm rounded">Gaming consoles</span>
            </div>
          </div>
        ),
      },
      {
        value: 'shipping',
        title: 'Shipping & Returns',
        content: (
          <div className="space-y-3">
            <div>
              <p className="font-medium mb-1">Shipping Options:</p>
              <ul className="text-sm space-y-1">
                <li>• Standard: 5-7 business days (Free)</li>
                <li>• Express: 2-3 business days ($9.99)</li>
                <li>• Overnight: Next business day ($19.99)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">Returns:</p>
              <p className="text-sm">
                30-day hassle-free returns. Full refund if not completely satisfied.
              </p>
            </div>
          </div>
        ),
      },
    ];

    return (
      <div className="w-full max-w-2xl">
        <Accordion items={productItems} type="multiple" variant="default" defaultValue={['description', 'features']} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Product detail page with expandable sections for different information types.',
      },
    },
  },
};

export const RealWorldSettings: Story = {
  render: () => {
    const settingsItems: AccordionItem[] = [
      {
        value: 'account',
        title: 'Account Settings',
        content: (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                defaultValue="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Username</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                defaultValue="johndoe"
              />
            </div>
            <button className="px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700">
              Save Changes
            </button>
          </div>
        ),
      },
      {
        value: 'notifications',
        title: 'Notification Preferences',
        content: (
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Email notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Push notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">SMS notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Newsletter subscription</span>
            </label>
          </div>
        ),
      },
      {
        value: 'privacy',
        title: 'Privacy & Security',
        content: (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-2">Two-Factor Authentication</p>
              <button className="px-4 py-2 bg-success-600 text-white text-sm rounded-md hover:bg-success-700">
                Enable 2FA
              </button>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-2">Change Password</p>
              <button className="px-4 py-2 bg-neutral-200 text-neutral-900 text-sm rounded-md hover:bg-neutral-300">
                Update Password
              </button>
            </div>
            <div className="pt-3 border-t">
              <button className="text-sm text-error-600 hover:text-error-700">
                Delete Account
              </button>
            </div>
          </div>
        ),
      },
    ];

    return (
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Settings</h2>
        <Accordion items={settingsItems} type="single" variant="bordered" />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Settings page organized with accordion sections for different configuration areas.',
      },
    },
  },
};
