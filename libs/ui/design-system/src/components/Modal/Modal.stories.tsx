import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal, ModalTrigger } from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'Components/Content/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Modals are dialog overlays that focus user attention on specific tasks or information. They block interaction with the rest of the page until dismissed. Built with Radix UI for accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      description: 'Controlled open state',
      control: { type: 'boolean' },
    },
    onOpenChange: {
      description: 'Callback when open state changes',
      action: 'open changed',
    },
    title: {
      description: 'Modal title',
      control: { type: 'text' },
    },
    description: {
      description: 'Modal description',
      control: { type: 'text' },
    },
    size: {
      description: 'Modal size variant',
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
    closeOnOverlayClick: {
      description: 'Allow closing by clicking overlay',
      control: { type: 'boolean' },
    },
    closeOnEscape: {
      description: 'Allow closing with Escape key',
      control: { type: 'boolean' },
    },
    showCloseButton: {
      description: 'Show close button in header',
      control: { type: 'boolean' },
    },
    footer: {
      description: 'Modal footer content (typically actions)',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Open Modal
        </button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Modal Title"
          description="This is a description providing additional context for the modal."
        >
          <p className="text-neutral-700">
            This is the modal content. Modals are useful for focusing user attention on a specific
            task or piece of information.
          </p>
        </Modal>
      </>
    );
  },
};

export const SmallSize: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Open Small Modal
        </button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Small Modal"
          description="Compact modal for simple messages."
          size="sm"
        >
          <p className="text-neutral-700">This is a small modal ideal for confirmations or brief messages.</p>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Small modal size for simple confirmations or alerts.',
      },
    },
  },
};

export const LargeSize: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Open Large Modal
        </button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Large Modal"
          description="Spacious modal for complex content."
          size="lg"
        >
          <div className="space-y-4 text-neutral-700">
            <p>
              This large modal provides more space for complex content, forms, or detailed
              information that requires user attention.
            </p>
            <p>
              You can include multiple paragraphs, images, or even embedded components within the
              modal body.
            </p>
          </div>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Large modal size for complex content or forms.',
      },
    },
  },
};

export const ExtraLargeSize: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Open XL Modal
        </button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Extra Large Modal"
          description="Maximum content space while maintaining centered layout."
          size="xl"
        >
          <div className="space-y-4 text-neutral-700">
            <p>
              Extra large modals are perfect for data-heavy interfaces like tables, galleries, or
              multi-step forms.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 rounded">Column 1</div>
              <div className="p-4 bg-neutral-50 rounded">Column 2</div>
            </div>
          </div>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Extra large modal for data-heavy content.',
      },
    },
  },
};

export const FullSize: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Open Full Modal
        </button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Full Width Modal"
          description="Modal that spans nearly the full viewport width."
          size="full"
        >
          <p className="text-neutral-700">
            Full-width modals are useful for immersive experiences or when you need maximum screen
            real estate.
          </p>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Full-width modal for immersive experiences.',
      },
    },
  },
};

export const WithFooter: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Open Modal with Footer
        </button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Modal with Actions"
          description="Modal with footer containing action buttons."
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Confirm
              </button>
            </div>
          }
        >
          <p className="text-neutral-700">
            This modal includes a footer section with action buttons. The footer is visually
            separated and provides a clear area for primary actions.
          </p>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal with footer section containing action buttons.',
      },
    },
  },
};

export const WithoutCloseButton: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Open Modal
        </button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="No Close Button"
          description="You must use the Cancel button to close this modal."
          showCloseButton={false}
          footer={
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md"
            >
              Cancel
            </button>
          }
        >
          <p className="text-neutral-700">This modal has no close button in the header.</p>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal without the close button, forcing users to use explicit actions.',
      },
    },
  },
};

export const PreventBackdropClose: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Open Modal
        </button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Important Action"
          description="This modal requires explicit confirmation."
          closeOnOverlayClick={false}
          closeOnEscape={false}
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm bg-error-600 text-white rounded-md hover:bg-error-700"
              >
                Delete
              </button>
            </div>
          }
        >
          <p className="text-neutral-700">
            This modal cannot be closed by clicking outside or pressing Escape. You must use the
            action buttons.
          </p>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal that prevents accidental dismissal for critical actions.',
      },
    },
  },
};

export const WithoutDescription: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Open Modal
        </button>
        <Modal open={open} onOpenChange={setOpen} title="Simple Modal">
          <p className="text-neutral-700">This modal has only a title, no description.</p>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal with title only, no description.',
      },
    },
  },
};

export const WithForm: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Create New Item
        </button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Create New Item"
          description="Fill in the details to create a new item."
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md"
              >
                Cancel
              </button>
              <button className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700">
                Create
              </button>
            </div>
          }
        >
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter description"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-1">
                Category
              </label>
              <select
                id="category"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option>Select a category</option>
                <option>Category 1</option>
                <option>Category 2</option>
                <option>Category 3</option>
              </select>
            </div>
          </form>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal containing a form for data entry.',
      },
    },
  },
};

export const RealWorldDeleteConfirmation: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-error-600 text-white rounded-md hover:bg-error-700"
        >
          Delete Account
        </button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Delete Account?"
          description="This action cannot be undone. All your data will be permanently removed."
          size="sm"
          closeOnOverlayClick={false}
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm bg-error-600 text-white rounded-md hover:bg-error-700"
              >
                Delete Account
              </button>
            </div>
          }
        >
          <div className="text-neutral-700 space-y-3">
            <p>Are you absolutely sure you want to delete your account?</p>
            <div className="p-3 bg-error-50 border border-error-200 rounded-md">
              <p className="text-sm text-error-800 font-medium">Warning:</p>
              <ul className="text-sm text-error-700 mt-1 list-disc list-inside">
                <li>All your personal data will be deleted</li>
                <li>Your purchase history will be lost</li>
                <li>You will lose access to premium features</li>
              </ul>
            </div>
          </div>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Destructive action confirmation modal with warning.',
      },
    },
  },
};

export const RealWorldImageGallery: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          View Gallery
        </button>
        <Modal open={open} onOpenChange={setOpen} title="Image Gallery" size="xl">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-neutral-200 rounded-lg" />
            ))}
          </div>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Image gallery modal with grid layout.',
      },
    },
  },
};

export const RealWorldTermsAndConditions: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          View Terms
        </button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Terms and Conditions"
          description="Please read our terms and conditions carefully."
          size="lg"
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md"
              >
                Decline
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Accept
              </button>
            </div>
          }
        >
          <div className="prose prose-sm text-neutral-700 max-h-96 overflow-y-auto">
            <h4>1. Acceptance of Terms</h4>
            <p>
              By accessing and using this service, you accept and agree to be bound by the terms
              and provision of this agreement.
            </p>
            <h4>2. Use License</h4>
            <p>
              Permission is granted to temporarily download one copy of the materials on our
              website for personal, non-commercial transitory viewing only.
            </p>
            <h4>3. Disclaimer</h4>
            <p>
              The materials on our website are provided on an 'as is' basis. We make no warranties,
              expressed or implied, and hereby disclaim all warranties.
            </p>
          </div>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Scrollable terms and conditions modal with accept/decline actions.',
      },
    },
  },
};
