import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Toggle } from './Toggle';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Toggle', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Toggle />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Toggle label="Enable notifications" />);
      expect(screen.getByText('Enable notifications')).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      render(
        <Toggle
          label="Dark mode"
          helperText="Switch to dark theme"
        />
      );
      expect(screen.getByText('Switch to dark theme')).toBeInTheDocument();
    });

    it('renders without label', () => {
      render(<Toggle aria-label="Toggle feature" />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      render(<Toggle size="sm" />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveClass('h-5', 'w-9');
    });

    it('renders medium size (default)', () => {
      render(<Toggle size="md" />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveClass('h-6', 'w-11');
    });

    it('renders large size', () => {
      render(<Toggle size="lg" />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveClass('h-7', 'w-14');
    });
  });

  describe('States', () => {
    it('handles checked state', () => {
      render(<Toggle checked />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('data-state', 'checked');
    });

    it('handles unchecked state', () => {
      render(<Toggle checked={false} />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('data-state', 'unchecked');
    });

    it('handles disabled state', () => {
      render(<Toggle disabled />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeDisabled();
      expect(toggle).toHaveClass('disabled:opacity-50');
    });

    it('applies disabled styles to label', () => {
      render(<Toggle label="Toggle" disabled />);
      const label = screen.getByText('Toggle');
      expect(label).toHaveClass('text-neutral-400');
    });
  });

  describe('Interactions', () => {
    it('toggles when clicked', async () => {
      const user = userEvent.setup();
      render(<Toggle />);
      const toggle = screen.getByRole('switch');

      expect(toggle).toHaveAttribute('data-state', 'unchecked');

      await user.click(toggle);
      expect(toggle).toHaveAttribute('data-state', 'checked');

      await user.click(toggle);
      expect(toggle).toHaveAttribute('data-state', 'unchecked');
    });

    it('calls onCheckedChange when toggled', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<Toggle onCheckedChange={handleChange} />);
      const toggle = screen.getByRole('switch');

      await user.click(toggle);
      expect(handleChange).toHaveBeenCalledWith(true);

      await user.click(toggle);
      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it('does not toggle when disabled', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<Toggle disabled onCheckedChange={handleChange} />);
      const toggle = screen.getByRole('switch');

      await user.click(toggle);
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('supports keyboard activation with Space', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<Toggle onCheckedChange={handleChange} />);
      const toggle = screen.getByRole('switch');

      toggle.focus();
      await user.keyboard(' ');
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('supports keyboard activation with Enter', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<Toggle onCheckedChange={handleChange} />);
      const toggle = screen.getByRole('switch');

      toggle.focus();
      await user.keyboard('{Enter}');
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('clicking label toggles the switch', async () => {
      const user = userEvent.setup();
      render(<Toggle label="Toggle me" />);

      const toggle = screen.getByRole('switch');
      const label = screen.getByText('Toggle me');

      expect(toggle).toHaveAttribute('data-state', 'unchecked');

      await user.click(label);
      expect(toggle).toHaveAttribute('data-state', 'checked');
    });
  });

  describe('Controlled/Uncontrolled', () => {
    it('supports controlled checked value', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      const { rerender } = render(
        <Toggle checked={false} onCheckedChange={handleChange} />
      );
      const toggle = screen.getByRole('switch');

      expect(toggle).toHaveAttribute('data-state', 'unchecked');

      await user.click(toggle);
      expect(handleChange).toHaveBeenCalledWith(true);

      rerender(<Toggle checked={true} onCheckedChange={handleChange} />);
      expect(toggle).toHaveAttribute('data-state', 'checked');
    });

    it('supports defaultChecked', () => {
      render(<Toggle defaultChecked />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('data-state', 'checked');
    });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Toggle label="Enable feature" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations (disabled)', async () => {
      const { container } = render(<Toggle label="Feature" disabled />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations (without label)', async () => {
      const { container } = render(<Toggle aria-label="Toggle feature" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('associates label with toggle using htmlFor', () => {
      render(<Toggle label="Feature" id="feature-toggle" />);
      const label = screen.getByText('Feature');
      expect(label).toHaveAttribute('for', 'feature-toggle');
    });

    it('generates unique IDs when not provided', () => {
      render(
        <>
          <Toggle label="Toggle 1" />
          <Toggle label="Toggle 2" />
        </>
      );

      const toggle1 = screen.getByLabelText('Toggle 1');
      const toggle2 = screen.getByLabelText('Toggle 2');

      expect(toggle1.id).toBeTruthy();
      expect(toggle2.id).toBeTruthy();
      expect(toggle1.id).not.toBe(toggle2.id);
    });

    it('has proper ARIA attributes', () => {
      render(<Toggle label="Feature" />);
      const toggle = screen.getByRole('switch');

      expect(toggle).toHaveAttribute('role', 'switch');
      expect(toggle).toHaveAttribute('aria-checked');
    });
  });

  describe('Custom styling', () => {
    it('applies custom className to switch root', () => {
      render(<Toggle className="custom-toggle" />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveClass('custom-toggle');
    });
  });
});
