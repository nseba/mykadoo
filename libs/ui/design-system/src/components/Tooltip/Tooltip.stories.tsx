import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip, TooltipProvider } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Content/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Tooltips display informative text when users hover over, focus on, or tap an element. Built with Radix UI for accessibility. Must be wrapped in TooltipProvider at app level or story level.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="p-20">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
  argTypes: {
    content: {
      description: 'Tooltip content to display',
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
    delayDuration: {
      description: 'Delay before showing tooltip (ms)',
      control: { type: 'number' },
    },
    size: {
      description: 'Tooltip size',
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: 'This is a helpful tooltip',
    children: (
      <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
        Hover me
      </button>
    ),
  },
};

export const TopPosition: Story = {
  args: {
    content: 'Tooltip appears above',
    side: 'top',
    children: (
      <button className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-md hover:bg-neutral-300">
        Hover for top tooltip
      </button>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Tooltip positioned above the trigger element.',
      },
    },
  },
};

export const RightPosition: Story = {
  args: {
    content: 'Tooltip appears to the right',
    side: 'right',
    children: (
      <button className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-md hover:bg-neutral-300">
        Hover for right tooltip
      </button>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Tooltip positioned to the right of the trigger.',
      },
    },
  },
};

export const BottomPosition: Story = {
  args: {
    content: 'Tooltip appears below',
    side: 'bottom',
    children: (
      <button className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-md hover:bg-neutral-300">
        Hover for bottom tooltip
      </button>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Tooltip positioned below the trigger element.',
      },
    },
  },
};

export const LeftPosition: Story = {
  args: {
    content: 'Tooltip appears to the left',
    side: 'left',
    children: (
      <button className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-md hover:bg-neutral-300">
        Hover for left tooltip
      </button>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Tooltip positioned to the left of the trigger.',
      },
    },
  },
};

export const SmallSize: Story = {
  args: {
    content: 'Small tooltip',
    size: 'sm',
    children: (
      <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
        Small tooltip
      </button>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact tooltip with small padding and text.',
      },
    },
  },
};

export const LargeSize: Story = {
  args: {
    content: 'This is a larger tooltip with more space',
    size: 'lg',
    children: (
      <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
        Large tooltip
      </button>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Larger tooltip with generous padding.',
      },
    },
  },
};

export const CustomDelay: Story = {
  args: {
    content: 'This tooltip appears after 1 second',
    delayDuration: 1000,
    children: (
      <button className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-md hover:bg-neutral-300">
        Hover (1s delay)
      </button>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Tooltip with custom delay duration before appearing.',
      },
    },
  },
};

export const NoDelay: Story = {
  args: {
    content: 'Instant tooltip',
    delayDuration: 0,
    children: (
      <button className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-md hover:bg-neutral-300">
        Hover (no delay)
      </button>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Tooltip with no delay, appears immediately on hover.',
      },
    },
  },
};

export const MultilineContent: Story = {
  args: {
    content: (
      <div>
        <div className="font-semibold mb-1">Keyboard Shortcut</div>
        <div>Press Cmd+K to open</div>
      </div>
    ),
    size: 'lg',
    children: (
      <button className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-md hover:bg-neutral-300">
        Hover for details
      </button>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Tooltip with multi-line or structured content.',
      },
    },
  },
};

export const AllAlignments: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip content="Start aligned" side="bottom" align="start">
        <button className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-md hover:bg-neutral-300">
          Start
        </button>
      </Tooltip>
      <Tooltip content="Center aligned" side="bottom" align="center">
        <button className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-md hover:bg-neutral-300">
          Center
        </button>
      </Tooltip>
      <Tooltip content="End aligned" side="bottom" align="end">
        <button className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-md hover:bg-neutral-300">
          End
        </button>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tooltips with different alignment options.',
      },
    },
  },
};

export const AllPositions: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8">
      <Tooltip content="Top tooltip" side="top">
        <button className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-md hover:bg-neutral-300">
          Top
        </button>
      </Tooltip>
      <Tooltip content="Right tooltip" side="right">
        <button className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-md hover:bg-neutral-300">
          Right
        </button>
      </Tooltip>
      <Tooltip content="Bottom tooltip" side="bottom">
        <button className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-md hover:bg-neutral-300">
          Bottom
        </button>
      </Tooltip>
      <Tooltip content="Left tooltip" side="left">
        <button className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-md hover:bg-neutral-300">
          Left
        </button>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All four tooltip positions demonstrated.',
      },
    },
  },
};

