import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarGroup } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Content/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Avatars represent users or entities with images, initials, or fallback indicators. They support multiple sizes, shapes, and status indicators for presence.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      description: 'Image source URL',
      control: { type: 'text' },
    },
    alt: {
      description: 'Alt text for image',
      control: { type: 'text' },
    },
    fallback: {
      description: 'Fallback text (initials) when image fails',
      control: { type: 'text' },
    },
    size: {
      description: 'Avatar size',
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
    shape: {
      description: 'Avatar shape',
      control: { type: 'select' },
      options: ['circle', 'square'],
    },
    status: {
      description: 'Status indicator',
      control: { type: 'select' },
      options: ['online', 'offline', 'away', 'busy'],
    },
    className: {
      description: 'Additional CSS classes',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    alt: 'User Avatar',
  },
};

export const WithFallback: Story = {
  args: {
    fallback: 'JD',
    alt: 'John Doe',
  },
  parameters: {
    docs: {
      description: {
        story: 'Avatar with initials fallback when no image is provided.',
      },
    },
  },
};

export const WithStatus: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=2',
    alt: 'User Avatar',
    status: 'online',
  },
  parameters: {
    docs: {
      description: {
        story: 'Avatar with online status indicator.',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Avatar src="https://i.pravatar.cc/150?img=3" alt="User" size="xs" />
      <Avatar src="https://i.pravatar.cc/150?img=3" alt="User" size="sm" />
      <Avatar src="https://i.pravatar.cc/150?img=3" alt="User" size="md" />
      <Avatar src="https://i.pravatar.cc/150?img=3" alt="User" size="lg" />
      <Avatar src="https://i.pravatar.cc/150?img=3" alt="User" size="xl" />
      <Avatar src="https://i.pravatar.cc/150?img=3" alt="User" size="2xl" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available avatar sizes from extra small to 2XL.',
      },
    },
  },
};

export const CircleShape: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=4',
    alt: 'User Avatar',
    shape: 'circle',
    size: 'lg',
  },
  parameters: {
    docs: {
      description: {
        story: 'Circle shape avatar (default).',
      },
    },
  },
};

export const SquareShape: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=5',
    alt: 'User Avatar',
    shape: 'square',
    size: 'lg',
  },
  parameters: {
    docs: {
      description: {
        story: 'Square shape avatar with rounded corners.',
      },
    },
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="text-center">
        <Avatar src="https://i.pravatar.cc/150?img=6" alt="User" status="online" size="lg" />
        <p className="text-xs text-neutral-600 mt-2">Online</p>
      </div>
      <div className="text-center">
        <Avatar src="https://i.pravatar.cc/150?img=7" alt="User" status="offline" size="lg" />
        <p className="text-xs text-neutral-600 mt-2">Offline</p>
      </div>
      <div className="text-center">
        <Avatar src="https://i.pravatar.cc/150?img=8" alt="User" status="away" size="lg" />
        <p className="text-xs text-neutral-600 mt-2">Away</p>
      </div>
      <div className="text-center">
        <Avatar src="https://i.pravatar.cc/150?img=9" alt="User" status="busy" size="lg" />
        <p className="text-xs text-neutral-600 mt-2">Busy</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available status indicators for user presence.',
      },
    },
  },
};

export const FallbackInitials: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar fallback="AB" alt="Alice Brown" size="lg" />
      <Avatar fallback="CD" alt="Charlie Davis" size="lg" />
      <Avatar fallback="EF" alt="Emma Foster" size="lg" />
      <Avatar fallback="GH" alt="George Harris" size="lg" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatars displaying initials when images are not available.',
      },
    },
  },
};

export const ImageError: Story = {
  args: {
    src: 'https://invalid-url.example.com/avatar.jpg',
    fallback: 'ER',
    alt: 'Error User',
    size: 'lg',
  },
  parameters: {
    docs: {
      description: {
        story: 'Avatar handling image load errors gracefully with fallback initials.',
      },
    },
  },
};

