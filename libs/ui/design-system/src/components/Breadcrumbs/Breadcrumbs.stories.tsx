import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Components/Navigation/Breadcrumbs',
  component: Breadcrumbs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Breadcrumbs show the current page location within a navigational hierarchy. Helps users understand where they are and navigate back through the hierarchy.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      description: 'Array of breadcrumb items',
      control: { type: 'object' },
    },
    separator: {
      description: 'Custom separator element',
      control: { type: 'text' },
    },
    maxItems: {
      description: 'Maximum items to display before collapsing',
      control: { type: 'number' },
    },
    className: {
      description: 'Additional CSS classes',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

const basicItems: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Electronics', href: '/products/electronics' },
  { label: 'Laptops' },
];

const longItems: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Electronics', href: '/shop/electronics' },
  { label: 'Computers', href: '/shop/electronics/computers' },
  { label: 'Laptops', href: '/shop/electronics/computers/laptops' },
  { label: 'Gaming Laptops', href: '/shop/electronics/computers/laptops/gaming' },
  { label: 'ASUS ROG' },
];

export const Default: Story = {
  args: {
    items: basicItems,
  },
};

export const TwoLevels: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Current Page' },
    ],
  },
};

export const ThreeLevels: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Category', href: '/category' },
      { label: 'Product' },
    ],
  },
};

export const WithMaxItems: Story = {
  args: {
    items: longItems,
    maxItems: 4,
  },
  parameters: {
    docs: {
      description: {
        story: 'When there are too many items, middle items collapse into an ellipsis.',
      },
    },
  },
};

export const CustomSeparator: Story = {
  args: {
    items: basicItems,
    separator: '→',
  },
  parameters: {
    docs: {
      description: {
        story: 'Use a custom separator instead of the default "/".',
      },
    },
  },
};

export const WithIcons: Story = {
  args: {
    items: [
      {
        label: 'Home',
        href: '/',
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        ),
      },
      { label: 'Products', href: '/products' },
      { label: 'Details' },
    ],
  },
};

export const RealWorldEcommerce: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Men', href: '/men' },
      { label: 'Clothing', href: '/men/clothing' },
      { label: 'Shirts', href: '/men/clothing/shirts' },
      { label: 'Casual Shirts' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'E-commerce product category navigation.',
      },
    },
  },
};

export const RealWorldDocs: Story = {
  args: {
    items: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Components', href: '/docs/components' },
      { label: 'Navigation', href: '/docs/components/navigation' },
      { label: 'Breadcrumbs' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Documentation site navigation path.',
      },
    },
  },
};

export const SingleItem: Story = {
  args: {
    items: [{ label: 'Home' }],
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge case: only one item (current page).',
      },
    },
  },
};

export const LongLabels: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      {
        label: 'Very Long Category Name That Might Wrap',
        href: '/category',
      },
      { label: 'Another Extremely Long Subcategory Label' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Handle long labels gracefully.',
      },
    },
  },
};
