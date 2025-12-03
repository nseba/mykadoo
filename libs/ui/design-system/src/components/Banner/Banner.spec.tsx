import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Banner } from './Banner';

describe('Banner', () => {
  it('renders children content', () => {
    render(<Banner>Test message</Banner>);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('supports different variants', () => {
    const { rerender } = render(<Banner variant="info">Info message</Banner>);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<Banner variant="success">Success message</Banner>);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<Banner variant="warning">Warning message</Banner>);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<Banner variant="error">Error message</Banner>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('calls onDismiss when close button is clicked', () => {
    const onDismiss = jest.fn();
    render(<Banner onDismiss={onDismiss}>Dismissible banner</Banner>);
    
    const closeButton = screen.getByLabelText('Dismiss banner');
    fireEvent.click(closeButton);
    
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders action button', () => {
    render(
      <Banner action={<button>Action</button>}>
        Banner with action
      </Banner>
    );
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('can hide icon', () => {
    const { container } = render(<Banner showIcon={false}>No icon</Banner>);
    const icons = container.querySelectorAll('svg');
    // Close button icon shouldn't be counted
    expect(icons).toHaveLength(0);
  });

  it('supports different positions', () => {
    const { rerender } = render(<Banner position="inline">Inline</Banner>);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<Banner position="top">Top</Banner>);
    expect(screen.getByRole('alert')).toHaveClass('fixed', 'top-0');

    rerender(<Banner position="bottom">Bottom</Banner>);
    expect(screen.getByRole('alert')).toHaveClass('fixed', 'bottom-0');
  });

  it('has correct accessibility attributes', () => {
    render(<Banner>Accessible banner</Banner>);
    const element = screen.getByRole('alert');
    expect(element).toBeInTheDocument();
  });
});
