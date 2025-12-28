import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Avatar, AvatarGroup } from './Avatar';

expect.extend(toHaveNoViolations);

describe('Avatar', () => {
  describe('Rendering', () => {
    it('should render with image source', () => {
      render(<Avatar src="https://example.com/avatar.jpg" alt="User" />);
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
      expect(img).toHaveAttribute('alt', 'User');
    });

    it('should render fallback when no src provided', () => {
      render(<Avatar fallback="AB" />);
      expect(screen.getByText('AB')).toBeInTheDocument();
    });

    it('should render fallback from alt first character', () => {
      render(<Avatar alt="John Doe" />);
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('should render question mark when no src, fallback, or alt', () => {
      render(<Avatar />);
      expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('should uppercase fallback text', () => {
      render(<Avatar fallback="ab" />);
      // CSS uppercase transforms display but not DOM text
      const fallback = screen.getByText('ab');
      expect(fallback).toHaveClass('uppercase');
    });
  });

  describe('Image Error Handling', () => {
    it('should show fallback when image fails to load', async () => {
      const { container } = render(<Avatar src="invalid-url" fallback="FB" />);

      // Image with empty alt has role="presentation", so use querySelector
      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();

      // Trigger image error wrapped in act
      await act(async () => {
        img!.dispatchEvent(new Event('error'));
      });

      await waitFor(() => {
        expect(screen.getByText('FB')).toBeInTheDocument();
      });
    });

    it('should use alt character as fallback on image error', async () => {
      render(<Avatar src="invalid-url" alt="User" />);

      const img = screen.getByRole('img');

      await act(async () => {
        img.dispatchEvent(new Event('error'));
      });

      await waitFor(() => {
        expect(screen.getByText('U')).toBeInTheDocument();
      });
    });
  });

  describe('Sizes', () => {
    it('should render xs size', () => {
      const { container } = render(<Avatar size="xs" fallback="XS" />);
      const avatar = container.querySelector('.h-6.w-6');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('text-xs');
    });

    it('should render sm size', () => {
      const { container } = render(<Avatar size="sm" fallback="SM" />);
      const avatar = container.querySelector('.h-8.w-8');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('text-sm');
    });

    it('should render md size by default', () => {
      const { container } = render(<Avatar fallback="MD" />);
      const avatar = container.querySelector('.h-10.w-10');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('text-base');
    });

    it('should render lg size', () => {
      const { container } = render(<Avatar size="lg" fallback="LG" />);
      const avatar = container.querySelector('.h-12.w-12');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('text-lg');
    });

    it('should render xl size', () => {
      const { container } = render(<Avatar size="xl" fallback="XL" />);
      const avatar = container.querySelector('.h-16.w-16');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('text-xl');
    });

    it('should render 2xl size', () => {
      const { container } = render(<Avatar size="2xl" fallback="2XL" />);
      const avatar = container.querySelector('.h-20.w-20');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('text-2xl');
    });
  });

  describe('Shapes', () => {
    it('should render circle shape by default', () => {
      const { container } = render(<Avatar fallback="C" />);
      const avatar = container.querySelector('.rounded-full');
      expect(avatar).toBeInTheDocument();
    });

    it('should render square shape', () => {
      const { container } = render(<Avatar shape="square" fallback="S" />);
      const avatar = container.querySelector('.rounded-md');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Status Indicator', () => {
    it('should not render status by default', () => {
      const { container } = render(<Avatar fallback="NS" />);
      const status = screen.queryByLabelText(/status/i);
      expect(status).not.toBeInTheDocument();
    });

    it('should render online status', () => {
      render(<Avatar fallback="ON" status="online" />);
      const status = screen.getByLabelText('Status: online');
      expect(status).toBeInTheDocument();
      expect(status).toHaveClass('bg-success-500');
    });

    it('should render offline status', () => {
      render(<Avatar fallback="OFF" status="offline" />);
      const status = screen.getByLabelText('Status: offline');
      expect(status).toBeInTheDocument();
      expect(status).toHaveClass('bg-neutral-400');
    });

    it('should render away status', () => {
      render(<Avatar fallback="AW" status="away" />);
      const status = screen.getByLabelText('Status: away');
      expect(status).toBeInTheDocument();
      expect(status).toHaveClass('bg-warning-500');
    });

    it('should render busy status', () => {
      render(<Avatar fallback="BS" status="busy" />);
      const status = screen.getByLabelText('Status: busy');
      expect(status).toBeInTheDocument();
      expect(status).toHaveClass('bg-error-500');
    });

    it('should position status indicator at bottom right', () => {
      const { container } = render(<Avatar fallback="POS" status="online" />);
      const status = screen.getByLabelText('Status: online');
      expect(status).toHaveClass('absolute', 'bottom-0', 'right-0');
    });

    it('should scale status indicator with avatar size', () => {
      const { container } = render(<Avatar size="xl" status="online" fallback="XL" />);
      const status = screen.getByLabelText('Status: online');
      expect(status).toHaveClass('h-4', 'w-4');
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations with image', async () => {
      const { container } = render(<Avatar src="https://example.com/avatar.jpg" alt="User Avatar" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with fallback', async () => {
      const { container } = render(<Avatar fallback="AB" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with status', async () => {
      const { container } = render(<Avatar fallback="ST" status="online" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have aria-label on status indicator', () => {
      render(<Avatar fallback="AL" status="online" />);
      const status = screen.getByLabelText('Status: online');
      expect(status).toHaveAttribute('aria-label', 'Status: online');
    });
  });

  describe('HTML Attributes', () => {
    it('should forward ref to div element', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Avatar ref={ref} fallback="R" />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should spread additional props', () => {
      render(<Avatar data-testid="avatar-test" fallback="P" />);
      expect(screen.getByTestId('avatar-test')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Avatar className="custom-avatar" fallback="C" />);
      expect(screen.getByText('C').closest('.custom-avatar')).toBeInTheDocument();
    });
  });
});

describe('AvatarGroup', () => {
  describe('Rendering', () => {
    it('should render multiple avatars', () => {
      render(
        <AvatarGroup>
          <Avatar fallback="A" />
          <Avatar fallback="B" />
          <Avatar fallback="C" />
        </AvatarGroup>
      );

      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
    });

    it('should limit visible avatars to max', () => {
      render(
        <AvatarGroup max={2}>
          <Avatar fallback="A" />
          <Avatar fallback="B" />
          <Avatar fallback="C" />
          <Avatar fallback="D" />
        </AvatarGroup>
      );

      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.queryByText('C')).not.toBeInTheDocument();
      expect(screen.queryByText('D')).not.toBeInTheDocument();
    });

    it('should show remaining count', () => {
      render(
        <AvatarGroup max={2}>
          <Avatar fallback="A" />
          <Avatar fallback="B" />
          <Avatar fallback="C" />
          <Avatar fallback="D" />
          <Avatar fallback="E" />
        </AvatarGroup>
      );

      expect(screen.getByText('+3')).toBeInTheDocument();
    });

    it('should not show remaining count when all fit', () => {
      render(
        <AvatarGroup max={5}>
          <Avatar fallback="A" />
          <Avatar fallback="B" />
          <Avatar fallback="C" />
        </AvatarGroup>
      );

      expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
    });
  });

  describe('Props Inheritance', () => {
    it('should pass size to child avatars', () => {
      const { container } = render(
        <AvatarGroup size="lg">
          <Avatar fallback="A" />
          <Avatar fallback="B" />
        </AvatarGroup>
      );

      const avatars = container.querySelectorAll('.h-12.w-12');
      expect(avatars.length).toBeGreaterThanOrEqual(2);
    });

    it('should pass shape to child avatars', () => {
      const { container } = render(
        <AvatarGroup shape="square">
          <Avatar fallback="A" />
          <Avatar fallback="B" />
        </AvatarGroup>
      );

      const avatars = container.querySelectorAll('.rounded-md');
      expect(avatars.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Styling', () => {
    it('should overlap avatars with negative margin', () => {
      const { container } = render(
        <AvatarGroup>
          <Avatar fallback="A" />
          <Avatar fallback="B" />
        </AvatarGroup>
      );

      const group = container.firstChild;
      expect(group).toHaveClass('-space-x-2');
    });

    it('should add ring to avatars for separation', () => {
      const { container } = render(
        <AvatarGroup>
          <Avatar fallback="A" />
          <Avatar fallback="B" />
        </AvatarGroup>
      );

      const avatars = container.querySelectorAll('.ring-2.ring-white');
      expect(avatars.length).toBeGreaterThanOrEqual(2);
    });

    it('should apply custom className', () => {
      const { container } = render(
        <AvatarGroup className="custom-group">
          <Avatar fallback="A" />
        </AvatarGroup>
      );

      expect(container.firstChild).toHaveClass('custom-group');
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <AvatarGroup>
          <Avatar fallback="A" />
          <Avatar fallback="B" />
          <Avatar fallback="C" />
        </AvatarGroup>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('HTML Attributes', () => {
    it('should forward ref to div element', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <AvatarGroup ref={ref}>
          <Avatar fallback="A" />
        </AvatarGroup>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should spread additional props', () => {
      render(
        <AvatarGroup data-testid="group-test">
          <Avatar fallback="A" />
        </AvatarGroup>
      );
      expect(screen.getByTestId('group-test')).toBeInTheDocument();
    });
  });
});
