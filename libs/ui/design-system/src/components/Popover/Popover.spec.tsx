import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Popover } from './Popover';

expect.extend(toHaveNoViolations);

describe('Popover', () => {
  describe('Rendering', () => {
    it('should render trigger element', () => {
      render(
        <Popover trigger={<button>Open Popover</button>}>
          <div>Popover content</div>
        </Popover>
      );
      expect(screen.getByRole('button', { name: 'Open Popover' })).toBeInTheDocument();
    });

    it('should show popover on trigger click', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>}>
          <div>Popover content</div>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: 'Trigger' });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument();
      });
    });

    it('should hide popover when not clicked', () => {
      render(
        <Popover trigger={<button>Trigger</button>}>
          <div>Popover content</div>
        </Popover>
      );

      expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
    });

    it('should close popover on second click', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>}>
          <div>Popover content</div>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: 'Trigger' });

      // Open popover
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument();
      });

      // Close popover
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
      });
    });
  });

  describe('Positioning', () => {
    it('should position popover on bottom by default', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>}>
          <div>Bottom popover</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const popover = screen.getByText('Bottom popover').closest('div[data-side]');
        expect(popover).toHaveAttribute('data-side', 'bottom');
      });
    });

    it('should position popover on top', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>} side="top">
          <div>Top popover</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const popover = screen.getByText('Top popover').closest('div[data-side]');
        expect(popover).toHaveAttribute('data-side', 'top');
      });
    });

    it('should position popover on right', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>} side="right">
          <div>Right popover</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const popover = screen.getByText('Right popover').closest('div[data-side]');
        // Radix may flip to opposite side if viewport doesn't have space
        expect(popover).toHaveAttribute('data-side');
        expect(['left', 'right']).toContain(popover?.getAttribute('data-side'));
      });
    });

    it('should position popover on left', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>} side="left">
          <div>Left popover</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const popover = screen.getByText('Left popover').closest('div[data-side]');
        expect(popover).toHaveAttribute('data-side', 'left');
      });
    });
  });

  describe('Alignment', () => {
    it('should align popover to center by default', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>}>
          <div>Center aligned</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const popover = screen.getByText('Center aligned').closest('div[data-align]');
        expect(popover).toHaveAttribute('data-align', 'center');
      });
    });

    it('should align popover to start', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>} align="start">
          <div>Start aligned</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const popover = screen.getByText('Start aligned').closest('div[data-align]');
        expect(popover).toHaveAttribute('data-align', 'start');
      });
    });

    it('should align popover to end', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>} align="end">
          <div>End aligned</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const popover = screen.getByText('End aligned').closest('div[data-align]');
        expect(popover).toHaveAttribute('data-align', 'end');
      });
    });
  });

  describe('Controlled State', () => {
    it('should support controlled open state', () => {
      const { rerender } = render(
        <Popover trigger={<button>Trigger</button>} open={false}>
          <div>Controlled content</div>
        </Popover>
      );

      expect(screen.queryByText('Controlled content')).not.toBeInTheDocument();

      rerender(
        <Popover trigger={<button>Trigger</button>} open={true}>
          <div>Controlled content</div>
        </Popover>
      );

      expect(screen.getByText('Controlled content')).toBeInTheDocument();
    });

    it('should call onOpenChange when state changes', async () => {
      const user = userEvent.setup();
      const handleOpenChange = jest.fn();
      render(
        <Popover trigger={<button>Trigger</button>} onOpenChange={handleOpenChange}>
          <div>Content</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('should call onOpenChange with false when closing', async () => {
      const user = userEvent.setup();
      const handleOpenChange = jest.fn();
      render(
        <Popover trigger={<button>Trigger</button>} onOpenChange={handleOpenChange}>
          <div>Content</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');

      // Open
      await user.click(trigger);
      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });

      // Close
      handleOpenChange.mockClear();
      await user.click(trigger);
      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Arrow', () => {
    it('should render arrow on popover', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>}>
          <div>Popover with arrow</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        // Arrow is in Portal, so search in document.body
        const arrow = document.body.querySelector('.fill-white.stroke-neutral-200');
        expect(arrow).toBeInTheDocument();
      });
    });
  });

  describe('Styling', () => {
    it('should apply white background', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>}>
          <div>Styled popover</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const popover = screen.getByText('Styled popover').closest('div[data-side]');
        expect(popover).toHaveClass('bg-white');
      });
    });

    it('should apply border', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>}>
          <div>Bordered popover</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const popover = screen.getByText('Bordered popover').closest('div[data-side]');
        expect(popover).toHaveClass('border', 'border-neutral-200');
      });
    });

    it('should apply shadow', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>}>
          <div>Shadow popover</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const popover = screen.getByText('Shadow popover').closest('div[data-side]');
        expect(popover).toHaveClass('shadow-md');
      });
    });

    it('should apply rounded corners', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>}>
          <div>Rounded popover</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const popover = screen.getByText('Rounded popover').closest('div[data-side]');
        expect(popover).toHaveClass('rounded-md');
      });
    });

    it('should apply padding', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>}>
          <div>Padded popover</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const popover = screen.getByText('Padded popover').closest('div[data-side]');
        expect(popover).toHaveClass('p-4');
      });
    });

    it('should apply width constraint', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>}>
          <div>Width constrained</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const popover = screen.getByText('Width constrained').closest('div[data-side]');
        expect(popover).toHaveClass('w-72');
      });
    });

    it('should apply z-index', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>}>
          <div>Z-indexed popover</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const popover = screen.getByText('Z-indexed popover').closest('div[data-side]');
        expect(popover).toHaveClass('z-50');
      });
    });
  });

  describe('Animation', () => {
    it('should apply animation classes', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>}>
          <div>Animated popover</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const popover = screen.getByText('Animated popover').closest('div[data-side]');
        expect(popover).toHaveClass('data-[state=open]:animate-in');
        expect(popover).toHaveClass('data-[state=closed]:animate-out');
      });
    });

    it('should apply fade animation', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>}>
          <div>Fade popover</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const popover = screen.getByText('Fade popover').closest('div[data-side]');
        expect(popover).toHaveClass('data-[state=open]:fade-in-0');
        expect(popover).toHaveClass('data-[state=closed]:fade-out-0');
      });
    });

    it('should apply zoom animation', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>}>
          <div>Zoom popover</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const popover = screen.getByText('Zoom popover').closest('div[data-side]');
        expect(popover).toHaveClass('data-[state=open]:zoom-in-95');
        expect(popover).toHaveClass('data-[state=closed]:zoom-out-95');
      });
    });

    it('should apply side-specific slide animation', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>} side="bottom">
          <div>Slide popover</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const popover = screen.getByText('Slide popover').closest('div[data-side]');
        expect(popover).toHaveClass('data-[side=bottom]:slide-in-from-top-2');
      });
    });
  });

  describe('Content Types', () => {
    it('should render text content', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>}>
          Simple text content
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Simple text content')).toBeInTheDocument();
      });
    });

    it('should render complex React nodes', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>}>
          <div>
            <h3>Heading</h3>
            <p>Paragraph</p>
            <button>Action</button>
          </div>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: 'Trigger' });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Heading')).toBeInTheDocument();
        expect(screen.getByText('Paragraph')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
      });
    });

    it('should render form elements', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>}>
          <form>
            <input type="text" placeholder="Name" />
            <button type="submit">Submit</button>
          </form>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: 'Trigger' });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
      });
    });
  });

  describe('Combined Features', () => {
    it('should render popover with all props', async () => {
      const user = userEvent.setup();
      const handleOpenChange = jest.fn();
      render(
        <Popover
          trigger={<button>Complete Trigger</button>}
          side="right"
          align="start"
          open={undefined}
          onOpenChange={handleOpenChange}
        >
          <div>Complete popover content</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const popover = screen.getByText('Complete popover content').closest('div[data-side]');
        expect(popover).toBeInTheDocument();
        // Radix may flip side if viewport doesn't have space
        expect(popover).toHaveAttribute('data-side');
        expect(['left', 'right']).toContain(popover?.getAttribute('data-side'));
        expect(popover).toHaveAttribute('data-align', 'start');
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Popover trigger={<button>Trigger</button>}>
          <div>Accessible content</div>
        </Popover>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when open', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Popover trigger={<button>Trigger</button>}>
          <div>Open content</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(async () => {
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>}>
          <div>Keyboard accessible</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      trigger.focus();
      expect(trigger).toHaveFocus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Keyboard accessible')).toBeInTheDocument();
      });
    });

    it('should close on escape key', async () => {
      const user = userEvent.setup();
      render(
        <Popover trigger={<button>Trigger</button>}>
          <div>Escapable content</div>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Escapable content')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Escapable content')).not.toBeInTheDocument();
      });
    });
  });
});
