import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Popover } from './Popover';

const meta: Meta<typeof Popover> = {
  title: 'Components/Content/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Popovers display rich content in a floating panel triggered by user interaction. Unlike tooltips, popovers can contain interactive elements and remain open until explicitly closed. Built with Radix UI for accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    trigger: {
      description: 'Trigger element that opens the popover',
      control: { type: 'text' },
    },
    children: {
      description: 'Popover content',
      control: { type: 'text' },
    },
    side: {
      description: 'Preferred side of the trigger',
      control: { type: 'select' },
      options: ['top', 'right', 'bottom', 'left'],
    },
    align: {
      description: 'Alignment relative to trigger',
      control: { type: 'select' },
      options: ['start', 'center', 'end'],
    },
    open: {
      description: 'Controlled open state',
      control: { type: 'boolean' },
    },
    onOpenChange: {
      description: 'Callback when open state changes',
      action: 'open changed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  args: {
    trigger: (
      <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
        Open Popover
      </button>
    ),
    children: (
      <div>
        <h3 className="font-semibold text-neutral-900 mb-2">Popover Title</h3>
        <p className="text-sm text-neutral-600">
          This is the popover content. It can contain text, images, forms, or any other elements.
        </p>
      </div>
    ),
  },
};

export const BottomPosition: Story = {
  args: {
    trigger: (
      <button className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-md hover:bg-neutral-300">
        Open Below
      </button>
    ),
    side: 'bottom',
    children: (
      <div>
        <p className="text-sm text-neutral-700">This popover opens below the trigger.</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Popover positioned below the trigger element.',
      },
    },
  },
};

export const TopPosition: Story = {
  args: {
    trigger: (
      <button className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-md hover:bg-neutral-300">
        Open Above
      </button>
    ),
    side: 'top',
    children: (
      <div>
        <p className="text-sm text-neutral-700">This popover opens above the trigger.</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Popover positioned above the trigger element.',
      },
    },
  },
};

export const RightPosition: Story = {
  args: {
    trigger: (
      <button className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-md hover:bg-neutral-300">
        Open Right
      </button>
    ),
    side: 'right',
    children: (
      <div>
        <p className="text-sm text-neutral-700">This popover opens to the right.</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Popover positioned to the right of the trigger.',
      },
    },
  },
};

export const LeftPosition: Story = {
  args: {
    trigger: (
      <button className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-md hover:bg-neutral-300">
        Open Left
      </button>
    ),
    side: 'left',
    children: (
      <div>
        <p className="text-sm text-neutral-700">This popover opens to the left.</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Popover positioned to the left of the trigger.',
      },
    },
  },
};

export const WithForm: Story = {
  args: {
    trigger: (
      <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
        Quick Reply
      </button>
    ),
    side: 'bottom',
    children: (
      <div className="space-y-3">
        <h3 className="font-semibold text-neutral-900">Send a Message</h3>
        <input
          type="text"
          placeholder="Your name"
          className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <textarea
          placeholder="Your message"
          rows={3}
          className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button className="w-full px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700">
          Send
        </button>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Popover containing an interactive form.',
      },
    },
  },
};

export const WithList: Story = {
  args: {
    trigger: (
      <button className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-md hover:bg-neutral-300">
        Show Options
      </button>
    ),
    side: 'bottom',
    align: 'start',
    children: (
      <div>
        <h3 className="font-semibold text-neutral-900 mb-2">Actions</h3>
        <ul className="space-y-1">
          <li>
            <button className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded">
              Edit
            </button>
          </li>
          <li>
            <button className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded">
              Duplicate
            </button>
          </li>
          <li>
            <button className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded">
              Archive
            </button>
          </li>
          <li className="pt-1 border-t border-neutral-200">
            <button className="w-full text-left px-3 py-2 text-sm text-error-600 hover:bg-error-50 rounded">
              Delete
            </button>
          </li>
        </ul>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Popover with a list of actionable items.',
      },
    },
  },
};

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className="space-y-4">
        <Popover
          trigger={
            <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
              Controlled Popover
            </button>
          }
          open={open}
          onOpenChange={setOpen}
        >
          <div className="space-y-3">
            <p className="text-sm text-neutral-700">This is a controlled popover.</p>
            <button
              onClick={() => setOpen(false)}
              className="w-full px-4 py-2 bg-neutral-100 text-neutral-900 text-sm rounded-md hover:bg-neutral-200"
            >
              Close
            </button>
          </div>
        </Popover>
        <div className="text-sm text-neutral-600">
          Popover is {open ? 'open' : 'closed'}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Popover with controlled state management.',
      },
    },
  },
};