export const RealWorldIconButtons: Story = {
  render: () => (
    <div className="flex gap-2">
      <Tooltip content="Edit">
        <button className="p-2 bg-neutral-100 rounded-md hover:bg-neutral-200">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
      </Tooltip>
      <Tooltip content="Delete">
        <button className="p-2 bg-neutral-100 rounded-md hover:bg-error-50 hover:text-error-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </Tooltip>
      <Tooltip content="Share">
        <button className="p-2 bg-neutral-100 rounded-md hover:bg-neutral-200">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </button>
      </Tooltip>
      <Tooltip content="Download">
        <button className="p-2 bg-neutral-100 rounded-md hover:bg-neutral-200">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tooltips on icon-only buttons to explain their purpose.',
      },
    },
  },
};

export const RealWorldHelpText: Story = {
  render: () => (
    <div className="max-w-md space-y-4">
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-1">
          Email Address
          <Tooltip
            content="We'll never share your email with anyone else."
            side="right"
            size="sm"
          >
            <span className="inline-flex items-center justify-center w-4 h-4 text-xs bg-neutral-200 rounded-full cursor-help">
              ?
            </span>
          </Tooltip>
        </label>
        <input
          type="email"
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-1">
          Password
          <Tooltip
            content={
              <div>
                <div className="font-semibold mb-1">Password Requirements:</div>
                <ul className="text-xs space-y-0.5">
                  <li>• At least 8 characters</li>
                  <li>• One uppercase letter</li>
                  <li>• One number</li>
                  <li>• One special character</li>
                </ul>
              </div>
            }
            side="right"
            size="lg"
          >
            <span className="inline-flex items-center justify-center w-4 h-4 text-xs bg-neutral-200 rounded-full cursor-help">
              ?
            </span>
          </Tooltip>
        </label>
        <input
          type="password"
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter password"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tooltips providing help text and additional context for form fields.',
      },
    },
  },
};

export const RealWorldStatusIndicators: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Tooltip content="All systems operational" side="right">
          <span className="h-3 w-3 bg-success-500 rounded-full cursor-help" />
        </Tooltip>
        <span className="text-sm text-neutral-700">API Server</span>
      </div>
      <div className="flex items-center gap-2">
        <Tooltip
          content="Experiencing minor issues. Response time may be slower."
          side="right"
          size="lg"
        >
          <span className="h-3 w-3 bg-warning-500 rounded-full cursor-help" />
        </Tooltip>
        <span className="text-sm text-neutral-700">Database</span>
      </div>
      <div className="flex items-center gap-2">
        <Tooltip content="Service unavailable. We're working on it!" side="right">
          <span className="h-3 w-3 bg-error-500 rounded-full cursor-help" />
        </Tooltip>
        <span className="text-sm text-neutral-700">Payment Gateway</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tooltips on status indicators providing detailed information.',
      },
    },
  },
};

export const RealWorldDataVisualization: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-neutral-900">Monthly Sales</h3>
      <div className="flex items-end gap-2 h-32">
        {[
          { month: 'Jan', value: 45, amount: '$4,500' },
          { month: 'Feb', value: 62, amount: '$6,200' },
          { month: 'Mar', value: 38, amount: '$3,800' },
          { month: 'Apr', value: 78, amount: '$7,800' },
          { month: 'May', value: 55, amount: '$5,500' },
          { month: 'Jun', value: 90, amount: '$9,000' },
        ].map((item) => (
          <Tooltip
            key={item.month}
            content={
              <div className="text-center">
                <div className="font-semibold">{item.month}</div>
                <div className="text-xs">{item.amount}</div>
              </div>
            }
            side="top"
          >
            <div className="flex-1 bg-primary-500 rounded-t cursor-pointer hover:bg-primary-600 transition-colors" style={{ height: `${item.value}%` }} />
          </Tooltip>
        ))}
      </div>
      <div className="flex justify-between text-xs text-neutral-600">
        <span>Jan</span>
        <span>Feb</span>
        <span>Mar</span>
        <span>Apr</span>
        <span>May</span>
        <span>Jun</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tooltips on chart elements showing detailed data on hover.',
      },
    },
  },
};
