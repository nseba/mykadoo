import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BottomNav, BottomNavItem } from './BottomNav';

const meta: Meta<typeof BottomNav> = {
  title: 'Components/Navigation/BottomNav',
  component: BottomNav,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Bottom navigation bar for mobile apps. Provides quick access to top-level destinations. Fixed at bottom of screen and visible only on mobile devices.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      description: 'Navigation items (max 5 recommended for mobile)',
      control: { type: 'object' },
    },
    showLabels: {
      description: 'Show text labels below icons',
      control: { type: 'boolean' },
    },
    variant: {
      description: 'Background variant',
      control: { type: 'select' },
      options: ['light', 'dark'],
    },
    bordered: {
      description: 'Show top border',
      control: { type: 'boolean' },
    },
    className: {
      description: 'Additional CSS classes',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BottomNav>;

const HomeIcon = (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const SearchIcon = (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const HeartIcon = (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

const UserIcon = (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const BellIcon = (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const basicItems: BottomNavItem[] = [
  { label: 'Home', href: '/', icon: HomeIcon, active: true },
  { label: 'Search', href: '/search', icon: SearchIcon },
  { label: 'Favorites', href: '/favorites', icon: HeartIcon },
  { label: 'Profile', href: '/profile', icon: UserIcon },
];

export const Default: Story = {
  args: {
    items: basicItems,
    showLabels: true,
    variant: 'light',
    bordered: true,
  },
  decorators: [
    (Story) => (
      <div className="relative h-[600px] bg-neutral-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Mobile App View</h2>
          <p className="text-neutral-600">Content area of your mobile app goes here.</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const LightVariant: Story = {
  args: {
    items: basicItems,
    showLabels: true,
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
  decorators: [
    (Story) => (
      <div className="relative h-[500px] bg-neutral-50">
        <Story />
      </div>
    ),
  ],
};

export const DarkVariant: Story = {
  args: {
    items: basicItems,
    showLabels: true,
    variant: 'dark',
    bordered: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Dark background variant with dark background and light text.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="relative h-[500px] bg-neutral-900">
        <Story />
      </div>
    ),
  ],
};

export const WithoutLabels: Story = {
  args: {
    items: basicItems,
    showLabels: false,
    variant: 'light',
    bordered: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Icon-only navigation without text labels for a more compact look.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="relative h-[500px] bg-neutral-50">
        <Story />
      </div>
    ),
  ],
};

export const WithoutBorder: Story = {
  args: {
    items: basicItems,
    showLabels: true,
    variant: 'light',
    bordered: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Navigation without top border for a cleaner look.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="relative h-[500px] bg-white">
        <Story />
      </div>
    ),
  ],
};

export const WithBadges: Story = {
  args: {
    items: [
      { label: 'Home', href: '/', icon: HomeIcon, active: true },
      { label: 'Search', href: '/search', icon: SearchIcon },
      { label: 'Favorites', href: '/favorites', icon: HeartIcon, badge: 5 },
      { label: 'Notifications', href: '/notifications', icon: BellIcon, badge: 12 },
      { label: 'Profile', href: '/profile', icon: UserIcon },
    ],
    showLabels: true,
    variant: 'light',
    bordered: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Navigation items can display badge counts for notifications or updates.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="relative h-[500px] bg-neutral-50">
        <Story />
      </div>
    ),
  ],
};

export const FiveItems: Story = {
  args: {
    items: [
      { label: 'Home', href: '/', icon: HomeIcon, active: true },
      { label: 'Search', href: '/search', icon: SearchIcon },
      { label: 'Favorites', href: '/favorites', icon: HeartIcon },
      { label: 'Alerts', href: '/alerts', icon: BellIcon },
      { label: 'Profile', href: '/profile', icon: UserIcon },
    ],
    showLabels: true,
    variant: 'light',
    bordered: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Maximum recommended items (5) for optimal mobile experience.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="relative h-[500px] bg-neutral-50">
        <Story />
      </div>
    ),
  ],
};

export const ThreeItems: Story = {
  args: {
    items: [
      { label: 'Home', href: '/', icon: HomeIcon, active: true },
      { label: 'Search', href: '/search', icon: SearchIcon },
      { label: 'Profile', href: '/profile', icon: UserIcon },
    ],
    showLabels: true,
    variant: 'light',
    bordered: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal navigation with only 3 items.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="relative h-[500px] bg-neutral-50">
        <Story />
      </div>
    ),
  ],
};

export const Interactive: Story = {
  render: () => {
    const [activeItem, setActiveItem] = useState('home');

    const items: BottomNavItem[] = [
      {
        label: 'Home',
        icon: HomeIcon,
        active: activeItem === 'home',
        onClick: () => setActiveItem('home'),
      },
      {
        label: 'Search',
        icon: SearchIcon,
        active: activeItem === 'search',
        onClick: () => setActiveItem('search'),
      },
      {
        label: 'Favorites',
        icon: HeartIcon,
        active: activeItem === 'favorites',
        onClick: () => setActiveItem('favorites'),
        badge: 3,
      },
      {
        label: 'Profile',
        icon: UserIcon,
        active: activeItem === 'profile',
        onClick: () => setActiveItem('profile'),
      },
    ];

    return (
      <div className="relative h-[600px] bg-neutral-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            {activeItem.charAt(0).toUpperCase() + activeItem.slice(1)}
          </h2>
          <p className="text-neutral-600">
            This is the {activeItem} view. Click navigation items to switch views.
          </p>
        </div>
        <BottomNav items={items} showLabels={true} variant="light" bordered={true} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive navigation with state management to switch between views.',
      },
    },
  },
};

export const RealWorldEcommerce: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('home');

    const ShopIcon = (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    );

    const items: BottomNavItem[] = [
      {
        label: 'Home',
        icon: HomeIcon,
        active: activeTab === 'home',
        onClick: () => setActiveTab('home'),
      },
      {
        label: 'Shop',
        icon: ShopIcon,
        active: activeTab === 'shop',
        onClick: () => setActiveTab('shop'),
      },
      {
        label: 'Search',
        icon: SearchIcon,
        active: activeTab === 'search',
        onClick: () => setActiveTab('search'),
      },
      {
        label: 'Wishlist',
        icon: HeartIcon,
        active: activeTab === 'wishlist',
        onClick: () => setActiveTab('wishlist'),
        badge: 8,
      },
      {
        label: 'Account',
        icon: UserIcon,
        active: activeTab === 'account',
        onClick: () => setActiveTab('account'),
      },
    ];

    return (
      <div className="relative h-[700px] bg-white">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200">
          <h1 className="text-xl font-bold">Mykadoo</h1>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === 'home' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Featured Products</h2>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-neutral-100 rounded-lg"></div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'shop' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Shop by Category</h2>
              <div className="space-y-2">
                <div className="p-4 bg-neutral-50 rounded-lg">Electronics</div>
                <div className="p-4 bg-neutral-50 rounded-lg">Fashion</div>
                <div className="p-4 bg-neutral-50 rounded-lg">Home & Garden</div>
              </div>
            </div>
          )}
          {activeTab === 'search' && (
            <div>
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
              />
            </div>
          )}
          {activeTab === 'wishlist' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">My Wishlist (8 items)</h2>
              <p className="text-neutral-600">Your saved items appear here</p>
            </div>
          )}
          {activeTab === 'account' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">My Account</h2>
              <div className="space-y-2">
                <div className="p-4 bg-neutral-50 rounded-lg">Orders</div>
                <div className="p-4 bg-neutral-50 rounded-lg">Settings</div>
                <div className="p-4 bg-neutral-50 rounded-lg">Help</div>
              </div>
            </div>
          )}
        </div>

        <BottomNav items={items} showLabels={true} variant="light" bordered={true} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'E-commerce mobile app with bottom navigation for main sections.',
      },
    },
  },
};