export const AllPositions: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8">
      <Popover
        trigger={
          <button className="px-4 py-2 bg-neutral-200 rounded-md hover:bg-neutral-300">
            Top
          </button>
        }
        side="top"
      >
        <p className="text-sm text-neutral-700">Top position</p>
      </Popover>
      <Popover
        trigger={
          <button className="px-4 py-2 bg-neutral-200 rounded-md hover:bg-neutral-300">
            Right
          </button>
        }
        side="right"
      >
        <p className="text-sm text-neutral-700">Right position</p>
      </Popover>
      <Popover
        trigger={
          <button className="px-4 py-2 bg-neutral-200 rounded-md hover:bg-neutral-300">
            Bottom
          </button>
        }
        side="bottom"
      >
        <p className="text-sm text-neutral-700">Bottom position</p>
      </Popover>
      <Popover
        trigger={
          <button className="px-4 py-2 bg-neutral-200 rounded-md hover:bg-neutral-300">
            Left
          </button>
        }
        side="left"
      >
        <p className="text-sm text-neutral-700">Left position</p>
      </Popover>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All four popover positions demonstrated.',
      },
    },
  },
};

export const AllAlignments: Story = {
  render: () => (
    <div className="flex gap-4">
      <Popover
        trigger={
          <button className="px-4 py-2 bg-neutral-200 rounded-md hover:bg-neutral-300">
            Start
          </button>
        }
        side="bottom"
        align="start"
      >
        <p className="text-sm text-neutral-700">Start aligned</p>
      </Popover>
      <Popover
        trigger={
          <button className="px-4 py-2 bg-neutral-200 rounded-md hover:bg-neutral-300">
            Center
          </button>
        }
        side="bottom"
        align="center"
      >
        <p className="text-sm text-neutral-700">Center aligned</p>
      </Popover>
      <Popover
        trigger={
          <button className="px-4 py-2 bg-neutral-200 rounded-md hover:bg-neutral-300">
            End
          </button>
        }
        side="bottom"
        align="end"
      >
        <p className="text-sm text-neutral-700">End aligned</p>
      </Popover>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Popovers with different alignment options.',
      },
    },
  },
};

export const RealWorldUserMenu: Story = {
  render: () => (
    <Popover
      trigger={
        <button className="flex items-center gap-2 px-3 py-2 bg-neutral-100 rounded-md hover:bg-neutral-200">
          <div className="h-8 w-8 rounded-full bg-primary-200" />
          <span className="text-sm font-medium">John Doe</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      }
      side="bottom"
      align="end"
    >
      <div className="space-y-1">
        <div className="px-3 py-2 border-b border-neutral-200">
          <p className="text-sm font-semibold text-neutral-900">John Doe</p>
          <p className="text-xs text-neutral-600">john.doe@example.com</p>
        </div>
        <button className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded">
          Profile
        </button>
        <button className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded">
          Settings
        </button>
        <button className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded">
          Billing
        </button>
        <div className="pt-1 border-t border-neutral-200">
          <button className="w-full text-left px-3 py-2 text-sm text-error-600 hover:bg-error-50 rounded">
            Sign Out
          </button>
        </div>
      </div>
    </Popover>
  ),
  parameters: {
    docs: {
      description: {
        story: 'User account menu in a popover with profile info and navigation.',
      },
    },
  },
};

