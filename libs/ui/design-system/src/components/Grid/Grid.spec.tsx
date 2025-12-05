import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Grid } from './Grid';

expect.extend(toHaveNoViolations);

describe('Grid', () => {
  describe('Rendering', () => {
    it('should render children', () => {
      render(<Grid>Content</Grid>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should render as a div element', () => {
      const { container } = render(<Grid>Content</Grid>);
      expect(container.firstChild?.nodeName).toBe('DIV');
    });

    it('should apply default grid classes', () => {
      const { container } = render(<Grid>Content</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid', 'grid-cols-1', 'gap-4');
    });
  });

  describe('Columns', () => {
    it('should render 1 column by default', () => {
      const { container } = render(<Grid>1 Col</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid-cols-1');
    });

    it('should render 2 columns', () => {
      const { container } = render(<Grid cols={2}>2 Cols</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid-cols-2');
    });

    it('should render 3 columns', () => {
      const { container } = render(<Grid cols={3}>3 Cols</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid-cols-3');
    });

    it('should render 4 columns', () => {
      const { container } = render(<Grid cols={4}>4 Cols</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid-cols-4');
    });

    it('should render 6 columns', () => {
      const { container } = render(<Grid cols={6}>6 Cols</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid-cols-6');
    });

    it('should render 12 columns', () => {
      const { container } = render(<Grid cols={12}>12 Cols</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid-cols-12');
    });
  });

  describe('Gap', () => {
    it('should render no gap', () => {
      const { container } = render(<Grid gap="none">No Gap</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-0');
    });

    it('should render small gap', () => {
      const { container } = render(<Grid gap="sm">Small Gap</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-2');
    });

    it('should render medium gap by default', () => {
      const { container } = render(<Grid>Medium Gap</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-4');
    });

    it('should render large gap', () => {
      const { container } = render(<Grid gap="lg">Large Gap</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-6');
    });

    it('should render extra large gap', () => {
      const { container } = render(<Grid gap="xl">XL Gap</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-8');
    });
  });

  describe('Responsive Columns', () => {
    it('should apply responsive sm columns', () => {
      const { container } = render(<Grid responsive={{ sm: 2 }}>Responsive SM</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain('sm:grid-cols-2');
    });

    it('should apply responsive md columns', () => {
      const { container } = render(<Grid responsive={{ md: 3 }}>Responsive MD</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain('md:grid-cols-3');
    });

    it('should apply responsive lg columns', () => {
      const { container } = render(<Grid responsive={{ lg: 4 }}>Responsive LG</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain('lg:grid-cols-4');
    });

    it('should apply responsive xl columns', () => {
      const { container } = render(<Grid responsive={{ xl: 6 }}>Responsive XL</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain('xl:grid-cols-6');
    });

    it('should apply multiple responsive breakpoints', () => {
      const { container } = render(
        <Grid responsive={{ sm: 1, md: 2, lg: 3, xl: 4 }}>Multiple Breakpoints</Grid>
      );
      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain('sm:grid-cols-1');
      expect(element.className).toContain('md:grid-cols-2');
      expect(element.className).toContain('lg:grid-cols-3');
      expect(element.className).toContain('xl:grid-cols-4');
    });
  });

  describe('Combined Props', () => {
    it('should apply cols, gap, and responsive together', () => {
      const { container } = render(
        <Grid cols={2} gap="lg" responsive={{ md: 4, lg: 6 }}>
          Combined
        </Grid>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid', 'grid-cols-2', 'gap-6');
      expect(element.className).toContain('md:grid-cols-4');
      expect(element.className).toContain('lg:grid-cols-6');
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Grid>Accessible Content</Grid>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with responsive grid', async () => {
      const { container } = render(
        <Grid cols={3} gap="lg" responsive={{ md: 6 }}>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Grid>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('HTML Attributes', () => {
    it('should forward ref to div element', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Grid ref={ref}>Ref Test</Grid>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should spread additional props', () => {
      render(<Grid data-testid="grid-test">Props Test</Grid>);
      expect(screen.getByTestId('grid-test')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<Grid className="custom-grid">Custom</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('custom-grid');
    });

    it('should merge custom className with grid classes', () => {
      const { container } = render(<Grid className="custom-grid">Merged</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('custom-grid', 'grid', 'grid-cols-1', 'gap-4');
    });
  });

  describe('Layout Behavior', () => {
    it('should contain multiple children', () => {
      render(
        <Grid>
          <div data-testid="item-1">Item 1</div>
          <div data-testid="item-2">Item 2</div>
          <div data-testid="item-3">Item 3</div>
        </Grid>
      );
      expect(screen.getByTestId('item-1')).toBeInTheDocument();
      expect(screen.getByTestId('item-2')).toBeInTheDocument();
      expect(screen.getByTestId('item-3')).toBeInTheDocument();
    });

    it('should work with 12 column grid layout', () => {
      const { container } = render(
        <Grid cols={12}>
          <div>Col 1</div>
          <div>Col 2</div>
        </Grid>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid-cols-12');
    });
  });
});
