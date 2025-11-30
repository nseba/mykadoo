import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Forms/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'select',
      options: ['default', 'error', 'success'],
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    type: 'email',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    helperText: 'Password must be at least 8 characters',
  },
};

export const ErrorState: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'you@example.com',
    state: 'error',
    helperText: 'Please enter a valid email address',
  },
};

export const SuccessState: Story = {
  args: {
    label: 'Username',
    placeholder: 'johndoe',
    state: 'success',
    helperText: 'Username is available!',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot edit this',
    disabled: true,
  },
};

export const WithLeftIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    leftIcon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M11 11L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
};

export const WithRightIcon: Story = {
  args: {
    label: 'Amount',
    type: 'number',
    placeholder: '0.00',
    rightIcon: <span className="text-sm">USD</span>,
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Input label="Default" placeholder="Default state" />
      <Input label="Error" placeholder="Error state" state="error" helperText="This field is required" />
      <Input label="Success" placeholder="Success state" state="success" helperText="Looks good!" />
      <Input label="Disabled" placeholder="Disabled state" disabled />
    </div>
  ),
};
