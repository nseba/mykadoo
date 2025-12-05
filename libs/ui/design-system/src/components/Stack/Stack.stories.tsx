import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from './Stack';

const meta: Meta<typeof Stack> = {
  title: 'Layout/Stack',
  component: Stack,
  tags: ['autodocs'],
  argTypes: {
    spacing: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Spacing between stack items',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
      description: 'Cross-axis alignment',
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around'],
      description: 'Main-axis justification',
    },
    direction: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      description: 'Stack direction',
    },
    wrap: {
      control: 'boolean',
      description: 'Allow items to wrap',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Stack>;

const StackItem = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-coral-100 px-6 py-4 rounded-lg">{children}</div>
);

export const Default: Story = {
  args: {
    children: (
      <>
        <StackItem>Item 1</StackItem>
        <StackItem>Item 2</StackItem>
        <StackItem>Item 3</StackItem>
      </>
    ),
  },
};

export const Horizontal: Story = {
  args: {
    direction: 'horizontal',
    children: (
      <>
        <StackItem>Item 1</StackItem>
        <StackItem>Item 2</StackItem>
        <StackItem>Item 3</StackItem>
      </>
    ),
  },
};

export const NoSpacing: Story = {
  args: {
    spacing: 'none',
    children: (
      <>
        <StackItem>Item 1</StackItem>
        <StackItem>Item 2</StackItem>
        <StackItem>Item 3</StackItem>
      </>
    ),
  },
};

export const ExtraSmallSpacing: Story = {
  args: {
    spacing: 'xs',
    children: (
      <>
        <StackItem>Item 1</StackItem>
        <StackItem>Item 2</StackItem>
        <StackItem>Item 3</StackItem>
      </>
    ),
  },
};

export const SmallSpacing: Story = {
  args: {
    spacing: 'sm',
    children: (
      <>
        <StackItem>Item 1</StackItem>
        <StackItem>Item 2</StackItem>
        <StackItem>Item 3</StackItem>
      </>
    ),
  },
};

export const LargeSpacing: Story = {
  args: {
    spacing: 'lg',
    children: (
      <>
        <StackItem>Item 1</StackItem>
        <StackItem>Item 2</StackItem>
        <StackItem>Item 3</StackItem>
      </>
    ),
  },
};

export const ExtraLargeSpacing: Story = {
  args: {
    spacing: 'xl',
    children: (
      <>
        <StackItem>Item 1</StackItem>
        <StackItem>Item 2</StackItem>
        <StackItem>Item 3</StackItem>
      </>
    ),
  },
};

export const ExtraExtraLargeSpacing: Story = {
  args: {
    spacing: '2xl',
    children: (
      <>
        <StackItem>Item 1</StackItem>
        <StackItem>Item 2</StackItem>
        <StackItem>Item 3</StackItem>
      </>
    ),
  },
};

export const AlignCenter: Story = {
  args: {
    align: 'center',
    children: (
      <>
        <div className="bg-coral-100 px-6 py-4 rounded-lg w-48">Short Item</div>
        <div className="bg-coral-100 px-6 py-4 rounded-lg w-96">Much Longer Item</div>
        <div className="bg-coral-100 px-6 py-4 rounded-lg w-32">Tiny</div>
      </>
    ),
  },
};

export const AlignEnd: Story = {
  args: {
    align: 'end',
    children: (
      <>
        <div className="bg-coral-100 px-6 py-4 rounded-lg w-48">Short Item</div>
        <div className="bg-coral-100 px-6 py-4 rounded-lg w-96">Much Longer Item</div>
        <div className="bg-coral-100 px-6 py-4 rounded-lg w-32">Tiny</div>
      </>
    ),
  },
};

export const JustifyCenter: Story = {
  args: {
    justify: 'center',
    className: 'h-64',
    children: (
      <>
        <StackItem>Item 1</StackItem>
        <StackItem>Item 2</StackItem>
        <StackItem>Item 3</StackItem>
      </>
    ),
  },
};

export const JustifyBetween: Story = {
  args: {
    justify: 'between',
    className: 'h-64',
    children: (
      <>
        <StackItem>Item 1</StackItem>
        <StackItem>Item 2</StackItem>
        <StackItem>Item 3</StackItem>
      </>
    ),
  },
};

export const JustifyAround: Story = {
  args: {
    justify: 'around',
    className: 'h-64',
    children: (
      <>
        <StackItem>Item 1</StackItem>
        <StackItem>Item 2</StackItem>
        <StackItem>Item 3</StackItem>
      </>
    ),
  },
};

export const WithWrap: Story = {
  args: {
    direction: 'horizontal',
    wrap: true,
    className: 'max-w-md',
    children: (
      <>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <StackItem key={i}>Item {i}</StackItem>
        ))}
      </>
    ),
  },
};

