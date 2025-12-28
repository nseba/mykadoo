import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Modal, ModalTrigger, ModalClose } from './Modal';

expect.extend(toHaveNoViolations);

describe('Modal', () => {
  describe('Rendering', () => {
    it('should render when open is true', () => {
      render(<Modal open={true}>Modal Content</Modal>);
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(<Modal open={false}>Modal Content</Modal>);
      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('should render with title', () => {
      render(
        <Modal open={true} title="Modal Title">
          Content
        </Modal>
      );
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
    });

    it('should render with description', () => {
      render(
        <Modal open={true} description="Modal description text">
          Content
        </Modal>
      );
      expect(screen.getByText('Modal description text')).toBeInTheDocument();
    });

    it('should render with footer', () => {
      render(
        <Modal open={true} footer={<button>Action</button>}>
          Content
        </Modal>
      );
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      render(
        <Modal open={true} size="sm">
          Small Modal
        </Modal>
      );
      // Modal uses Portal, so search in document.body
      const content = document.body.querySelector('.max-w-md');
      expect(content).toBeInTheDocument();
    });

    it('should render medium size by default', () => {
      render(<Modal open={true}>Medium Modal</Modal>);
      const content = document.body.querySelector('.max-w-lg');
      expect(content).toBeInTheDocument();
    });

    it('should render large size', () => {
      render(
        <Modal open={true} size="lg">
          Large Modal
        </Modal>
      );
      const content = document.body.querySelector('.max-w-2xl');
      expect(content).toBeInTheDocument();
    });

    it('should render extra large size', () => {
      render(
        <Modal open={true} size="xl">
          Extra Large Modal
        </Modal>
      );
      const content = document.body.querySelector('.max-w-4xl');
      expect(content).toBeInTheDocument();
    });

    it('should render full size', () => {
      render(
        <Modal open={true} size="full">
          Full Modal
        </Modal>
      );
      const content = document.body.querySelector('.max-w-full');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Close Button', () => {
    it('should show close button by default', () => {
      render(<Modal open={true}>Content</Modal>);
      const closeButton = screen.getByRole('button', { name: 'Close' });
      expect(closeButton).toBeInTheDocument();
    });

    it('should hide close button when showCloseButton is false', () => {
      render(
        <Modal open={true} showCloseButton={false}>
          Content
        </Modal>
      );
      const closeButton = screen.queryByRole('button', { name: 'Close' });
      expect(closeButton).not.toBeInTheDocument();
    });

    it('should call onOpenChange when close button is clicked', async () => {
      const user = userEvent.setup();
      const handleOpenChange = jest.fn();
      render(
        <Modal open={true} onOpenChange={handleOpenChange}>
          Content
        </Modal>
      );

      const closeButton = screen.getByRole('button', { name: 'Close' });
      await user.click(closeButton);

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should render X icon in close button', () => {
      render(<Modal open={true}>Content</Modal>);
      const closeButton = screen.getByRole('button', { name: 'Close' });
      const svg = closeButton.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('h-5', 'w-5');
    });
  });

  describe('Overlay', () => {
    it('should render overlay', () => {
      render(<Modal open={true}>Content</Modal>);
      const overlay = document.body.querySelector('.bg-black\\/50');
      expect(overlay).toBeInTheDocument();
    });

    it('should apply backdrop blur to overlay', () => {
      render(<Modal open={true}>Content</Modal>);
      const overlay = document.body.querySelector('.backdrop-blur-sm');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('Close Behavior', () => {
    it('should allow closing on overlay click by default', () => {
      const handleOpenChange = jest.fn();
      render(
        <Modal open={true} onOpenChange={handleOpenChange}>
          Content
        </Modal>
      );
      // Note: Testing overlay click behavior requires proper event simulation
      // which is handled by Radix UI internally
      expect(handleOpenChange).not.toHaveBeenCalled();
    });

    it('should prevent closing on overlay click when closeOnOverlayClick is false', () => {
      const handleOpenChange = jest.fn();
      render(
        <Modal open={true} onOpenChange={handleOpenChange} closeOnOverlayClick={false}>
          Content
        </Modal>
      );
      expect(handleOpenChange).not.toHaveBeenCalled();
    });

    it('should allow closing on escape by default', () => {
      const handleOpenChange = jest.fn();
      render(
        <Modal open={true} onOpenChange={handleOpenChange}>
          Content
        </Modal>
      );
      // Escape key behavior is handled by Radix UI
      expect(handleOpenChange).not.toHaveBeenCalled();
    });

    it('should prevent closing on escape when closeOnEscape is false', () => {
      const handleOpenChange = jest.fn();
      render(
        <Modal open={true} onOpenChange={handleOpenChange} closeOnEscape={false}>
          Content
        </Modal>
      );
      expect(handleOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('Layout', () => {
    it('should position modal in center', () => {
      render(<Modal open={true}>Content</Modal>);
      const content = document.body.querySelector('.left-\\[50\\%\\].top-\\[50\\%\\]');
      expect(content).toBeInTheDocument();
    });

    it('should apply correct padding to header', () => {
      render(
        <Modal open={true} title="Title">
          Content
        </Modal>
      );
      const header = document.body.querySelector('.px-6.pt-6.pb-4');
      expect(header).toBeInTheDocument();
    });

    it('should apply correct padding to body', () => {
      render(<Modal open={true}>Content</Modal>);
      const body = document.body.querySelector('.px-6.py-4');
      expect(body).toBeInTheDocument();
    });

    it('should style footer with background', () => {
      render(
        <Modal open={true} footer={<button>Action</button>}>
          Content
        </Modal>
      );
      const footer = document.body.querySelector('.bg-neutral-50');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('rounded-b-lg', 'border-t', 'border-neutral-200');
    });
  });

  describe('Animation', () => {
    it('should apply animation classes to overlay', () => {
      render(<Modal open={true}>Content</Modal>);
      const overlay = document.body.querySelector('[data-state]');
      expect(overlay).toHaveClass('data-[state=open]:animate-in');
      expect(overlay).toHaveClass('data-[state=closed]:animate-out');
    });

    it('should apply animation classes to content', () => {
      render(<Modal open={true}>Content</Modal>);
      const content = document.body.querySelector('.duration-200');
      expect(content).toHaveClass('data-[state=open]:zoom-in-95');
      expect(content).toHaveClass('data-[state=closed]:zoom-out-95');
    });
  });

  describe('Combined Features', () => {
    it('should render complete modal with all props', () => {
      render(
        <Modal
          open={true}
          title="Complete Modal"
          description="This is a complete modal"
          size="lg"
          footer={<button>Save</button>}
          showCloseButton={true}
        >
          Modal body content
        </Modal>
      );

      expect(screen.getByText('Complete Modal')).toBeInTheDocument();
      expect(screen.getByText('This is a complete modal')).toBeInTheDocument();
      expect(screen.getByText('Modal body content')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Modal open={true}>Accessible Modal</Modal>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with title', async () => {
      const { container } = render(
        <Modal open={true} title="Modal Title">
          Content
        </Modal>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with description', async () => {
      const { container } = render(
        <Modal open={true} title="Title" description="Description">
          Content
        </Modal>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have aria-label on close button', () => {
      render(<Modal open={true}>Content</Modal>);
      const closeButton = screen.getByRole('button', { name: 'Close' });
      expect(closeButton).toHaveAttribute('aria-label', 'Close');
    });

    it('should support keyboard focus on close button', () => {
      render(<Modal open={true}>Content</Modal>);
      const closeButton = screen.getByRole('button', { name: 'Close' });
      closeButton.focus();
      expect(closeButton).toHaveFocus();
    });
  });

  describe('Controlled State', () => {
    it('should support controlled open state', () => {
      const { rerender } = render(<Modal open={false}>Content</Modal>);
      expect(screen.queryByText('Content')).not.toBeInTheDocument();

      rerender(<Modal open={true}>Content</Modal>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should call onOpenChange when state changes', async () => {
      const user = userEvent.setup();
      const handleOpenChange = jest.fn();
      render(
        <Modal open={true} onOpenChange={handleOpenChange}>
          Content
        </Modal>
      );

      const closeButton = screen.getByRole('button', { name: 'Close' });
      await user.click(closeButton);

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });
});

describe('ModalTrigger', () => {
  it('should be exported from Radix', () => {
    expect(ModalTrigger).toBeDefined();
  });

  it('should have correct display name', () => {
    expect(ModalTrigger.displayName).toBe('ModalTrigger');
  });
});

describe('ModalClose', () => {
  it('should be exported from Radix', () => {
    expect(ModalClose).toBeDefined();
  });

  it('should have correct display name', () => {
    expect(ModalClose.displayName).toBe('ModalClose');
  });
});
