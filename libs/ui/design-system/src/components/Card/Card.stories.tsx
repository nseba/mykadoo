import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardContent, CardFooter } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Content/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Cards are flexible containers for grouping related information and actions. They support multiple variants, custom headers and footers, and can be made interactive with hover effects.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description: 'Card visual style variant',
      control: { type: 'select' },
      options: ['default', 'outlined', 'elevated', 'filled'],
    },
    padding: {
      description: 'Internal padding size',
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg'],
    },
    hoverable: {
      description: 'Enable hover effects for clickable cards',
      control: { type: 'boolean' },
    },
    header: {
      description: 'Card header content',
      control: { type: 'text' },
    },
    footer: {
      description: 'Card footer content',
      control: { type: 'text' },
    },
    className: {
      description: 'Additional CSS classes',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Card Title</h3>
        <p className="text-neutral-600">
          This is a default card with standard styling. Cards are versatile containers for
          grouping related information.
        </p>
      </div>
    ),
  },
};

export const DefaultVariant: Story = {
  args: {
    variant: 'default',
    children: (
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Default Card</h3>
        <p className="text-neutral-600">White background with subtle border.</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Default variant with white background and neutral border.',
      },
    },
  },
};

export const OutlinedVariant: Story = {
  args: {
    variant: 'outlined',
    children: (
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Outlined Card</h3>
        <p className="text-neutral-600">Transparent background with prominent border.</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Outlined variant with transparent background and bold border.',
      },
    },
  },
};

export const ElevatedVariant: Story = {
  args: {
    variant: 'elevated',
    children: (
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Elevated Card</h3>
        <p className="text-neutral-600">White background with shadow for depth.</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Elevated variant with drop shadow for visual hierarchy.',
      },
    },
  },
};

export const FilledVariant: Story = {
  args: {
    variant: 'filled',
    children: (
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Filled Card</h3>
        <p className="text-neutral-600">Subtle neutral background with border.</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Filled variant with neutral background color.',
      },
    },
  },
};

export const SmallPadding: Story = {
  args: {
    padding: 'sm',
    children: (
      <div>
        <h3 className="text-base font-semibold text-neutral-900 mb-1">Compact Card</h3>
        <p className="text-sm text-neutral-600">Small padding for tight spaces.</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with small padding for compact layouts.',
      },
    },
  },
};

export const LargePadding: Story = {
  args: {
    padding: 'lg',
    children: (
      <div>
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">Spacious Card</h3>
        <p className="text-neutral-600">Large padding for generous spacing and emphasis.</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with large padding for spacious layouts.',
      },
    },
  },
};

export const NoPadding: Story = {
  args: {
    padding: 'none',
    children: (
      <img
        src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop"
        alt="Placeholder"
        className="w-full h-48 object-cover"
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with no padding, useful for full-bleed images or custom layouts.',
      },
    },
  },
};

export const Hoverable: Story = {
  args: {
    hoverable: true,
    variant: 'elevated',
    children: (
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Clickable Card</h3>
        <p className="text-neutral-600">
          Hover over this card to see the interactive effect with scale and shadow.
        </p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive card with hover effects, ideal for clickable content.',
      },
    },
  },
};

export const WithHeader: Story = {
  args: {
    header: <CardHeader title="Card with Header" subtitle="This is a subtitle" />,
    children: (
      <CardContent>
        <p>
          This card demonstrates the use of a structured header with title and subtitle. The
          header is separated by a border.
        </p>
      </CardContent>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with structured header component.',
      },
    },
  },
};

export const WithFooter: Story = {
  args: {
    children: (
      <CardContent>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Card with Footer</h3>
        <p>This card includes a footer section with action buttons.</p>
      </CardContent>
    ),
    footer: (
      <CardFooter>
        <button className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700">
          Primary Action
        </button>
        <button className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded">
          Cancel
        </button>
      </CardFooter>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with footer section for actions or additional information.',
      },
    },
  },
};

export const WithHeaderAndFooter: Story = {
  args: {
    variant: 'elevated',
    header: (
      <CardHeader
        title="Complete Card"
        subtitle="With header and footer"
        action={
          <button className="text-sm text-primary-600 hover:text-primary-700">Edit</button>
        }
      />
    ),
    children: (
      <CardContent>
        <p>
          This card showcases the full structure with header, content, and footer sections. All
          sections are properly separated with borders.
        </p>
      </CardContent>
    ),
    footer: (
      <CardFooter>
        <button className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700">
          Save Changes
        </button>
        <button className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded">
          Cancel
        </button>
      </CardFooter>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete card with header (including action), content, and footer.',
      },
    },
  },
};

