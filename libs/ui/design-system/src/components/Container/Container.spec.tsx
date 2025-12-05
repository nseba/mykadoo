import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Container } from './Container';

expect.extend(toHaveNoViolations);

describe('Container', () => {
  describe('Rendering', () => {
    it('should render children', () => {
      render(<Container>Content</Container>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should render as a div element', () => {
      const { container } = render(<Container>Content</Container>);
      expect(container.firstChild?.nodeName).toBe('DIV');
    });

    it('should apply default props', () => {
      const { container } = render(<Container>Content</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('max-w-screen-lg', 'mx-auto', 'px-6', 'w-full');
    });
  });

  describe('Sizes', () => {
    it('should render sm size', () => {
      const { container } = render(<Container size="sm">Small</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('max-w-screen-sm');
    });

    it('should render md size', () => {
      const { container } = render(<Container size="md">Medium</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('max-w-screen-md');
    });

    it('should render lg size by default', () => {
      const { container } = render(<Container>Large</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('max-w-screen-lg');
    });

    it('should render xl size', () => {
      const { container } = render(<Container size="xl">Extra Large</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('max-w-screen-xl');
    });

    it('should render 2xl size', () => {
      const { container } = render(<Container size="2xl">2XL</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('max-w-screen-2xl');
    });

    it('should render full size', () => {
      const { container } = render(<Container size="full">Full Width</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('max-w-full');
    });
  });

  describe('Padding', () => {
    it('should render no padding', () => {
      const { container } = render(<Container padding="none">No Padding</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).not.toHaveClass('px-4', 'px-6', 'px-8');
    });

    it('should render small padding', () => {
      const { container } = render(<Container padding="sm">Small Padding</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('px-4');
    });

    it('should render medium padding by default', () => {
      const { container } = render(<Container>Medium Padding</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('px-6');
    });

    it('should render large padding', () => {
      const { container } = render(<Container padding="lg">Large Padding</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('px-8');
    });
  });

  describe('Centering', () => {
    it('should center container by default', () => {
      const { container } = render(<Container>Centered</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('mx-auto');
    });

    it('should not center when centered is false', () => {
      const { container } = render(<Container centered={false}>Not Centered</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).not.toHaveClass('mx-auto');
    });
  });

  describe('Combined Props', () => {
    it('should apply multiple props together', () => {
      const { container } = render(
        <Container size="xl" padding="lg" centered={false}>
          Combined
        </Container>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('max-w-screen-xl', 'px-8', 'w-full');
      expect(element).not.toHaveClass('mx-auto');
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Container>Accessible Content</Container>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with custom props', async () => {
      const { container } = render(
        <Container size="xl" padding="lg" centered={false}>
          Custom Content
        </Container>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('HTML Attributes', () => {
    it('should forward ref to div element', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Container ref={ref}>Ref Test</Container>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should spread additional props', () => {
      render(<Container data-testid="container-test">Props Test</Container>);
      expect(screen.getByTestId('container-test')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<Container className="custom-class">Custom</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('custom-class');
    });

    it('should merge custom className with default classes', () => {
      const { container } = render(<Container className="custom-class">Merged</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('custom-class', 'max-w-screen-lg', 'mx-auto', 'px-6', 'w-full');
    });
  });

  describe('Layout Behavior', () => {
    it('should be full width', () => {
      const { container } = render(<Container>Full Width</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('w-full');
    });

    it('should contain children properly', () => {
      render(
        <Container>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </Container>
      );
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });
});
