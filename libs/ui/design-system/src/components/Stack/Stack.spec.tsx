import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Stack } from './Stack';

expect.extend(toHaveNoViolations);

describe('Stack', () => {
  describe('Rendering', () => {
    it('should render children', () => {
      render(<Stack>Content</Stack>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should render as a div element', () => {
      const { container } = render(<Stack>Content</Stack>);
      expect(container.firstChild?.nodeName).toBe('DIV');
    });

    it('should apply default flex classes', () => {
      const { container } = render(<Stack>Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('flex', 'flex-col', 'gap-4', 'items-stretch', 'justify-start');
    });
  });

  describe('Direction', () => {
    it('should render vertical direction by default', () => {
      const { container } = render(<Stack>Vertical</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('flex-col');
      expect(element).not.toHaveClass('flex-row');
    });

    it('should render horizontal direction', () => {
      const { container } = render(<Stack direction="horizontal">Horizontal</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('flex-row');
      expect(element).not.toHaveClass('flex-col');
    });
  });

  describe('Spacing', () => {
    it('should render no spacing', () => {
      const { container } = render(<Stack spacing="none">No Spacing</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-0');
    });

    it('should render xs spacing', () => {
      const { container } = render(<Stack spacing="xs">XS Spacing</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-1');
    });

    it('should render sm spacing', () => {
      const { container } = render(<Stack spacing="sm">Small Spacing</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-2');
    });

    it('should render md spacing by default', () => {
      const { container } = render(<Stack>Medium Spacing</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-4');
    });

    it('should render lg spacing', () => {
      const { container } = render(<Stack spacing="lg">Large Spacing</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-6');
    });

    it('should render xl spacing', () => {
      const { container } = render(<Stack spacing="xl">XL Spacing</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-8');
    });

    it('should render 2xl spacing', () => {
      const { container } = render(<Stack spacing="2xl">2XL Spacing</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-12');
    });
  });

  describe('Alignment', () => {
    it('should render start alignment', () => {
      const { container } = render(<Stack align="start">Start</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('items-start');
    });

    it('should render center alignment', () => {
      const { container } = render(<Stack align="center">Center</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('items-center');
    });

    it('should render end alignment', () => {
      const { container } = render(<Stack align="end">End</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('items-end');
    });

    it('should render stretch alignment by default', () => {
      const { container } = render(<Stack>Stretch</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('items-stretch');
    });
  });

  describe('Justify', () => {
    it('should render start justify by default', () => {
      const { container } = render(<Stack>Start</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('justify-start');
    });

    it('should render center justify', () => {
      const { container } = render(<Stack justify="center">Center</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('justify-center');
    });

    it('should render end justify', () => {
      const { container } = render(<Stack justify="end">End</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('justify-end');
    });

    it('should render between justify', () => {
      const { container } = render(<Stack justify="between">Between</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('justify-between');
    });

    it('should render around justify', () => {
      const { container } = render(<Stack justify="around">Around</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('justify-around');
    });
  });

  describe('Wrap', () => {
    it('should not wrap by default', () => {
      const { container } = render(<Stack>No Wrap</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).not.toHaveClass('flex-wrap');
    });

    it('should wrap when wrap is true', () => {
      const { container } = render(<Stack wrap>Wrap</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('flex-wrap');
    });
  });

  describe('Combined Props', () => {
    it('should apply multiple props together - vertical', () => {
      const { container } = render(
        <Stack direction="vertical" spacing="lg" align="center" justify="between">
          Combined Vertical
        </Stack>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass(
        'flex',
        'flex-col',
        'gap-6',
        'items-center',
        'justify-between'
      );
    });

    it('should apply multiple props together - horizontal', () => {
      const { container } = render(
        <Stack direction="horizontal" spacing="xl" align="end" justify="center" wrap>
          Combined Horizontal
        </Stack>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass(
        'flex',
        'flex-row',
        'gap-8',
        'items-end',
        'justify-center',
        'flex-wrap'
      );
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Stack>Accessible Content</Stack>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with custom props', async () => {
      const { container } = render(
        <Stack direction="horizontal" spacing="lg" align="center" wrap>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Stack>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('HTML Attributes', () => {
    it('should forward ref to div element', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Stack ref={ref}>Ref Test</Stack>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should spread additional props', () => {
      render(<Stack data-testid="stack-test">Props Test</Stack>);
      expect(screen.getByTestId('stack-test')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<Stack className="custom-stack">Custom</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('custom-stack');
    });

    it('should merge custom className with flex classes', () => {
      const { container } = render(<Stack className="custom-stack">Merged</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('custom-stack', 'flex', 'flex-col', 'gap-4');
    });
  });

  describe('Layout Behavior', () => {
    it('should contain multiple children vertically', () => {
      render(
        <Stack>
          <div data-testid="item-1">Item 1</div>
          <div data-testid="item-2">Item 2</div>
          <div data-testid="item-3">Item 3</div>
        </Stack>
      );
      expect(screen.getByTestId('item-1')).toBeInTheDocument();
      expect(screen.getByTestId('item-2')).toBeInTheDocument();
      expect(screen.getByTestId('item-3')).toBeInTheDocument();
    });

    it('should contain multiple children horizontally', () => {
      render(
        <Stack direction="horizontal">
          <div data-testid="item-1">Item 1</div>
          <div data-testid="item-2">Item 2</div>
          <div data-testid="item-3">Item 3</div>
        </Stack>
      );
      expect(screen.getByTestId('item-1')).toBeInTheDocument();
      expect(screen.getByTestId('item-2')).toBeInTheDocument();
      expect(screen.getByTestId('item-3')).toBeInTheDocument();
    });
  });
});
