import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BottomNav, BottomNavItem } from './BottomNav';

expect.extend(toHaveNoViolations);

const HomeIcon = () => <svg data-testid="home-icon"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
const SearchIcon = () => <svg data-testid="search-icon"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>;
const BellIcon = () => <svg data-testid="bell-icon"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>;
const ProfileIcon = () => <svg data-testid="profile-icon"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;

const mockItems: BottomNavItem[] = [
  { label: 'Home', icon: <HomeIcon />, active: true },
  { label: 'Search', icon: <SearchIcon />, href: '/search' },
  { label: 'Notifications', icon: <BellIcon />, badge: 3 },
  { label: 'Profile', icon: <ProfileIcon />, onClick: jest.fn() },
];

describe('BottomNav', () => {
  describe('Rendering', () => {
    it('should render all navigation items', () => {
      render(<BottomNav items={mockItems} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('should render icons for all items', () => {
      render(<BottomNav items={mockItems} />);

      expect(screen.getByTestId('home-icon')).toBeInTheDocument();
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
      expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
      expect(screen.getByTestId('profile-icon')).toBeInTheDocument();
    });

    it('should render badge when provided', () => {
      render(<BottomNav items={mockItems} />);

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should not render labels when showLabels is false', () => {
      render(<BottomNav items={mockItems} showLabels={false} />);

      expect(screen.queryByText('Home')).not.toBeInTheDocument();
      expect(screen.queryByText('Search')).not.toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render light variant by default', () => {
      const { container } = render(<BottomNav items={mockItems} />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('bg-white', 'text-neutral-600');
    });

    it('should render dark variant', () => {
      const { container } = render(<BottomNav items={mockItems} variant="dark" />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('bg-neutral-900', 'text-neutral-400');
    });
  });

  describe('Border', () => {
    it('should show border by default', () => {
      const { container } = render(<BottomNav items={mockItems} />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('border-t');
    });

    it('should hide border when bordered is false', () => {
      const { container } = render(<BottomNav items={mockItems} bordered={false} />);
      const nav = container.querySelector('nav');
      expect(nav).not.toHaveClass('border-t');
    });
  });

  describe('Item Types', () => {
    it('should render anchor element for items with href', () => {
      render(<BottomNav items={mockItems} />);

      const searchItem = screen.getByText('Search').closest('a');
      expect(searchItem).toBeInTheDocument();
      expect(searchItem).toHaveAttribute('href', '/search');
    });

    it('should render button element for items without href', () => {
      render(<BottomNav items={mockItems} />);

      const homeItem = screen.getByText('Home').closest('button');
      expect(homeItem).toBeInTheDocument();
    });
  });

  describe('Active State', () => {
    it('should highlight active item', () => {
      render(<BottomNav items={mockItems} />);

      const homeItem = screen.getByText('Home').closest('button');
      expect(homeItem).toHaveClass('text-primary-600');
      expect(homeItem).toHaveAttribute('aria-current', 'page');
    });

    it('should not highlight inactive items', () => {
      render(<BottomNav items={mockItems} />);

      const searchItem = screen.getByText('Search').closest('a');
      expect(searchItem).not.toHaveClass('text-primary-600');
      expect(searchItem).not.toHaveAttribute('aria-current');
    });
  });

  describe('Interactions', () => {
    it('should call onClick when item is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      const items = [
        { label: 'Profile', icon: <ProfileIcon />, onClick: handleClick },
      ];

      render(<BottomNav items={items} />);

      const profileButton = screen.getByText('Profile');
      await user.click(profileButton);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Badge Display', () => {
    it('should display numeric badge', () => {
      const items = [
        { label: 'Notifications', icon: <BellIcon />, badge: 5 },
      ];

      render(<BottomNav items={items} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should display string badge', () => {
      const items = [
        { label: 'Notifications', icon: <BellIcon />, badge: '9+' },
      ];

      render(<BottomNav items={items} />);
      expect(screen.getByText('9+')).toBeInTheDocument();
    });

    it('should not display badge when not provided', () => {
      const items = [
        { label: 'Home', icon: <HomeIcon /> },
      ];

      const { container } = render(<BottomNav items={items} />);
      const badge = container.querySelector('.bg-error-600');
      expect(badge).not.toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should be hidden on desktop (md and up)', () => {
      const { container } = render(<BottomNav items={mockItems} />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('md:hidden');
    });

    it('should be fixed at bottom', () => {
      const { container } = render(<BottomNav items={mockItems} />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0');
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<BottomNav items={mockItems} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have navigation role', () => {
      const { container } = render(<BottomNav items={mockItems} />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveAttribute('role', 'navigation');
    });

    it('should have aria-label', () => {
      const { container } = render(<BottomNav items={mockItems} />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveAttribute('aria-label', 'Bottom navigation');
    });

    it('should indicate current page for active item', () => {
      render(<BottomNav items={mockItems} />);

      const activeItem = screen.getByText('Home').closest('button');
      expect(activeItem).toHaveAttribute('aria-current', 'page');
    });

    it('should support keyboard focus', () => {
      render(<BottomNav items={mockItems} />);

      const homeButton = screen.getByText('Home').closest('button');
      homeButton?.focus();
      expect(homeButton).toHaveFocus();
    });
  });

  describe('Safe Area Support', () => {
    it('should include safe area inset for iOS notch', () => {
      const { container } = render(<BottomNav items={mockItems} />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('safe-area-inset-bottom');
    });
  });

  describe('Custom Styling', () => {
    it('should accept custom className', () => {
      const { container } = render(
        <BottomNav items={mockItems} className="custom-nav" />
      );
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('custom-nav');
    });
  });

  describe('Maximum Items', () => {
    it('should handle up to 5 items', () => {
      const fiveItems: BottomNavItem[] = [
        { label: 'Home', icon: <HomeIcon /> },
        { label: 'Search', icon: <SearchIcon /> },
        { label: 'Add', icon: <BellIcon /> },
        { label: 'Notifications', icon: <BellIcon /> },
        { label: 'Profile', icon: <ProfileIcon /> },
      ];

      render(<BottomNav items={fiveItems} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });
  });
});