export const FormLayout: Story = {
  render: () => (
    <Stack spacing="lg" className="max-w-md">
      <div>
        <h2 className="text-2xl font-bold mb-2">Create Account</h2>
        <p className="text-neutral-600">Fill in your details to get started</p>
      </div>

      <Stack spacing="md">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">I agree to the terms and conditions</span>
          </label>
        </div>
      </Stack>

      <button className="w-full bg-coral-500 text-white py-3 rounded-lg hover:bg-coral-600 font-medium">
        Create Account
      </button>
    </Stack>
  ),
};

export const CardList: Story = {
  render: () => (
    <Stack spacing="md">
      {[
        { title: 'Premium Plan', price: '$29/mo', features: ['Unlimited searches', 'AI recommendations', 'Priority support'] },
        { title: 'Business Plan', price: '$99/mo', features: ['Everything in Premium', 'Team collaboration', 'API access'] },
        { title: 'Enterprise Plan', price: 'Custom', features: ['Everything in Business', 'Dedicated support', 'Custom integration'] },
      ].map((plan, i) => (
        <div key={i} className="bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <Stack spacing="md">
            <div>
              <h3 className="text-xl font-bold">{plan.title}</h3>
              <p className="text-3xl font-bold text-coral-600 mt-2">{plan.price}</p>
            </div>
            <Stack spacing="sm">
              {plan.features.map((feature, j) => (
                <div key={j} className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </Stack>
            <button className="w-full bg-coral-500 text-white py-2 rounded-lg hover:bg-coral-600">
              Choose Plan
            </button>
          </Stack>
        </div>
      ))}
    </Stack>
  ),
};

export const NavigationMenu: Story = {
  render: () => (
    <Stack direction="horizontal" spacing="lg" align="center" className="bg-white shadow-sm px-6 py-4 rounded-lg">
      <div className="font-bold text-xl text-coral-600">Mykadoo</div>
      <Stack direction="horizontal" spacing="md" className="flex-1" justify="center">
        <a href="#" className="text-neutral-700 hover:text-coral-600 font-medium">Home</a>
        <a href="#" className="text-neutral-700 hover:text-coral-600 font-medium">Search</a>
        <a href="#" className="text-neutral-700 hover:text-coral-600 font-medium">Guides</a>
        <a href="#" className="text-neutral-700 hover:text-coral-600 font-medium">About</a>
      </Stack>
      <Stack direction="horizontal" spacing="sm">
        <button className="px-4 py-2 text-coral-600 hover:bg-coral-50 rounded-lg">
          Sign In
        </button>
        <button className="px-4 py-2 bg-coral-500 text-white hover:bg-coral-600 rounded-lg">
          Sign Up
        </button>
      </Stack>
    </Stack>
  ),
};

export const ProfileSection: Story = {
  render: () => (
    <div className="max-w-sm bg-white rounded-lg shadow-md p-6">
      <Stack spacing="lg">
        <Stack spacing="md" align="center">
          <div className="w-20 h-20 bg-coral-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            JD
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold">John Doe</h3>
            <p className="text-neutral-600">john.doe@example.com</p>
          </div>
        </Stack>

        <Stack spacing="xs">
          <div className="flex justify-between py-2 border-b">
            <span className="text-neutral-600">Member since</span>
            <span className="font-medium">Jan 2024</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-neutral-600">Plan</span>
            <span className="font-medium text-coral-600">Premium</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-neutral-600">Searches</span>
            <span className="font-medium">234</span>
          </div>
        </Stack>

        <button className="w-full bg-neutral-100 text-neutral-700 py-2 rounded-lg hover:bg-neutral-200">
          Edit Profile
        </button>
      </Stack>
    </div>
  ),
};

export const NotificationStack: Story = {
  render: () => (
    <Stack spacing="sm" className="max-w-md">
      {[
        { type: 'success', message: 'Your profile has been updated successfully' },
        { type: 'warning', message: 'Your subscription will expire in 3 days' },
        { type: 'info', message: 'New gift recommendations are available' },
        { type: 'error', message: 'Failed to save changes. Please try again' },
      ].map((notification, i) => (
        <div
          key={i}
          className={`p-4 rounded-lg ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' :
            notification.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
            notification.type === 'info' ? 'bg-blue-50 border border-blue-200' :
            'bg-red-50 border border-red-200'
          }`}
        >
          <Stack direction="horizontal" spacing="sm" align="center">
            <span className="text-lg">
              {notification.type === 'success' ? '✓' :
               notification.type === 'warning' ? '⚠' :
               notification.type === 'info' ? 'ℹ' : '✕'}
            </span>
            <span className="text-sm flex-1">{notification.message}</span>
            <button className="text-neutral-400 hover:text-neutral-600">×</button>
          </Stack>
        </div>
      ))}
    </Stack>
  ),
};