export const RealWorldSocialMedia: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('feed');

    const FeedIcon = (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    );

    const ExploreIcon = (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );

    const AddIcon = (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
    );

    const items: BottomNavItem[] = [
      {
        label: 'Feed',
        icon: FeedIcon,
        active: activeTab === 'feed',
        onClick: () => setActiveTab('feed'),
      },
      {
        label: 'Explore',
        icon: ExploreIcon,
        active: activeTab === 'explore',
        onClick: () => setActiveTab('explore'),
      },
      {
        label: 'Create',
        icon: AddIcon,
        active: activeTab === 'create',
        onClick: () => setActiveTab('create'),
      },
      {
        label: 'Activity',
        icon: BellIcon,
        active: activeTab === 'activity',
        onClick: () => setActiveTab('activity'),
        badge: 5,
      },
      {
        label: 'Profile',
        icon: UserIcon,
        active: activeTab === 'profile',
        onClick: () => setActiveTab('profile'),
      },
    ];

    return (
      <div className="relative h-[700px] bg-neutral-50">
        <div className="p-4 bg-white border-b border-neutral-200">
          <h1 className="text-xl font-bold">SocialApp</h1>
        </div>

        <div className="p-4">
          {activeTab === 'feed' && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg border border-neutral-200">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 bg-neutral-200 rounded-full"></div>
                    <div className="ml-3">
                      <div className="font-medium">User {i + 1}</div>
                      <div className="text-xs text-neutral-500">2 hours ago</div>
                    </div>
                  </div>
                  <div className="aspect-square bg-neutral-100 rounded-lg mb-3"></div>
                  <p className="text-sm text-neutral-700">This is a post caption...</p>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'explore' && (
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="aspect-square bg-neutral-200 rounded"></div>
              ))}
            </div>
          )}
          {activeTab === 'create' && (
            <div className="flex items-center justify-center h-64 bg-white rounded-lg border-2 border-dashed border-neutral-300">
              <div className="text-center">
                <AddIcon />
                <p className="mt-2 text-neutral-600">Create new post</p>
              </div>
            </div>
          )}
          {activeTab === 'activity' && (
            <div className="bg-white rounded-lg border border-neutral-200 p-4">
              <h2 className="font-semibold mb-3">Recent Activity</h2>
              <p className="text-sm text-neutral-600">5 new notifications</p>
            </div>
          )}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg border border-neutral-200 p-4">
              <div className="text-center mb-4">
                <div className="h-20 w-20 bg-neutral-200 rounded-full mx-auto mb-2"></div>
                <h2 className="font-semibold">Your Name</h2>
                <p className="text-sm text-neutral-500">@username</p>
              </div>
            </div>
          )}
        </div>

        <BottomNav items={items} showLabels={true} variant="light" bordered={true} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Social media app with bottom navigation and notification badges.',
      },
    },
  },
};