export const RealWorldColorPicker: Story = {
  render: () => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
    ];

    return (
      <Popover
        trigger={
          <button className="flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-md hover:bg-neutral-200">
            <div className="h-5 w-5 rounded bg-primary-500 border border-neutral-300" />
            <span className="text-sm">Choose Color</span>
          </button>
        }
        side="bottom"
      >
        <div>
          <h3 className="font-semibold text-neutral-900 mb-3">Select a Color</h3>
          <div className="grid grid-cols-5 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                className="h-8 w-8 rounded border-2 border-transparent hover:border-neutral-400 transition-colors"
                style={{ backgroundColor: color }}
                aria-label={`Color ${color}`}
              />
            ))}
          </div>
        </div>
      </Popover>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Color picker popover with a grid of selectable colors.',
      },
    },
  },
};

export const RealWorldNotificationCenter: Story = {
  render: () => (
    <Popover
      trigger={
        <button className="relative p-2 bg-neutral-100 rounded-md hover:bg-neutral-200">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-semibold bg-error-600 text-white rounded-full">
            3
          </span>
        </button>
      }
      side="bottom"
      align="end"
    >
      <div className="w-80">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-neutral-900">Notifications</h3>
          <button className="text-xs text-primary-600 hover:text-primary-700">Mark all read</button>
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          <div className="p-3 bg-primary-50 rounded-lg hover:bg-primary-100 cursor-pointer">
            <p className="text-sm font-medium text-neutral-900">New message from Sarah</p>
            <p className="text-xs text-neutral-600 mt-1">Hey, can we discuss the project?</p>
            <p className="text-xs text-neutral-500 mt-1">2 minutes ago</p>
          </div>
          <div className="p-3 hover:bg-neutral-50 rounded-lg cursor-pointer">
            <p className="text-sm font-medium text-neutral-900">Your order has shipped</p>
            <p className="text-xs text-neutral-600 mt-1">Track your package</p>
            <p className="text-xs text-neutral-500 mt-1">1 hour ago</p>
          </div>
          <div className="p-3 hover:bg-neutral-50 rounded-lg cursor-pointer">
            <p className="text-sm font-medium text-neutral-900">Weekly report ready</p>
            <p className="text-xs text-neutral-600 mt-1">View your analytics</p>
            <p className="text-xs text-neutral-500 mt-1">3 hours ago</p>
          </div>
        </div>
        <div className="pt-2 mt-2 border-t border-neutral-200">
          <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 py-2">
            View all notifications
          </button>
        </div>
      </div>
    </Popover>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Notification center popover with scrollable list of notifications.',
      },
    },
  },
};

export const RealWorldShareMenu: Story = {
  render: () => (
    <Popover
      trigger={
        <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
          Share
        </button>
      }
      side="bottom"
    >
      <div className="space-y-3">
        <h3 className="font-semibold text-neutral-900">Share this page</h3>
        <div className="flex gap-2">
          <button className="flex-1 p-2 border border-neutral-300 rounded-md hover:bg-neutral-50">
            <svg className="w-5 h-5 mx-auto text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>
          <button className="flex-1 p-2 border border-neutral-300 rounded-md hover:bg-neutral-50">
            <svg className="w-5 h-5 mx-auto text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
          </button>
          <button className="flex-1 p-2 border border-neutral-300 rounded-md hover:bg-neutral-50">
            <svg className="w-5 h-5 mx-auto text-blue-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </button>
        </div>
        <div className="pt-2 border-t border-neutral-200">
          <label className="block text-xs font-medium text-neutral-700 mb-2">
            Or copy link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value="https://example.com/page"
              readOnly
              className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-md bg-neutral-50"
            />
            <button className="px-3 py-2 bg-neutral-100 text-neutral-900 text-sm rounded-md hover:bg-neutral-200">
              Copy
            </button>
          </div>
        </div>
      </div>
    </Popover>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Share menu popover with social media buttons and copy link functionality.',
      },
    },
  },
};
