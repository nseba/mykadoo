import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider, useToast, toast } from './Toast';

/**
 * Toast notification system for displaying temporary messages.
 * Provides context provider and hook-based API for managing toasts.
 */
const meta: Meta<typeof ToastProvider> = {
  title: 'Components/Toast',
  component: ToastProvider,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ToastProvider>;

/**
 * Demo component to showcase toast functionality
 */
const ToastDemo = () => {
  const { addToast } = useToast();

  return (
    <div className="flex flex-col gap-4 p-8">
      <h2 className="text-xl font-semibold mb-4">Click buttons to show toasts</h2>
      
      <button
        onClick={() => addToast(toast.success('Success!', 'Your changes have been saved'))}
        className="px-4 py-2 bg-success-500 text-white rounded-lg hover:bg-success-600"
      >
        Show Success Toast
      </button>

      <button
        onClick={() => addToast(toast.error('Error!', 'Something went wrong'))}
        className="px-4 py-2 bg-error-500 text-white rounded-lg hover:bg-error-600"
      >
        Show Error Toast
      </button>

      <button
        onClick={() => addToast(toast.warning('Warning!', 'Please review your input'))}
        className="px-4 py-2 bg-warning-500 text-white rounded-lg hover:bg-warning-600"
      >
        Show Warning Toast
      </button>

      <button
        onClick={() => addToast(toast.info('Info', 'New features are available'))}
        className="px-4 py-2 bg-info-500 text-white rounded-lg hover:bg-info-600"
      >
        Show Info Toast
      </button>

      <button
        onClick={() => {
          addToast(toast.success('First', 'This is the first toast'));
          setTimeout(() => addToast(toast.info('Second', 'This is the second toast')), 200);
          setTimeout(() => addToast(toast.warning('Third', 'This is the third toast')), 400);
        }}
        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
      >
        Show Multiple Toasts
      </button>

      <button
        onClick={() => addToast({ title: 'Custom Duration', description: 'This toast lasts 10 seconds', variant: 'info', duration: 10000 })}
        className="px-4 py-2 bg-neutral-500 text-white rounded-lg hover:bg-neutral-600"
      >
        Show Long Toast (10s)
      </button>
    </div>
  );
};

/**
 * Interactive demo of toast notifications
 */
export const InteractiveDemo: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};

/**
 * Success toast variant
 */
export const SuccessToast: Story = {
  render: () => (
    <ToastProvider>
      <div className="p-8">
        <button
          onClick={() => {
            const { addToast } = useToast();
            addToast(toast.success('Success!', 'Your changes have been saved successfully'));
          }}
          className="px-4 py-2 bg-success-500 text-white rounded-lg"
        >
          Show Success
        </button>
      </div>
    </ToastProvider>
  ),
};

/**
 * Error toast variant
 */
export const ErrorToast: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};

/**
 * Warning toast variant
 */
export const WarningToast: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};

/**
 * Info toast variant
 */
export const InfoToast: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};

/**
 * Toast without description
 */
export const TitleOnly: Story = {
  render: () => (
    <ToastProvider>
      <div className="p-8">
        <button
          onClick={() => {
            const { addToast } = useToast();
            addToast({ title: 'Simple notification', variant: 'info' });
          }}
          className="px-4 py-2 bg-info-500 text-white rounded-lg"
        >
          Show Title Only
        </button>
      </div>
    </ToastProvider>
  ),
};