export const GroupDefault: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar src="https://i.pravatar.cc/150?img=10" alt="User 1" />
      <Avatar src="https://i.pravatar.cc/150?img=11" alt="User 2" />
      <Avatar src="https://i.pravatar.cc/150?img=12" alt="User 3" />
      <Avatar src="https://i.pravatar.cc/150?img=13" alt="User 4" />
      <Avatar src="https://i.pravatar.cc/150?img=14" alt="User 5" />
    </AvatarGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar group showing multiple users with overflow count.',
      },
    },
  },
};

export const GroupCustomMax: Story = {
  render: () => (
    <AvatarGroup max={5}>
      <Avatar src="https://i.pravatar.cc/150?img=15" alt="User 1" />
      <Avatar src="https://i.pravatar.cc/150?img=16" alt="User 2" />
      <Avatar src="https://i.pravatar.cc/150?img=17" alt="User 3" />
      <Avatar src="https://i.pravatar.cc/150?img=18" alt="User 4" />
      <Avatar src="https://i.pravatar.cc/150?img=19" alt="User 5" />
      <Avatar src="https://i.pravatar.cc/150?img=20" alt="User 6" />
      <Avatar src="https://i.pravatar.cc/150?img=21" alt="User 7" />
    </AvatarGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar group with custom maximum visible count.',
      },
    },
  },
};

export const RealWorldUserProfile: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-lg">
      <Avatar src="https://i.pravatar.cc/150?img=22" alt="Sarah Johnson" size="xl" status="online" />
      <div>
        <h3 className="text-lg font-semibold text-neutral-900">Sarah Johnson</h3>
        <p className="text-sm text-neutral-600">Product Designer</p>
        <p className="text-xs text-neutral-500 mt-1">Active now</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'User profile card with avatar and status.',
      },
    },
  },
};

export const RealWorldCommentThread: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <div className="flex gap-3">
        <Avatar src="https://i.pravatar.cc/150?img=23" alt="Mike Chen" size="md" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold">Mike Chen</span>
            <span className="text-xs text-neutral-500">2 hours ago</span>
          </div>
          <p className="text-sm text-neutral-700">
            This looks great! The new design really improves the user experience.
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <Avatar fallback="JD" alt="Jane Doe" size="md" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold">Jane Doe</span>
            <span className="text-xs text-neutral-500">1 hour ago</span>
          </div>
          <p className="text-sm text-neutral-700">Thanks! I appreciate the feedback.</p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comment thread with user avatars.',
      },
    },
  },
};

export const RealWorldCollaborators: Story = {
  render: () => (
    <div className="p-4 bg-white border border-neutral-200 rounded-lg max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-900">Project Collaborators</h3>
        <button className="text-xs text-primary-600 hover:text-primary-700">View all</button>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar
              src="https://i.pravatar.cc/150?img=24"
              alt="Alex Turner"
              size="sm"
              status="online"
            />
            <span className="text-sm">Alex Turner</span>
          </div>
          <span className="text-xs text-neutral-500">Owner</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar
              src="https://i.pravatar.cc/150?img=25"
              alt="Maria Garcia"
              size="sm"
              status="away"
            />
            <span className="text-sm">Maria Garcia</span>
          </div>
          <span className="text-xs text-neutral-500">Editor</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar fallback="RC" alt="Ryan Cooper" size="sm" status="offline" />
            <span className="text-sm">Ryan Cooper</span>
          </div>
          <span className="text-xs text-neutral-500">Viewer</span>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-neutral-200">
        <AvatarGroup size="sm" max={4}>
          <Avatar src="https://i.pravatar.cc/150?img=26" alt="User 1" />
          <Avatar src="https://i.pravatar.cc/150?img=27" alt="User 2" />
          <Avatar src="https://i.pravatar.cc/150?img=28" alt="User 3" />
          <Avatar src="https://i.pravatar.cc/150?img=29" alt="User 4" />
          <Avatar src="https://i.pravatar.cc/150?img=30" alt="User 5" />
        </AvatarGroup>
        <p className="text-xs text-neutral-500 mt-2">+12 more collaborators</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Project collaborators list with roles and status indicators.',
      },
    },
  },
};
