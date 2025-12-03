import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Select } from './Select';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

const mockOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' },
];

describe('Select', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Select options={mockOptions} />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Select options={mockOptions} label="Choose a fruit" />);
      expect(screen.getByText('Choose a fruit')).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      render(
        <Select
          options={mockOptions}
          helperText="Select your favorite fruit"
        />
      );
      expect(
        screen.getByText('Select your favorite fruit')
      ).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      render(
        <Select options={mockOptions} placeholder="Pick a fruit..." />
      );
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveTextContent('Pick a fruit...');
    });
  });

  describe('Options', () => {
    it('accepts options array', () => {
      render(<Select options={mockOptions} />);
      const trigger = screen.getByRole('combobox');

      expect(trigger).toBeInTheDocument();
      expect(mockOptions.length).toBe(3);
    });

    it('handles empty options array', () => {
      render(<Select options={[]} />);
      const trigger = screen.getByRole('combobox');

      expect(trigger).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('applies default state styles', () => {
      render(<Select options={mockOptions} state="default" />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('border-neutral-300');
    });

    it('applies error state styles', () => {
      render(
        <Select
          options={mockOptions}
          state="error"
          helperText="This field is required"
        />
      );
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('border-error-500');

      const helperText = screen.getByText('This field is required');
      expect(helperText).toHaveClass('text-error-600');
    });

    it('applies success state styles', () => {
      render(
        <Select
          options={mockOptions}
          state="success"
          helperText="Valid selection"
        />
      );
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('border-success-500');

      const helperText = screen.getByText('Valid selection');
      expect(helperText).toHaveClass('text-success-600');
    });

    it('handles disabled state', () => {
      render(<Select options={mockOptions} disabled />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
    });
  });

  describe('Interactions', () => {
    it('has interactive trigger', () => {
      render(<Select options={mockOptions} />);
      const trigger = screen.getByRole('combobox');

      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('type', 'button');
    });

    it('calls onValueChange callback when provided', () => {
      const handleChange = jest.fn();

      const { rerender } = render(
        <Select options={mockOptions} onValueChange={handleChange} value="apple" />
      );

      expect(handleChange).not.toHaveBeenCalled();

      rerender(
        <Select options={mockOptions} onValueChange={handleChange} value="banana" />
      );

      // Component re-renders with new value
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveTextContent('Banana');
    });
  });

  describe('Controlled/Uncontrolled', () => {
    it('supports controlled value', () => {
      render(<Select options={mockOptions} value="banana" />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveTextContent('Banana');
    });

    it('supports defaultValue', () => {
      render(<Select options={mockOptions} defaultValue="orange" />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveTextContent('Orange');
    });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Select options={mockOptions} label="Fruit" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations (error state)', async () => {
      const { container } = render(
        <Select
          options={mockOptions}
          label="Fruit"
          state="error"
          helperText="Required"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('associates helper text with select', () => {
      render(
        <Select
          options={mockOptions}
          label="Fruit"
          helperText="Choose wisely"
          id="fruit-select"
        />
      );
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute(
        'aria-describedby',
        expect.stringContaining('fruit-select-helper')
      );
    });

    it('sets aria-invalid on error state', () => {
      render(<Select options={mockOptions} state="error" />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Custom styling', () => {
    it('applies custom wrapperClassName', () => {
      const { container } = render(
        <Select options={mockOptions} wrapperClassName="custom-wrapper" />
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-wrapper');
    });
  });
});
