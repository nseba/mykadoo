import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Input } from './Input';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Input', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter text..." />);
      const input = screen.getByPlaceholderText('Enter text...');
      expect(input).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Input label="Email" />);
      const label = screen.getByText('Email');
      expect(label).toBeInTheDocument();
      expect(label.tagName).toBe('LABEL');
    });

    it('renders with helper text', () => {
      render(<Input helperText="Enter your email address" />);
      expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('renders default state', () => {
      render(<Input state="default" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-neutral-300');
    });

    it('renders error state', () => {
      render(<Input state="error" helperText="This field is required" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-error-500');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      const helperText = screen.getByText('This field is required');
      expect(helperText).toHaveClass('text-error-600');
    });

    it('renders success state', () => {
      render(<Input state="success" helperText="Looks good!" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-success-500');
      const helperText = screen.getByText('Looks good!');
      expect(helperText).toHaveClass('text-success-600');
    });
  });

  describe('Icons', () => {
    it('renders left icon', () => {
      render(
        <Input
          leftIcon={<span data-testid="left-icon">L</span>}
          label="Search"
        />
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders right icon', () => {
      render(
        <Input
          rightIcon={<span data-testid="right-icon">R</span>}
          label="Password"
        />
      );
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('renders both icons', () => {
      render(
        <Input
          leftIcon={<span data-testid="left-icon">L</span>}
          rightIcon={<span data-testid="right-icon">R</span>}
          label="Username"
        />
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('applies correct spacing for left icon', () => {
      render(<Input leftIcon={<span>L</span>} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pl-10');
    });

    it('applies correct spacing for right icon', () => {
      render(<Input rightIcon={<span>R</span>} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pr-10');
    });
  });

  describe('Label and ID association', () => {
    it('associates label with input via htmlFor', () => {
      render(<Input label="Email" id="email-input" />);
      const label = screen.getByText('Email');
      const input = screen.getByRole('textbox');
      expect(label).toHaveAttribute('for', 'email-input');
      expect(input).toHaveAttribute('id', 'email-input');
    });

    it('generates unique ID when not provided', () => {
      render(<Input label="Email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id');
      expect(input.getAttribute('id')).toBeTruthy();
    });

    it('associates helper text with input via aria-describedby', () => {
      render(<Input helperText="Enter valid email" id="email" />);
      const input = screen.getByRole('textbox');
      const helperTextId = input.getAttribute('aria-describedby');
      expect(helperTextId).toBe('email-helper');
      const helperText = screen.getByText('Enter valid email');
      expect(helperText).toHaveAttribute('id', helperTextId);
    });
  });

  describe('Disabled state', () => {
    it('handles disabled state', () => {
      render(<Input disabled label="Disabled" />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:bg-neutral-100');
    });

    it('renders disabled label with correct styling', () => {
      render(<Input disabled label="Disabled Field" />);
      const label = screen.getByText('Disabled Field');
      expect(label).toHaveClass('text-neutral-400');
    });
  });

  describe('Interactions', () => {
    it('calls onChange when typing', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<Input onChange={handleChange} label="Name" />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'John');
      expect(handleChange).toHaveBeenCalledTimes(4); // Once per character
    });

    it('does not call onChange when disabled', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<Input onChange={handleChange} disabled />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'test');
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('supports controlled value', () => {
      const { rerender } = render(<Input value="initial" onChange={() => {}} />);
      let input = screen.getByRole('textbox');
      expect(input).toHaveValue('initial');

      rerender(<Input value="updated" onChange={() => {}} />);
      input = screen.getByRole('textbox');
      expect(input).toHaveValue('updated');
    });

    it('supports focus and blur', async () => {
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();
      const user = userEvent.setup();

      render(<Input onFocus={handleFocus} onBlur={handleBlur} label="Test" />);
      const input = screen.getByRole('textbox');

      await user.click(input);
      expect(handleFocus).toHaveBeenCalledTimes(1);

      await user.tab();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Input types', () => {
    it('supports email type', () => {
      render(<Input type="email" label="Email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('supports password type', () => {
      render(<Input type="password" label="Password" />);
      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('supports tel type', () => {
      render(<Input type="tel" label="Phone" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'tel');
    });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations (default)', async () => {
      const { container } = render(<Input label="Name" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations (with helper text)', async () => {
      const { container } = render(
        <Input label="Email" helperText="Enter your email" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations (error state)', async () => {
      const { container } = render(
        <Input
          label="Password"
          state="error"
          helperText="Password is required"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations (disabled)', async () => {
      const { container } = render(<Input label="Disabled" disabled />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('supports required attribute', () => {
      render(<Input label="Required Field" required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('supports aria-label', () => {
      render(<Input aria-label="Search input" />);
      const input = screen.getByRole('textbox', { name: /search input/i });
      expect(input).toBeInTheDocument();
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.tagName).toBe('INPUT');
    });
  });

  describe('Wrapper className', () => {
    it('applies wrapperClassName to wrapper div', () => {
      const { container } = render(
        <Input wrapperClassName="custom-wrapper" label="Test" />
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-wrapper');
      expect(wrapper).toHaveClass('w-full');
    });
  });
});
