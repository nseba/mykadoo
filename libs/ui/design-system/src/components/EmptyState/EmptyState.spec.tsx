import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders with title', () => {
    render(<EmptyState title="No results" />);
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(<EmptyState title="No results" description="Try adjusting filters" />);
    expect(screen.getByText('Try adjusting filters')).toBeInTheDocument();
  });

  it('renders with action button', () => {
    render(
      <EmptyState
        title="No items"
        action={<button>Add Item</button>}
      />
    );
    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    render(
      <EmptyState
        title="Empty"
        icon={<span data-testid="custom-icon">🎨</span>}
      />
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('supports different sizes', () => {
    const { rerender } = render(<EmptyState title="Test" size="sm" />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<EmptyState title="Test" size="md" />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<EmptyState title="Test" size="lg" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<EmptyState title="No data" />);
    const element = screen.getByRole('status');
    expect(element).toBeInTheDocument();
  });
});
