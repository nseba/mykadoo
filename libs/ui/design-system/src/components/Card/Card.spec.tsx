import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Card, CardHeader, CardContent, CardFooter } from './Card';

expect.extend(toHaveNoViolations);

describe('Card', () => {
  describe('Rendering', () => {
    it('should render with children', () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('should render with default variant', () => {
      const { container } = render(<Card>Default</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-white', 'border', 'border-neutral-200');
    });

    it('should apply custom className', () => {
      const { container } = render(<Card className="custom-class">Card</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class');
    });

    it('should render without children when only header/footer provided', () => {
      const { container } = render(<Card header={<div>Header</div>} footer={<div>Footer</div>} />);
      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      const { container } = render(<Card variant="default">Default</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-white', 'border', 'border-neutral-200');
    });

    it('should render outlined variant', () => {
      const { container } = render(<Card variant="outlined">Outlined</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-transparent', 'border-2', 'border-neutral-300');
    });

    it('should render elevated variant', () => {
      const { container } = render(<Card variant="elevated">Elevated</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-white', 'shadow-md', 'border', 'border-neutral-100');
    });

    it('should render filled variant', () => {
      const { container } = render(<Card variant="filled">Filled</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-neutral-50', 'border', 'border-neutral-200');
    });
  });

  describe('Padding', () => {
    it('should render with no padding', () => {
      const { container } = render(<Card padding="none">No Padding</Card>);
      const content = container.querySelector('div > div');
      expect(content).not.toHaveClass('p-3', 'p-4', 'p-6');
    });

    it('should render with small padding', () => {
      const { container } = render(<Card padding="sm">Small Padding</Card>);
      const content = container.querySelector('div > div');
      expect(content).toHaveClass('p-3');
    });

    it('should render with medium padding by default', () => {
      const { container } = render(<Card>Medium Padding</Card>);
      const content = container.querySelector('div > div');
      expect(content).toHaveClass('p-4');
    });

    it('should render with large padding', () => {
      const { container } = render(<Card padding="lg">Large Padding</Card>);
      const content = container.querySelector('div > div');
      expect(content).toHaveClass('p-6');
    });
  });

  describe('Hoverable', () => {
    it('should not be hoverable by default', () => {
      const { container } = render(<Card>Not Hoverable</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass('cursor-pointer');
    });

    it('should apply hover styles when hoverable is true', () => {
      const { container } = render(<Card hoverable>Hoverable</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('cursor-pointer', 'hover:shadow-lg', 'hover:scale-[1.02]');
    });

    it('should support onClick handler when hoverable', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      const { container } = render(
        <Card hoverable onClick={handleClick}>
          Clickable Card
        </Card>
      );

      const card = container.firstChild as HTMLElement;
      await user.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Header', () => {
    it('should render header when provided', () => {
      render(<Card header={<div>Card Header</div>}>Content</Card>);
      expect(screen.getByText('Card Header')).toBeInTheDocument();
    });

    it('should apply border to header', () => {
      const { container } = render(<Card header={<div>Header</div>}>Content</Card>);
      const header = container.querySelector('.border-b');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('border-neutral-200');
    });

    it('should apply padding to header', () => {
      const { container } = render(<Card padding="lg" header={<div>Header</div>}>Content</Card>);
      const header = container.querySelector('.border-b');
      expect(header).toHaveClass('p-6');
    });

    it('should not render header when not provided', () => {
      const { container } = render(<Card>Content</Card>);
      const header = container.querySelector('.border-b');
      expect(header).not.toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('should render footer when provided', () => {
      render(<Card footer={<div>Card Footer</div>}>Content</Card>);
      expect(screen.getByText('Card Footer')).toBeInTheDocument();
    });

    it('should apply border to footer', () => {
      const { container } = render(<Card footer={<div>Footer</div>}>Content</Card>);
      const footer = container.querySelector('.border-t');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('border-neutral-200');
    });

    it('should apply padding to footer', () => {
      const { container } = render(<Card padding="sm" footer={<div>Footer</div>}>Content</Card>);
      const footer = container.querySelector('.border-t');
      expect(footer).toHaveClass('p-3');
    });

    it('should not render footer when not provided', () => {
      const { container } = render(<Card>Content</Card>);
      const footer = container.querySelector('.border-t');
      expect(footer).not.toBeInTheDocument();
    });
  });

  describe('Combined Features', () => {
    it('should render card with header, content, and footer', () => {
      render(
        <Card
          variant="elevated"
          padding="lg"
          hoverable
          header={<div>Header</div>}
          footer={<div>Footer</div>}
        >
          Content
        </Card>
      );

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    it('should apply all styles correctly', () => {
      const { container } = render(
        <Card variant="outlined" padding="sm" hoverable className="custom">
          Complete Card
        </Card>
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-transparent', 'border-2', 'cursor-pointer', 'custom');
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Card>Accessible Card</Card>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with header and footer', async () => {
      const { container } = render(
        <Card header={<h2>Card Title</h2>} footer={<button>Action</button>}>
          Card content
        </Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when hoverable', async () => {
      const { container } = render(<Card hoverable>Hoverable Card</Card>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('HTML Attributes', () => {
    it('should forward ref to div element', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>Ref Test</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should spread additional props', () => {
      render(<Card data-testid="card-test">Props Test</Card>);
      expect(screen.getByTestId('card-test')).toBeInTheDocument();
    });

    it('should support aria attributes', () => {
      const { container } = render(<Card aria-label="Custom card">Aria Test</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveAttribute('aria-label', 'Custom card');
    });
  });
});

describe('CardHeader', () => {
  describe('Rendering', () => {
    it('should render with children', () => {
      render(<CardHeader>Header Content</CardHeader>);
      expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('should render with title', () => {
      render(<CardHeader title="Card Title" />);
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('should render with subtitle', () => {
      render(<CardHeader title="Title" subtitle="Subtitle text" />);
      expect(screen.getByText('Subtitle text')).toBeInTheDocument();
    });

    it('should render with action', () => {
      render(<CardHeader title="Title" action={<button>Action</button>} />);
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    it('should render title as h3 with correct styles', () => {
      render(<CardHeader title="Card Title" />);
      const title = screen.getByText('Card Title');
      expect(title.tagName).toBe('H3');
      expect(title).toHaveClass('text-lg', 'font-semibold', 'text-neutral-900');
    });

    it('should render subtitle with correct styles', () => {
      render(<CardHeader subtitle="Subtitle" />);
      const subtitle = screen.getByText('Subtitle');
      expect(subtitle.tagName).toBe('P');
      expect(subtitle).toHaveClass('text-sm', 'text-neutral-600', 'mt-1');
    });
  });

  describe('Layout', () => {
    it('should use flexbox layout', () => {
      const { container } = render(<CardHeader title="Title" />);
      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass('flex', 'items-start', 'justify-between');
    });

    it('should position action to the right', () => {
      const { container } = render(<CardHeader title="Title" action={<button>Action</button>} />);
      const actionContainer = container.querySelector('.ml-4');
      expect(actionContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<CardHeader title="Accessible Header" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with all props', async () => {
      const { container } = render(
        <CardHeader title="Title" subtitle="Subtitle" action={<button>Action</button>} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('HTML Attributes', () => {
    it('should forward ref to div element', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardHeader ref={ref} title="Title" />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should spread additional props', () => {
      render(<CardHeader data-testid="header-test" title="Title" />);
      expect(screen.getByTestId('header-test')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<CardHeader className="custom-header" title="Title" />);
      expect(container.firstChild).toHaveClass('custom-header');
    });
  });
});

describe('CardContent', () => {
  describe('Rendering', () => {
    it('should render with children', () => {
      render(<CardContent>Content text</CardContent>);
      expect(screen.getByText('Content text')).toBeInTheDocument();
    });

    it('should apply default text color', () => {
      const { container } = render(<CardContent>Content</CardContent>);
      expect(container.firstChild).toHaveClass('text-neutral-700');
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<CardContent>Accessible content</CardContent>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('HTML Attributes', () => {
    it('should forward ref to div element', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardContent ref={ref}>Content</CardContent>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should spread additional props', () => {
      render(<CardContent data-testid="content-test">Content</CardContent>);
      expect(screen.getByTestId('content-test')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<CardContent className="custom-content">Content</CardContent>);
      expect(container.firstChild).toHaveClass('custom-content');
    });
  });
});

describe('CardFooter', () => {
  describe('Rendering', () => {
    it('should render with children', () => {
      render(<CardFooter>Footer content</CardFooter>);
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('should use flexbox layout', () => {
      const { container } = render(<CardFooter>Footer</CardFooter>);
      expect(container.firstChild).toHaveClass('flex', 'items-center', 'gap-2');
    });

    it('should render multiple action buttons', () => {
      render(
        <CardFooter>
          <button>Cancel</button>
          <button>Save</button>
        </CardFooter>
      );
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('HTML Attributes', () => {
    it('should forward ref to div element', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardFooter ref={ref}>Footer</CardFooter>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should spread additional props', () => {
      render(<CardFooter data-testid="footer-test">Footer</CardFooter>);
      expect(screen.getByTestId('footer-test')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<CardFooter className="custom-footer">Footer</CardFooter>);
      expect(container.firstChild).toHaveClass('custom-footer');
    });
  });
});
