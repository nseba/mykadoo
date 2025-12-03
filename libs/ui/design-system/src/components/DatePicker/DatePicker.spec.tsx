import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { DatePicker } from './DatePicker';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Helper to get date input since HTML date inputs don't have textbox role
const getDateInput = (container: HTMLElement) =>
  container.querySelector('input[type="date"]') as HTMLInputElement;

describe('DatePicker', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      const { container } = render(<DatePicker />);
      const input = container.querySelector('input[type="date"]');
      expect(input).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<DatePicker label="Birth Date" />);
      expect(screen.getByText('Birth Date')).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      render(<DatePicker helperText="Select your birth date" />);
      expect(screen.getByText('Select your birth date')).toBeInTheDocument();
    });

    it('renders calendar icon', () => {
      const { container } = render(<DatePicker />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('applies default state styles', () => {
      render(<DatePicker state="default" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-neutral-300');
    });

    it('applies error state styles', () => {
      render(
        <DatePicker
          state="error"
          helperText="Please select a valid date"
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-error-500');

      const helperText = screen.getByText('Please select a valid date');
      expect(helperText).toHaveClass('text-error-600');
    });

    it('applies success state styles', () => {
      render(
        <DatePicker state="success" helperText="Date is valid" />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-success-500');

      const helperText = screen.getByText('Date is valid');
      expect(helperText).toHaveClass('text-success-600');
    });

    it('handles disabled state', () => {
      render(<DatePicker disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:bg-neutral-100');
    });

    it('applies disabled styles to label', () => {
      render(<DatePicker label="Date" disabled />);
      const label = screen.getByText('Date');
      expect(label).toHaveClass('text-neutral-400');
    });
  });

  describe('Date constraints', () => {
    it('sets min attribute', () => {
      render(<DatePicker min="2024-01-01" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('min', '2024-01-01');
    });

    it('sets max attribute', () => {
      render(<DatePicker max="2024-12-31" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('max', '2024-12-31');
    });

    it('sets both min and max attributes', () => {
      render(<DatePicker min="2024-01-01" max="2024-12-31" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('min', '2024-01-01');
      expect(input).toHaveAttribute('max', '2024-12-31');
    });
  });

  describe('Interactions', () => {
    it('calls onChange when date is selected', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<DatePicker onChange={handleChange} />);
      const input = screen.getByRole('textbox');

      await user.type(input, '2024-03-15');

      expect(handleChange).toHaveBeenCalled();
    });

    it('does not call onChange when disabled', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<DatePicker disabled onChange={handleChange} />);
      const input = screen.getByRole('textbox');

      await user.type(input, '2024-03-15');

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('allows clearing the date value', async () => {
      const user = userEvent.setup();

      render(<DatePicker defaultValue="2024-03-15" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;

      expect(input.value).toBe('2024-03-15');

      await user.clear(input);

      expect(input.value).toBe('');
    });
  });

  describe('Controlled/Uncontrolled', () => {
    it('supports controlled value', () => {
      render(<DatePicker value="2024-03-15" onChange={() => {}} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('2024-03-15');
    });

    it('supports defaultValue', () => {
      render(<DatePicker defaultValue="2024-03-15" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('2024-03-15');
    });

    it('updates value in controlled mode', () => {
      const { rerender } = render(
        <DatePicker value="2024-03-15" onChange={() => {}} />
      );
      let input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('2024-03-15');

      rerender(<DatePicker value="2024-04-20" onChange={() => {}} />);
      input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('2024-04-20');
    });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<DatePicker label="Birth Date" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations (error state)', async () => {
      const { container } = render(
        <DatePicker
          label="Date"
          state="error"
          helperText="Required field"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations (disabled)', async () => {
      const { container } = render(<DatePicker label="Date" disabled />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('associates label with input', () => {
      render(<DatePicker label="Birth Date" id="birth-date" />);
      const label = screen.getByText('Birth Date');
      const input = screen.getByRole('textbox');

      expect(label).toHaveAttribute('for', 'birth-date');
      expect(input).toHaveAttribute('id', 'birth-date');
    });

    it('associates helper text with input', () => {
      render(
        <DatePicker
          label="Date"
          helperText="Select a date"
          id="date-input"
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute(
        'aria-describedby',
        'date-input-helper'
      );
    });

    it('sets aria-invalid on error state', () => {
      render(<DatePicker state="error" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('generates unique IDs when not provided', () => {
      render(
        <>
          <DatePicker label="Date 1" />
          <DatePicker label="Date 2" />
        </>
      );

      const input1 = screen.getByLabelText('Date 1');
      const input2 = screen.getByLabelText('Date 2');

      expect(input1.id).toBeTruthy();
      expect(input2.id).toBeTruthy();
      expect(input1.id).not.toBe(input2.id);
    });
  });

  describe('Required field', () => {
    it('sets required attribute', () => {
      render(<DatePicker required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });
  });

  describe('Custom styling', () => {
    it('applies custom className to input', () => {
      render(<DatePicker className="custom-date-picker" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-date-picker');
    });

    it('applies custom wrapperClassName', () => {
      const { container } = render(
        <DatePicker wrapperClassName="custom-wrapper" />
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-wrapper');
    });
  });

  describe('Placeholder', () => {
    it('renders with placeholder', () => {
      render(<DatePicker placeholder="YYYY-MM-DD" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'YYYY-MM-DD');
    });
  });
});
