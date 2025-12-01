import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Breadcrumbs } from './Breadcrumbs';

expect.extend(toHaveNoViolations);

describe('Breadcrumbs', () => {
  const items = [
    { label: 'Home', href: '#' },
    { label: 'Products', href: '#' },
    { label: 'Electronics', href: '#' },
    { label: 'Laptops' },
  ];

  it('renders all breadcrumb items', () => {
    render(<Breadcrumbs items={items} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Laptops')).toBeInTheDocument();
  });

  it('marks the last item with aria-current', () => {
    render(<Breadcrumbs items={items} />);

    const lastItem = screen.getByText('Laptops');
    expect(lastItem).toHaveAttribute('aria-current', 'page');
  });

  it('renders links for items with href (except last)', () => {
    render(<Breadcrumbs items={items} />);

    const homeLink = screen.getByText('Home');
    expect(homeLink.tagName).toBe('A');
    expect(homeLink).toHaveAttribute('href', '#');

    const lastItem = screen.getByText('Laptops');
    expect(lastItem.tagName).toBe('SPAN');
  });

  it('renders custom separator', () => {
    render(<Breadcrumbs items={items} separator={<span>→</span>} />);

    const separators = screen.getAllByText('→');
    expect(separators).toHaveLength(items.length - 1);
  });

  it('applies size variant classes', () => {
    const { rerender, container } = render(<Breadcrumbs items={items} size="sm" />);
    expect(container.querySelector('nav')).toHaveClass('text-xs');

    rerender(<Breadcrumbs items={items} size="md" />);
    expect(container.querySelector('nav')).toHaveClass('text-sm');

    rerender(<Breadcrumbs items={items} size="lg" />);
    expect(container.querySelector('nav')).toHaveClass('text-base');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<Breadcrumbs items={items} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
