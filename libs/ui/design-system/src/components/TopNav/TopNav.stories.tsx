import type { Meta, StoryObj } from '@storybook/react';
import { TopNav, TopNavLink } from './TopNav';

const meta: Meta<typeof TopNav> = {
  title: 'Components/Navigation/TopNav',
  component: TopNav,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Top navigation bar for primary site navigation. Includes logo, navigation links, and action items. Responsive with mobile menu support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    logo: {
      description: 'Logo or brand element',
      control: { type: 'text' },
    },
    links: {
      description: 'Navigation links array',
      control: { type: 'object' },
    },
    actions: {
      description: 'Action items (search, user menu, etc.)',
      control: { type: 'text' },
    },
    fixed: {
      description: 'Fixed to top of viewport (sticky)',
      control: { type: 'boolean' },
    },
    variant: {
      description: 'Background variant',
      control: { type: 'select' },
      options: ['light', 'dark', 'transparent'],
    },
    bordered: {
      description: 'Show bottom border',
      control: { type: 'boolean' },
    },
    className: {
      description: 'Additional CSS classes',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TopNav>;

const logo = (
  <div className="flex items-center">
    <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
      M
    </div>
    <span className="ml-2 text-xl font-bold">Mykadoo</span>
  </div>
);

const basicLinks: TopNavLink[] = [
  { label: 'Home', href: '/', active: true },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const actions = (
  <div className="flex items-center space-x-4">
    <button className="p-2 hover:bg-neutral-100 rounded-full">
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </button>
    <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
      Sign In
    </button>
  </div>
);

export const Default: Story = {
  args: {
    logo,
    links: basicLinks,
    actions,
    variant: 'light',
    bordered: true,
  },
};

export const LightVariant: Story = {
  args: {
    logo,
    links: basicLinks,
    actions,
    variant: 'light',
    bordered: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Light background variant (default) with white background.',
      },
    },
  },
};

export const DarkVariant: Story = {
  args: {
    logo: (
      <div className="flex items-center">
        <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-neutral-900 font-bold">
          M
        </div>
        <span className="ml-2 text-xl font-bold text-white">Mykadoo</span>
      </div>
    ),
    links: basicLinks,
    actions: (
      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-neutral-800 rounded-full text-white">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
        <button className="px-4 py-2 bg-white text-neutral-900 rounded-md hover:bg-neutral-100">
          Sign In
        </button>
      </div>
    ),
    variant: 'dark',
    bordered: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Dark background variant with white text.',
      },
    },
  },
};

export const TransparentVariant: Story = {
  args: {
    logo,
    links: basicLinks,
    actions,
    variant: 'transparent',
    bordered: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Transparent background, often used over hero images.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        className="bg-gradient-to-r from-primary-500 to-primary-700 min-h-[400px]"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1557683316-973673baf926)' }}
      >
        <Story />
      </div>
    ),
  ],
};

export const Fixed: Story = {
  args: {
    logo,
    links: basicLinks,
    actions,
    fixed: true,
    bordered: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Fixed (sticky) navigation that stays at the top when scrolling.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div>
        <Story />
        <div className="p-8 space-y-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <p key={i} className="text-neutral-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scroll down to see the sticky
              navigation in action.
            </p>
          ))}
        </div>
      </div>
    ),
  ],
};

export const WithoutBorder: Story = {
  args: {
    logo,
    links: basicLinks,
    actions,
    bordered: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Navigation without bottom border for a cleaner look.',
      },
    },
  },
};

export const LogoOnly: Story = {
  args: {
    logo,
    variant: 'light',
    bordered: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Simple navigation with only logo, no links or actions.',
      },
    },
  },
};

export const WithDisabledLinks: Story = {
  args: {
    logo,
    links: [
      { label: 'Home', href: '/', active: true },
      { label: 'Products', href: '/products' },
      { label: 'Features', href: '/features', disabled: true },
      { label: 'Pricing', href: '/pricing', disabled: true },
      { label: 'Contact', href: '/contact' },
    ],
    actions,
  },
  parameters: {
    docs: {
      description: {
        story: 'Some navigation links can be disabled.',
      },
    },
  },
};

export const ManyLinks: Story = {
  args: {
    logo,
    links: [
      { label: 'Home', href: '/', active: true },
      { label: 'Products', href: '/products' },
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Resources', href: '/resources' },
      { label: 'Blog', href: '/blog' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    actions,
  },
  parameters: {
    docs: {
      description: {
        story: 'Navigation with many links.',
      },
    },
  },
};

export const RealWorldEcommerce: Story = {
  args: {
    logo: (
      <div className="flex items-center">
        <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
          M
        </div>
        <span className="ml-2 text-xl font-bold">Mykadoo</span>
      </div>
    ),
    links: [
      { label: 'New Arrivals', href: '/new', active: false },
      { label: 'Men', href: '/men' },
      { label: 'Women', href: '/women' },
      { label: 'Kids', href: '/kids' },
      { label: 'Sale', href: '/sale' },
    ],
    actions: (
      <div className="flex items-center space-x-2">
        <button className="p-2 hover:bg-neutral-100 rounded-full" aria-label="Search">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
        <button className="p-2 hover:bg-neutral-100 rounded-full" aria-label="Favorites">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
        <button className="p-2 hover:bg-neutral-100 rounded-full relative" aria-label="Cart">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-error-600 text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </button>
        <button className="p-2 hover:bg-neutral-100 rounded-full" aria-label="Account">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>
      </div>
    ),
    fixed: true,
    bordered: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'E-commerce navigation with category links and shopping features.',
      },
    },
  },
};

export const RealWorldSaaS: Story = {
  args: {
    logo: (
      <div className="flex items-center">
        <div className="h-8 w-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded flex items-center justify-center text-white font-bold text-sm">
          AI
        </div>
        <span className="ml-2 text-xl font-bold">GiftFinder</span>
      </div>
    ),
    links: [
      { label: 'Dashboard', href: '/dashboard', active: true },
      { label: 'Search', href: '/search' },
      { label: 'Wishlists', href: '/wishlists' },
      { label: 'History', href: '/history' },
    ],
    actions: (
      <div className="flex items-center space-x-3">
        <button className="p-2 hover:bg-neutral-100 rounded-full relative" aria-label="Notifications">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute top-1 right-1 h-2 w-2 bg-error-600 rounded-full"></span>
        </button>
        <div className="flex items-center space-x-2 pl-3 border-l border-neutral-200">
          <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-700">JD</span>
          </div>
          <span className="text-sm font-medium">John Doe</span>
        </div>
      </div>
    ),
    fixed: true,
    bordered: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'SaaS application navigation with user profile and notifications.',
      },
    },
  },
};

export const RealWorldMarketing: Story = {
  args: {
    logo: (
      <div className="flex items-center">
        <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
          Mykadoo
        </span>
      </div>
    ),
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Resources', href: '/resources' },
      { label: 'About', href: '/about' },
    ],
    actions: (
      <div className="flex items-center space-x-3">
        <button className="text-sm font-medium text-neutral-700 hover:text-neutral-900">
          Sign In
        </button>
        <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700">
          Get Started
        </button>
      </div>
    ),
    fixed: true,
    bordered: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Marketing website navigation with call-to-action buttons.',
      },
    },
  },
};
