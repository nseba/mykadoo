import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Badge } from './Badge';

expect.extend(toHaveNoViolations);

describe('Badge', () => {
  describe('Rendering', () => {
    it('should render with children', () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('should render with default variant', () => {
      const { container } = render(<Badge>Default</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-neutral-100', 'text-neutral-800');
    });

    it('should apply custom className', () => {
      const { container } = render(<Badge className="custom-class">Badge</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it('should render primary variant', () => {
      const { container } = render(<Badge variant="primary">Primary</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-primary-100', 'text-primary-800');
    });

    it('should render secondary variant', () => {
      const { container } = render(<Badge variant="secondary">Secondary</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-secondary-100', 'text-secondary-800');
    });

    it('should render success variant', () => {
      const { container } = render(<Badge variant="success">Success</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-success-100', 'text-success-800');
    });

    it('should render warning variant', () => {
      const { container } = render(<Badge variant="warning">Warning</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-warning-100', 'text-warning-800');
    });

    it('should render error variant', () => {
      const { container } = render(<Badge variant="error">Error</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-error-100', 'text-error-800');
    });

    it('should render info variant', () => {
      const { container } = render(<Badge variant="info">Info</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-info-100', 'text-info-800');
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      const { container } = render(<Badge size="sm">Small</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs');
    });

    it('should render medium size by default', () => {
      const { container } = render(<Badge>Medium</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('px-2.5', 'py-1', 'text-sm');
    });

    it('should render large size', () => {
      const { container } = render(<Badge size="lg">Large</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('px-3', 'py-1.5', 'text-base');
    });
  });

  describe('Dot Indicator', () => {
    it('should not render dot by default', () => {
      const { container } = render(<Badge>No Dot</Badge>);
      const dots = container.querySelectorAll('.h-1\\.5.w-1\\.5.rounded-full');
      expect(dots).toHaveLength(0);
    });

    it('should render dot when dot prop is true', () => {
      const { container } = render(<Badge dot>With Dot</Badge>);
      const dots = container.querySelectorAll('.h-1\\.5.w-1\\.5.rounded-full');
      expect(dots).toHaveLength(1);
    });

    it('should render primary colored dot with primary variant', () => {
      const { container } = render(
        <Badge variant="primary" dot>
          Primary Dot
        </Badge>
      );
      const dot = container.querySelector('.bg-primary-600');
      expect(dot).toBeInTheDocument();
    });

    it('should render success colored dot with success variant', () => {
      const { container } = render(
        <Badge variant="success" dot>
          Success Dot
        </Badge>
      );
      const dot = container.querySelector('.bg-success-600');
      expect(dot).toBeInTheDocument();
    });
  });

  describe('Removable Badge', () => {
    it('should not render remove button by default', () => {
      render(<Badge>Not Removable</Badge>);
      const removeButton = screen.queryByRole('button', { name: /remove/i });
      expect(removeButton).not.toBeInTheDocument();
    });

    it('should render remove button when onRemove is provided', () => {
      const handleRemove = jest.fn();
      render(<Badge onRemove={handleRemove}>Removable</Badge>);
      const removeButton = screen.getByRole('button', { name: /remove/i });
      expect(removeButton).toBeInTheDocument();
    });

    it('should call onRemove when remove button is clicked', async () => {
      const user = userEvent.setup();
      const handleRemove = jest.fn();
      render(<Badge onRemove={handleRemove}>Removable</Badge>);

      const removeButton = screen.getByRole('button', { name: /remove/i });
      await user.click(removeButton);

      expect(handleRemove).toHaveBeenCalledTimes(1);
    });

    it('should render X icon in remove button', () => {
      const handleRemove = jest.fn();
      const { container } = render(<Badge onRemove={handleRemove}>Remove</Badge>);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('h-3', 'w-3');
    });
  });

  describe('Combined Features', () => {
    it('should render badge with dot and remove button', () => {
      const handleRemove = jest.fn();
      const { container } = render(
        <Badge variant="success" size="lg" dot onRemove={handleRemove}>
          Complete
        </Badge>
      );

      // Check variant
      expect(container.firstChild).toHaveClass('bg-success-100');

      // Check size
      expect(container.firstChild).toHaveClass('text-base');

      // Check dot
      const dot = container.querySelector('.bg-success-600');
      expect(dot).toBeInTheDocument();

      // Check remove button
      const removeButton = screen.getByRole('button', { name: /remove/i });
      expect(removeButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Badge>Accessible</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with remove button', async () => {
      const { container } = render(<Badge onRemove={() => {}}>Removable</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have aria-label on remove button', () => {
      render(<Badge onRemove={() => {}}>Remove Me</Badge>);
      const removeButton = screen.getByRole('button', { name: /remove/i });
      expect(removeButton).toHaveAttribute('aria-label', 'Remove');
    });

    it('should support keyboard focus on remove button', () => {
      render(<Badge onRemove={() => {}}>Focus Test</Badge>);
      const removeButton = screen.getByRole('button', { name: /remove/i });
      removeButton.focus();
      expect(removeButton).toHaveFocus();
    });
  });

  describe('HTML Attributes', () => {
    it('should forward ref to span element', () => {
      const ref = React.createRef<HTMLSpanElement>();
      render(<Badge ref={ref}>Ref Test</Badge>);
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });

    it('should spread additional props', () => {
      render(<Badge data-testid="badge-test">Props Test</Badge>);
      expect(screen.getByTestId('badge-test')).toBeInTheDocument();
    });

    it('should support onClick handler', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      const { container } = render(<Badge onClick={handleClick}>Clickable</Badge>);

      const badge = container.firstChild as HTMLElement;
      await user.click(badge);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
