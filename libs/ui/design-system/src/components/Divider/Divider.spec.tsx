import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Divider } from './Divider';

expect.extend(toHaveNoViolations);

describe('Divider', () => {
  describe('Rendering', () => {
    it('should render as hr element without label', () => {
      const { container } = render(<Divider />);
      const hr = container.querySelector('hr');
      expect(hr).toBeInTheDocument();
    });

    it('should render with label in div wrapper', () => {
      const { container } = render(<Divider label="Section" />);
      const div = container.querySelector('div[role="separator"]');
      expect(div).toBeInTheDocument();
      expect(screen.getByText('Section')).toBeInTheDocument();
    });

    it('should apply default classes', () => {
      const { container } = render(<Divider />);
      const hr = container.querySelector('hr') as HTMLElement;
      expect(hr).toHaveClass('border-neutral-200', 'border-solid', 'border-t-2', 'w-full');
    });
  });

  describe('Orientation', () => {
    it('should render horizontal by default', () => {
      const { container } = render(<Divider />);
      const hr = container.querySelector('hr') as HTMLElement;
      expect(hr).toHaveClass('w-full');
      expect(hr).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('should render vertical orientation', () => {
      const { container } = render(<Divider orientation="vertical" />);
      const hr = container.querySelector('hr') as HTMLElement;
      expect(hr).toHaveClass('h-auto', 'self-stretch');
      expect(hr).toHaveAttribute('aria-orientation', 'vertical');
    });
  });

  describe('Thickness', () => {
    it('should render thin thickness', () => {
      const { container } = render(<Divider thickness="thin" />);
      const hr = container.querySelector('hr') as HTMLElement;
      expect(hr).toHaveClass('border-t');
    });

    it('should render normal thickness by default', () => {
      const { container } = render(<Divider />);
      const hr = container.querySelector('hr') as HTMLElement;
      expect(hr).toHaveClass('border-t-2');
    });

    it('should render thick thickness', () => {
      const { container } = render(<Divider thickness="thick" />);
      const hr = container.querySelector('hr') as HTMLElement;
      expect(hr).toHaveClass('border-t-4');
    });

    it('should render thin vertical thickness', () => {
      const { container } = render(<Divider orientation="vertical" thickness="thin" />);
      const hr = container.querySelector('hr') as HTMLElement;
      expect(hr).toHaveClass('border-l');
    });

    it('should render normal vertical thickness', () => {
      const { container } = render(<Divider orientation="vertical" />);
      const hr = container.querySelector('hr') as HTMLElement;
      expect(hr).toHaveClass('border-l-2');
    });

    it('should render thick vertical thickness', () => {
      const { container } = render(<Divider orientation="vertical" thickness="thick" />);
      const hr = container.querySelector('hr') as HTMLElement;
      expect(hr).toHaveClass('border-l-4');
    });
  });

  describe('Variant', () => {
    it('should render solid variant by default', () => {
      const { container } = render(<Divider />);
      const hr = container.querySelector('hr') as HTMLElement;
      expect(hr).toHaveClass('border-solid');
    });

    it('should render dashed variant', () => {
      const { container } = render(<Divider variant="dashed" />);
      const hr = container.querySelector('hr') as HTMLElement;
      expect(hr).toHaveClass('border-dashed');
    });

    it('should render dotted variant', () => {
      const { container } = render(<Divider variant="dotted" />);
      const hr = container.querySelector('hr') as HTMLElement;
      expect(hr).toHaveClass('border-dotted');
    });
  });

  describe('Label', () => {
    it('should render without label by default', () => {
      render(<Divider />);
      const label = screen.queryByRole('separator');
      expect(label).toBeInTheDocument();
    });

    it('should render label text', () => {
      render(<Divider label="Section Title" />);
      expect(screen.getByText('Section Title')).toBeInTheDocument();
    });

    it('should render label in center by default', () => {
      const { container } = render(<Divider label="Center" />);
      const div = container.querySelector('div[role="separator"]') as HTMLElement;
      expect(div.className).toContain('before:flex-1');
      expect(div.className).toContain('after:flex-1');
    });

    it('should render label on left', () => {
      const { container } = render(<Divider label="Left" labelPosition="left" />);
      const div = container.querySelector('div[role="separator"]') as HTMLElement;
      expect(div.className).toContain('before:mr-auto');
      expect(div.className).toContain('before:w-8');
    });

    it('should render label on right', () => {
      const { container } = render(<Divider label="Right" labelPosition="right" />);
      const div = container.querySelector('div[role="separator"]') as HTMLElement;
      expect(div.className).toContain('after:ml-auto');
      expect(div.className).toContain('after:w-8');
    });

    it('should render two hr elements with label', () => {
      const { container } = render(<Divider label="Split" />);
      const hrs = container.querySelectorAll('hr');
      expect(hrs).toHaveLength(2);
    });
  });

  describe('Combined Props', () => {
    it('should apply multiple props together', () => {
      const { container } = render(<Divider thickness="thick" variant="dashed" />);
      const hr = container.querySelector('hr') as HTMLElement;
      expect(hr).toHaveClass('border-t-4', 'border-dashed', 'border-neutral-200');
    });

    it('should apply label with custom variant and thickness', () => {
      const { container } = render(
        <Divider label="Custom" labelPosition="left" thickness="thin" variant="dotted" />
      );
      expect(screen.getByText('Custom')).toBeInTheDocument();
      const hrs = container.querySelectorAll('hr');
      hrs.forEach((hr) => {
        expect(hr).toHaveClass('border-t', 'border-dotted');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Divider />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with label', async () => {
      const { container } = render(<Divider label="Section" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have role separator', () => {
      render(<Divider />);
      const separator = screen.getByRole('separator');
      expect(separator).toBeInTheDocument();
    });

    it('should have aria-orientation attribute', () => {
      render(<Divider orientation="vertical" />);
      const separator = screen.getByRole('separator');
      expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    });
  });

  describe('HTML Attributes', () => {
    it('should forward ref to hr element', () => {
      const ref = React.createRef<HTMLHRElement>();
      render(<Divider ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLHRElement);
    });

    it('should spread additional props', () => {
      render(<Divider data-testid="divider-test" />);
      expect(screen.getByTestId('divider-test')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<Divider className="custom-divider" />);
      const hr = container.querySelector('hr') as HTMLElement;
      expect(hr).toHaveClass('custom-divider');
    });

    it('should merge custom className with default classes', () => {
      const { container } = render(<Divider className="custom-divider" />);
      const hr = container.querySelector('hr') as HTMLElement;
      expect(hr).toHaveClass('custom-divider', 'border-neutral-200', 'border-solid', 'w-full');
    });

    it('should apply custom className to label wrapper', () => {
      const { container } = render(<Divider label="Test" className="custom-wrapper" />);
      const div = container.querySelector('div[role="separator"]') as HTMLElement;
      expect(div).toHaveClass('custom-wrapper');
    });
  });

  describe('Layout Behavior', () => {
    it('should span full width when horizontal', () => {
      const { container } = render(<Divider />);
      const hr = container.querySelector('hr') as HTMLElement;
      expect(hr).toHaveClass('w-full');
    });

    it('should stretch height when vertical', () => {
      const { container } = render(<Divider orientation="vertical" />);
      const hr = container.querySelector('hr') as HTMLElement;
      expect(hr).toHaveClass('h-auto', 'self-stretch');
    });

    it('should render in flexbox container properly', () => {
      const { container } = render(
        <div className="flex items-center gap-4">
          <span>Before</span>
          <Divider orientation="vertical" />
          <span>After</span>
        </div>
      );
      const hr = container.querySelector('hr') as HTMLElement;
      expect(hr).toHaveClass('self-stretch');
    });
  });
});
