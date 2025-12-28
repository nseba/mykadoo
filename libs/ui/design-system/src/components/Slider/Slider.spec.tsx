import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Slider } from './Slider';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Slider', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Slider />);
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Slider label="Volume" />);
      expect(screen.getByText('Volume')).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      render(<Slider helperText="Adjust the volume level" />);
      expect(
        screen.getByText('Adjust the volume level')
      ).toBeInTheDocument();
    });

    it('renders single thumb by default', () => {
      render(<Slider />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders).toHaveLength(1);
    });

    it('renders multiple thumbs for range values', () => {
      render(<Slider defaultValue={[25, 75]} />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders).toHaveLength(2);
    });
  });

  describe('Value display', () => {
    it('does not show value by default', () => {
      render(<Slider defaultValue={[50]} />);
      expect(screen.queryByText('50')).not.toBeInTheDocument();
    });

    it('shows value when showValue is true', () => {
      render(<Slider defaultValue={[50]} showValue />);
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('formats value using custom formatValue function', () => {
      const formatValue = (value: number) => `${value}%`;
      render(<Slider defaultValue={[75]} showValue formatValue={formatValue} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('displays range values correctly', () => {
      render(<Slider defaultValue={[25, 75]} showValue />);
      expect(screen.getByText('25 - 75')).toBeInTheDocument();
    });

    it('formats range values using custom formatValue', () => {
      const formatValue = (value: number) => `${value}°C`;
      render(
        <Slider
          defaultValue={[20, 30]}
          showValue
          formatValue={formatValue}
        />
      );
      expect(screen.getByText('20°C - 30°C')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Slider disabled />);
      const slider = screen.getByRole('slider');
      // Radix Slider uses data-disabled attribute instead of HTML disabled
      expect(slider).toHaveAttribute('data-disabled');
    });

    it('applies disabled styles to label', () => {
      render(<Slider label="Volume" disabled />);
      const label = screen.getByText('Volume');
      expect(label).toHaveClass('text-neutral-400');
    });

    it('applies disabled opacity to track', () => {
      const { container } = render(<Slider disabled />);
      const track = container.querySelector('[data-disabled]');
      // When disabled, opacity-50 is applied directly (not as pseudo-class)
      expect(track).toHaveClass('opacity-50');
    });
  });

  describe('Interactions', () => {
    it('calls onValueChange when value changes', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<Slider defaultValue={[50]} onValueChange={handleChange} />);
      const slider = screen.getByRole('slider');

      // Simulate keyboard interaction
      slider.focus();
      await user.keyboard('{ArrowRight}');

      expect(handleChange).toHaveBeenCalled();
      const callArgs = handleChange.mock.calls[0][0];
      expect(callArgs[0]).toBeGreaterThan(50);
    });

    it('does not call onValueChange when disabled', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(
        <Slider defaultValue={[50]} onValueChange={handleChange} disabled />
      );
      const slider = screen.getByRole('slider');

      slider.focus();
      await user.keyboard('{ArrowRight}');

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('supports keyboard navigation - increase value', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<Slider defaultValue={[50]} onValueChange={handleChange} />);
      const slider = screen.getByRole('slider');

      slider.focus();
      await user.keyboard('{ArrowRight}');

      const newValue = handleChange.mock.calls[0][0][0];
      expect(newValue).toBeGreaterThan(50);
    });

    it('supports keyboard navigation - decrease value', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<Slider defaultValue={[50]} onValueChange={handleChange} />);
      const slider = screen.getByRole('slider');

      slider.focus();
      await user.keyboard('{ArrowLeft}');

      const newValue = handleChange.mock.calls[0][0][0];
      expect(newValue).toBeLessThan(50);
    });

    it('supports Home key to set minimum', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(
        <Slider defaultValue={[50]} min={0} max={100} onValueChange={handleChange} />
      );
      const slider = screen.getByRole('slider');

      slider.focus();
      await user.keyboard('{Home}');

      const newValue = handleChange.mock.calls[0][0][0];
      expect(newValue).toBe(0);
    });

    it('supports End key to set maximum', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(
        <Slider defaultValue={[50]} min={0} max={100} onValueChange={handleChange} />
      );
      const slider = screen.getByRole('slider');

      slider.focus();
      await user.keyboard('{End}');

      const newValue = handleChange.mock.calls[0][0][0];
      expect(newValue).toBe(100);
    });
  });

  describe('Controlled/Uncontrolled', () => {
    it('supports controlled value', () => {
      render(<Slider value={[75]} showValue />);
      expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('supports defaultValue', () => {
      render(<Slider defaultValue={[60]} showValue />);
      expect(screen.getByText('60')).toBeInTheDocument();
    });

    it('updates displayed value in controlled mode', () => {
      const { rerender } = render(<Slider value={[50]} showValue />);
      expect(screen.getByText('50')).toBeInTheDocument();

      rerender(<Slider value={[80]} showValue />);
      expect(screen.getByText('80')).toBeInTheDocument();
    });
  });

  describe('Range configuration', () => {
    it('respects min and max values', () => {
      render(<Slider min={10} max={90} defaultValue={[50]} />);
      const slider = screen.getByRole('slider');

      expect(slider).toHaveAttribute('aria-valuemin', '10');
      expect(slider).toHaveAttribute('aria-valuemax', '90');
    });

    it('respects step value', () => {
      render(<Slider step={10} defaultValue={[50]} showValue />);
      expect(screen.getByText('50')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Slider label="Volume" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations (disabled)', async () => {
      const { container } = render(<Slider label="Volume" disabled />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations (range)', async () => {
      const { container } = render(
        <Slider label="Price range" defaultValue={[25, 75]} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper ARIA attributes', () => {
      render(<Slider defaultValue={[50]} min={0} max={100} />);
      const slider = screen.getByRole('slider');

      expect(slider).toHaveAttribute('role', 'slider');
      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '100');
      expect(slider).toHaveAttribute('aria-valuenow', '50');
    });

    it('associates label with slider', () => {
      render(<Slider label="Volume" id="volume-slider" />);
      const label = screen.getByText('Volume');
      expect(label).toHaveAttribute('for', 'volume-slider');
    });

    it('generates unique IDs when not provided', () => {
      const { container } = render(
        <>
          <Slider label="Slider 1" />
          <Slider label="Slider 2" />
        </>
      );

      // Radix Slider applies ID to the root, not the thumb
      // Check that labels have unique htmlFor attributes
      const labels = container.querySelectorAll('label');
      const htmlFor1 = labels[0]?.getAttribute('for');
      const htmlFor2 = labels[1]?.getAttribute('for');

      expect(htmlFor1).toBeTruthy();
      expect(htmlFor2).toBeTruthy();
      expect(htmlFor1).not.toBe(htmlFor2);
    });
  });

  describe('Custom styling', () => {
    it('applies custom className to slider root', () => {
      const { container } = render(<Slider className="custom-slider" />);
      // className is applied to the Radix Slider root element
      const sliderRoot = container.querySelector('.custom-slider');
      expect(sliderRoot).toBeInTheDocument();
    });
  });
});
