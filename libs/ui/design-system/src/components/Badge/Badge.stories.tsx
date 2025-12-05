import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Content/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Badges are small, versatile components used to display status, counts, labels, or categories. They can include indicators, be removable, and come in multiple variants and sizes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description: 'Badge color variant',
      control: { type: 'select' },
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info'],
    },
    size: {
      description: 'Badge size',
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    dot: {
      description: 'Show dot indicator',
      control: { type: 'boolean' },
    },
    onRemove: {
      description: 'Callback for removable badge',
      action: 'removed',
    },
    children: {
      description: 'Badge content',
      control: { type: 'text' },
    },
    className: {
      description: 'Additional CSS classes',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
    size: 'md',
  },
};

export const Primary: Story = {
  args: {
    children: 'Primary',
    variant: 'primary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Primary variant using the brand coral color.',
      },
    },
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Secondary variant using the trustworthy blue color.',
      },
    },
  },
};

export const Success: Story = {
  args: {
    children: 'Success',
    variant: 'success',
  },
  parameters: {
    docs: {
      description: {
        story: 'Success variant for positive status indicators.',
      },
    },
  },
};

export const Warning: Story = {
  args: {
    children: 'Warning',
    variant: 'warning',
  },
  parameters: {
    docs: {
      description: {
        story: 'Warning variant for cautionary status indicators.',
      },
    },
  },
};

export const Error: Story = {
  args: {
    children: 'Error',
    variant: 'error',
  },
  parameters: {
    docs: {
      description: {
        story: 'Error variant for error states and critical alerts.',
      },
    },
  },
};

export const Info: Story = {
  args: {
    children: 'Info',
    variant: 'info',
  },
  parameters: {
    docs: {
      description: {
        story: 'Info variant for informational messages.',
      },
    },
  },
};

export const SmallSize: Story = {
  args: {
    children: 'Small',
    size: 'sm',
    variant: 'primary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact badge for tight spaces.',
      },
    },
  },
};

export const LargeSize: Story = {
  args: {
    children: 'Large',
    size: 'lg',
    variant: 'primary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Larger badge for emphasis.',
      },
    },
  },
};

export const WithDot: Story = {
  args: {
    children: 'Active',
    dot: true,
    variant: 'success',
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge with a status indicator dot.',
      },
    },
  },
};

export const Removable: Story = {
  args: {
    children: 'Removable',
    onRemove: () => console.log('Badge removed'),
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge with a close button for dismissal or removal.',
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available badge variants displayed together.',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge size="sm" variant="primary">
        Small
      </Badge>
      <Badge size="md" variant="primary">
        Medium
      </Badge>
      <Badge size="lg" variant="primary">
        Large
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available badge sizes from small to large.',
      },
    },
  },
};

export const RealWorldStatusBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="success" dot>
          Online
        </Badge>
        <Badge variant="error" dot>
          Offline
        </Badge>
        <Badge variant="warning" dot>
          Away
        </Badge>
        <Badge variant="info" dot>
          In Meeting
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="success">Active</Badge>
        <Badge variant="warning">Pending</Badge>
        <Badge variant="error">Suspended</Badge>
        <Badge variant="default">Inactive</Badge>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Status badges showing user presence and account states.',
      },
    },
  },
};

export const RealWorldEcommerce: Story = {
  render: () => (
    <div className="max-w-md space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Product Information</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">In Stock</Badge>
          <Badge variant="primary">New Arrival</Badge>
          <Badge variant="warning">Limited Edition</Badge>
          <Badge variant="error" size="sm">
            20% OFF
          </Badge>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Order Status</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="warning" dot>
            Processing
          </Badge>
          <Badge variant="info" dot>
            Shipped
          </Badge>
          <Badge variant="success" dot>
            Delivered
          </Badge>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'E-commerce product and order status badges.',
      },
    },
  },
};

export const RealWorldTagFilters: Story = {
  render: () => {
    const tags = ['React', 'TypeScript', 'Tailwind CSS', 'Storybook', 'Design System'];

    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-neutral-700">Active Filters</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="primary"
              size="sm"
              onRemove={() => console.log(`Remove ${tag}`)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Removable tag badges for filter chips or category selection.',
      },
    },
  },
};

export const RealWorldNotificationCount: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button className="relative px-4 py-2 bg-neutral-100 rounded-lg hover:bg-neutral-200">
          Messages
          <Badge
            variant="error"
            size="sm"
            className="absolute -top-1 -right-1 min-w-[1.25rem] justify-center"
          >
            12
          </Badge>
        </button>
        <button className="relative px-4 py-2 bg-neutral-100 rounded-lg hover:bg-neutral-200">
          Notifications
          <Badge
            variant="primary"
            size="sm"
            className="absolute -top-1 -right-1 min-w-[1.25rem] justify-center"
          >
            3
          </Badge>
        </button>
        <button className="relative px-4 py-2 bg-neutral-100 rounded-lg hover:bg-neutral-200">
          Updates
        </button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Notification count badges on buttons or menu items.',
      },
    },
  },
};
