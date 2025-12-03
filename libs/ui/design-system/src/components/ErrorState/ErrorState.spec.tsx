import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  it('renders with default title and message', () => {
    render(<ErrorState />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
  });

  it('renders with custom title and message', () => {
    render(<ErrorState title="Custom Error" message="Custom message" />);
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Custom message')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = jest.fn();
    render(<ErrorState onRetry={onRetry} />);
    
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders custom action', () => {
    render(
      <ErrorState action={<button>Go Back</button>} />
    );
    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });

  it('supports different variants', () => {
    const { rerender } = render(<ErrorState variant="error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<ErrorState variant="warning" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<ErrorState variant="info" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('supports different sizes', () => {
    const { rerender } = render(<ErrorState size="sm" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<ErrorState size="md" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<ErrorState size="lg" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('can hide icon', () => {
    const { container } = render(<ErrorState showIcon={false} />);
    const icons = container.querySelectorAll('svg');
    expect(icons).toHaveLength(0);
  });

  it('has correct accessibility attributes', () => {
    render(<ErrorState />);
    const element = screen.getByRole('alert');
    expect(element).toHaveAttribute('aria-live', 'assertive');
  });
});
