import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Heart, Search, User, Gift, ShoppingCart } from 'lucide-react';
import { Icon } from './Icon';

expect.extend(toHaveNoViolations);

describe('Icon', () => {
  describe('Rendering', () => {
    it('should render icon component', () => {
      const { container } = render(<Icon icon={Heart} data-testid="heart-icon" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render different icon types', () => {
      const { container: container1 } = render(<Icon icon={Search} />);
      const { container: container2 } = render(<Icon icon={User} />);

      expect(container1.querySelector('svg')).toBeInTheDocument();
      expect(container2.querySelector('svg')).toBeInTheDocument();
    });

    it('should apply default size and color', () => {
      const { container } = render(<Icon icon={Heart} />);
      const svg = container.querySelector('svg') as SVGElement;

      expect(svg).toHaveAttribute('width', '20');
      expect(svg).toHaveAttribute('height', '20');
    });
  });

  describe('Sizes', () => {
    it('should render xs size (12px)', () => {
      const { container } = render(<Icon icon={Heart} size="xs" />);
      const svg = container.querySelector('svg') as SVGElement;

      expect(svg).toHaveAttribute('width', '12');
      expect(svg).toHaveAttribute('height', '12');
    });

    it('should render sm size (16px)', () => {
      const { container } = render(<Icon icon={Heart} size="sm" />);
      const svg = container.querySelector('svg') as SVGElement;

      expect(svg).toHaveAttribute('width', '16');
      expect(svg).toHaveAttribute('height', '16');
    });

    it('should render md size by default (20px)', () => {
      const { container } = render(<Icon icon={Heart} />);
      const svg = container.querySelector('svg') as SVGElement;

      expect(svg).toHaveAttribute('width', '20');
      expect(svg).toHaveAttribute('height', '20');
    });

    it('should render lg size (24px)', () => {
      const { container } = render(<Icon icon={Heart} size="lg" />);
      const svg = container.querySelector('svg') as SVGElement;

      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
    });

    it('should render xl size (32px)', () => {
      const { container } = render(<Icon icon={Heart} size="xl" />);
      const svg = container.querySelector('svg') as SVGElement;

      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });
  });

  describe('Colors', () => {
    it('should use current color by default', () => {
      const { container } = render(<Icon icon={Heart} />);
      const svg = container.querySelector('svg') as SVGElement;

      expect(svg).not.toHaveClass('text-primary-600');
      expect(svg).not.toHaveClass('text-secondary-600');
    });

    it('should apply primary color', () => {
      const { container } = render(<Icon icon={Heart} color="primary" />);
      const svg = container.querySelector('svg') as SVGElement;

      expect(svg).toHaveClass('text-primary-600');
    });

    it('should apply secondary color', () => {
      const { container } = render(<Icon icon={Heart} color="secondary" />);
      const svg = container.querySelector('svg') as SVGElement;

      expect(svg).toHaveClass('text-secondary-600');
    });

    it('should apply success color', () => {
      const { container } = render(<Icon icon={Heart} color="success" />);
      const svg = container.querySelector('svg') as SVGElement;

      expect(svg).toHaveClass('text-success-600');
    });

    it('should apply warning color', () => {
      const { container } = render(<Icon icon={Heart} color="warning" />);
      const svg = container.querySelector('svg') as SVGElement;

      expect(svg).toHaveClass('text-warning-600');
    });

    it('should apply error color', () => {
      const { container } = render(<Icon icon={Heart} color="error" />);
      const svg = container.querySelector('svg') as SVGElement;

      expect(svg).toHaveClass('text-error-600');
    });

    it('should apply neutral color', () => {
      const { container } = render(<Icon icon={Heart} color="neutral" />);
      const svg = container.querySelector('svg') as SVGElement;

      expect(svg).toHaveClass('text-neutral-600');
    });
  });

  describe('Lucide Props', () => {
    it('should accept strokeWidth prop', () => {
      const { container } = render(<Icon icon={Heart} strokeWidth={3} />);
      const svg = container.querySelector('svg') as SVGElement;

      expect(svg).toHaveAttribute('stroke-width', '3');
    });

    it('should accept fill prop', () => {
      const { container } = render(<Icon icon={Heart} fill="red" />);
      const svg = container.querySelector('svg') as SVGElement;

      expect(svg).toHaveAttribute('fill', 'red');
    });

    it('should accept absoluteStrokeWidth prop', () => {
      const { container } = render(<Icon icon={Heart} absoluteStrokeWidth />);
      const svg = container.querySelector('svg') as SVGElement;

      expect(svg).toBeInTheDocument();
    });
  });

  describe('Common Icon Patterns', () => {
    it('should render search icon', () => {
      const { container } = render(<Icon icon={Search} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render user icon', () => {
      const { container } = render(<Icon icon={User} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render gift icon', () => {
      const { container } = render(<Icon icon={Gift} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render shopping cart icon', () => {
      const { container } = render(<Icon icon={ShoppingCart} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Combined Props', () => {
    it('should apply size and color together', () => {
      const { container } = render(<Icon icon={Heart} size="lg" color="primary" />);
      const svg = container.querySelector('svg') as SVGElement;

      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
      expect(svg).toHaveClass('text-primary-600');
    });

    it('should apply custom className with color', () => {
      const { container } = render(<Icon icon={Heart} color="primary" className="custom-icon" />);
      const svg = container.querySelector('svg') as SVGElement;

      expect(svg).toHaveClass('text-primary-600', 'custom-icon');
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Icon icon={Heart} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with aria-label', async () => {
      const { container } = render(<Icon icon={Heart} aria-label="Favorite" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should accept aria-label prop', () => {
      const { container } = render(<Icon icon={Heart} aria-label="Favorite" />);
      const svg = container.querySelector('svg') as SVGElement;

      expect(svg).toHaveAttribute('aria-label', 'Favorite');
    });

    it('should accept aria-hidden prop', () => {
      const { container } = render(<Icon icon={Heart} aria-hidden="true" />);
      const svg = container.querySelector('svg') as SVGElement;

      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('HTML Attributes', () => {
    it('should forward ref to svg element', () => {
      const ref = React.createRef<SVGSVGElement>();
      render(<Icon icon={Heart} ref={ref} />);
      expect(ref.current).toBeInstanceOf(SVGSVGElement);
    });

    it('should spread additional props', () => {
      const { container } = render(<Icon icon={Heart} data-testid="icon-test" />);
      const svg = container.querySelector('svg') as SVGElement;

      expect(svg).toHaveAttribute('data-testid', 'icon-test');
    });

    it('should apply custom className', () => {
      const { container } = render(<Icon icon={Heart} className="custom-class" />);
      const svg = container.querySelector('svg') as SVGElement;

      expect(svg).toHaveClass('custom-class');
    });

    it('should support onClick handler', () => {
      const handleClick = jest.fn();
      const { container } = render(<Icon icon={Heart} onClick={handleClick} />);
      const svg = container.querySelector('svg') as SVGElement;

      fireEvent.click(svg);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration Scenarios', () => {
    it('should work in button context', () => {
      const { container } = render(
        <button>
          <Icon icon={Heart} size="sm" color="error" />
          <span>Favorite</span>
        </button>
      );

      const svg = container.querySelector('svg') as SVGElement;
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('text-error-600');
      expect(svg).toHaveAttribute('width', '16');
    });

    it('should work with multiple icons', () => {
      const { container } = render(
        <div>
          <Icon icon={Search} size="md" />
          <Icon icon={User} size="md" />
          <Icon icon={ShoppingCart} size="md" />
        </div>
      );

      const svgs = container.querySelectorAll('svg');
      expect(svgs).toHaveLength(3);
    });

    it('should inherit text color when using current', () => {
      const { container } = render(
        <div className="text-blue-500">
          <Icon icon={Heart} color="current" />
        </div>
      );

      const svg = container.querySelector('svg') as SVGElement;
      expect(svg).not.toHaveClass('text-primary-600');
      expect(svg).not.toHaveClass('text-secondary-600');
    });
  });
});