export const RealWorldProductCard: Story = {
  render: () => (
    <Card variant="elevated" hoverable padding="none" className="max-w-sm">
      <img
        src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"
        alt="Product"
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-neutral-900">Wireless Headphones</h3>
          <span className="px-2 py-1 text-xs font-medium bg-success-100 text-success-800 rounded-full">
            New
          </span>
        </div>
        <p className="text-sm text-neutral-600 mb-3">
          Premium noise-cancelling headphones with 30-hour battery life.
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-neutral-900">$299</span>
          <button className="px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700">
            Add to Cart
          </button>
        </div>
      </div>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'E-commerce product card with image, details, and call-to-action.',
      },
    },
  },
};

export const RealWorldBlogPostCard: Story = {
  render: () => (
    <Card variant="elevated" hoverable padding="none" className="max-w-md">
      <img
        src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=300&fit=crop"
        alt="Blog post"
        className="w-full h-48 object-cover"
      />
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
            Design
          </span>
          <span className="text-xs text-neutral-500">5 min read</span>
        </div>
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
          10 Design Principles for Better UX
        </h3>
        <p className="text-sm text-neutral-600 mb-4">
          Learn the fundamental principles that will help you create more intuitive and
          user-friendly interfaces.
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-neutral-200" />
            <div>
              <p className="text-sm font-medium text-neutral-900">Sarah Johnson</p>
              <p className="text-xs text-neutral-500">Mar 15, 2024</p>
            </div>
          </div>
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Read More →
          </button>
        </div>
      </div>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Blog post card with featured image, metadata, and author information.',
      },
    },
  },
};

export const RealWorldStatCard: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <Card variant="filled" padding="lg">
        <div className="text-center">
          <p className="text-sm text-neutral-600 mb-1">Total Sales</p>
          <p className="text-3xl font-bold text-neutral-900">$45,231</p>
          <p className="text-xs text-success-600 mt-1">+12.5% from last month</p>
        </div>
      </Card>
      <Card variant="filled" padding="lg">
        <div className="text-center">
          <p className="text-sm text-neutral-600 mb-1">New Customers</p>
          <p className="text-3xl font-bold text-neutral-900">1,245</p>
          <p className="text-xs text-success-600 mt-1">+8.2% from last month</p>
        </div>
      </Card>
      <Card variant="filled" padding="lg">
        <div className="text-center">
          <p className="text-sm text-neutral-600 mb-1">Conversion Rate</p>
          <p className="text-3xl font-bold text-neutral-900">3.24%</p>
          <p className="text-xs text-error-600 mt-1">-2.1% from last month</p>
        </div>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dashboard statistics cards displaying key metrics.',
      },
    },
  },
};

export const RealWorldUserProfileCard: Story = {
  render: () => (
    <Card variant="elevated" padding="lg" className="max-w-sm">
      <div className="text-center">
        <div className="h-20 w-20 rounded-full bg-neutral-200 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-neutral-900 mb-1">Alexandra Smith</h3>
        <p className="text-sm text-neutral-600 mb-4">Product Designer</p>
        <p className="text-sm text-neutral-700 mb-6">
          Creating delightful user experiences with a focus on accessibility and inclusivity.
        </p>
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-center">
            <p className="text-xl font-bold text-neutral-900">245</p>
            <p className="text-xs text-neutral-600">Projects</p>
          </div>
          <div className="h-8 w-px bg-neutral-200" />
          <div className="text-center">
            <p className="text-xl font-bold text-neutral-900">1.2k</p>
            <p className="text-xs text-neutral-600">Followers</p>
          </div>
          <div className="h-8 w-px bg-neutral-200" />
          <div className="text-center">
            <p className="text-xl font-bold text-neutral-900">892</p>
            <p className="text-xs text-neutral-600">Following</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700">
            Follow
          </button>
          <button className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 text-sm rounded-md hover:bg-neutral-50">
            Message
          </button>
        </div>
      </div>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'User profile card with stats and action buttons.',
      },
    },
  },
};
