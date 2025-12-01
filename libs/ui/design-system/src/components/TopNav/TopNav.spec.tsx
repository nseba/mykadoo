import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TopNav } from './TopNav';

expect.extend(toHaveNoViolations);

describe('TopNav', () => {
  const defaultLinks = [
    { label: 'Home', href: '#home', active: true },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  it('renders navigation with logo and links', () => {
    render(
      <TopNav logo={<span>Logo</span>} links={defaultLinks} />
    );

    expect(screen.getByText('Logo')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('marks active link with aria-current', () => {
    render(<TopNav links={defaultLinks} />);

    const homeLink = screen.getAllByText('Home')[0];
    expect(homeLink).toHaveAttribute('aria-current', 'page');
  });

  it('toggles mobile menu on button click', () => {
    render(<TopNav links={defaultLinks} />);

    const menuButton = screen.getByRole('button', { name: /open main menu/i });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();

    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders actions when provided', () => {
    render(
      <TopNav
        links={defaultLinks}
        actions={<button>Action</button>}
      />
    );

    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('applies variant styles correctly', () => {
    const { rerender } = render(<TopNav links={defaultLinks} variant="light" />);
    let nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('bg-white');

    rerender(<TopNav links={defaultLinks} variant="dark" />);
    nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('bg-neutral-900');

    rerender(<TopNav links={defaultLinks} variant="transparent" />);
    nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('bg-transparent');
  });

  it('disables links when disabled prop is true', () => {
    const links = [
      { label: 'Enabled', href: '#' },
      { label: 'Disabled', href: '#', disabled: true },
    ];

    render(<TopNav links={links} />);

    const disabledLink = screen.getAllByText('Disabled')[0];
    expect(disabledLink).toHaveAttribute('aria-disabled', 'true');
    expect(disabledLink).toHaveClass('pointer-events-none');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<TopNav logo={<span>Logo</span>} links={defaultLinks} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
