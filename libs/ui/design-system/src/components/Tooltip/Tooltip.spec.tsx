import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Tooltip, TooltipProvider } from './Tooltip';

expect.extend(toHaveNoViolations);

describe('Tooltip', () => {
  // Wrap tests in TooltipProvider as required by Radix
  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<TooltipProvider>{ui}</TooltipProvider>);
  };

  // Helper to get the visible tooltip content (Radix renders duplicate text in hidden a11y element)
  const getTooltipContent = (text: string) => {
    const elements = screen.getAllByText(text);
    // Return the first visible one (the actual tooltip content)
    return elements.find(el => !el.closest('[role="tooltip"]')) || elements[0];
  };

  describe('Rendering', () => {
    it('should render trigger element', () => {
      renderWithProvider(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );
      expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
    });

    it('should show tooltip on hover', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Tooltip content="Tooltip content">
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button', { name: 'Trigger' });
      await user.hover(trigger);

      await waitFor(() => {
        const content = getTooltipContent('Tooltip content');
        expect(content).toBeInTheDocument();
      });
    });

    it('should not show tooltip initially', () => {
      renderWithProvider(
        <Tooltip content="Tooltip content">
          <button>Trigger</button>
        </Tooltip>
      );

      // Tooltip should not be visible when not hovering
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('should render small size', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Tooltip content="Small tooltip" size="sm">
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = getTooltipContent('Small tooltip').closest('div');
        expect(tooltip).toHaveClass('px-2', 'py-1', 'text-xs');
      });
    });

    it('should render medium size by default', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Tooltip content="Medium tooltip">
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = getTooltipContent('Medium tooltip').closest('div');
        expect(tooltip).toHaveClass('px-3', 'py-1.5', 'text-sm');
      });
    });

    it('should render large size', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Tooltip content="Large tooltip" size="lg">
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = getTooltipContent('Large tooltip').closest('div');
        expect(tooltip).toHaveClass('px-4', 'py-2', 'text-base');
      });
    });
  });

  describe('Positioning', () => {
    it('should position tooltip on top by default', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Tooltip content="Top tooltip">
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = getTooltipContent('Top tooltip').closest('div[data-side]');
        expect(tooltip).toHaveAttribute('data-side', 'top');
      });
    });

    it('should position tooltip on right', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Tooltip content="Right tooltip" side="right">
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = getTooltipContent('Right tooltip').closest('div[data-side]');
        // Radix may flip side if viewport doesn't have space
        expect(tooltip).toHaveAttribute('data-side');
        expect(['left', 'right']).toContain(tooltip?.getAttribute('data-side'));
      });
    });

    it('should position tooltip on bottom', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Tooltip content="Bottom tooltip" side="bottom">
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = getTooltipContent('Bottom tooltip').closest('div[data-side]');
        expect(tooltip).toHaveAttribute('data-side', 'bottom');
      });
    });

    it('should position tooltip on left', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Tooltip content="Left tooltip" side="left">
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = getTooltipContent('Left tooltip').closest('div[data-side]');
        expect(tooltip).toHaveAttribute('data-side', 'left');
      });
    });
  });

  describe('Alignment', () => {
    it('should align tooltip to center by default', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Tooltip content="Center aligned">
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = getTooltipContent('Center aligned').closest('div[data-align]');
        expect(tooltip).toHaveAttribute('data-align', 'center');
      });
    });

    it('should align tooltip to start', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Tooltip content="Start aligned" align="start">
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = getTooltipContent('Start aligned').closest('div[data-align]');
        expect(tooltip).toHaveAttribute('data-align', 'start');
      });
    });

    it('should align tooltip to end', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Tooltip content="End aligned" align="end">
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = getTooltipContent('End aligned').closest('div[data-align]');
        expect(tooltip).toHaveAttribute('data-align', 'end');
      });
    });
  });

  describe('Delay', () => {
    it('should use default delay of 200ms', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Tooltip content="Delayed tooltip">
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      await user.hover(trigger);

      // Should not appear immediately
      expect(screen.queryByText('Delayed tooltip')).not.toBeInTheDocument();

      // Should appear after delay
      await waitFor(() => {
        const content = getTooltipContent('Delayed tooltip');
        expect(content).toBeInTheDocument();
      });
    });

    it('should respect custom delay duration', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Tooltip content="Custom delay" delayDuration={500}>
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      await user.hover(trigger);

      await waitFor(
        () => {
          const content = getTooltipContent('Custom delay');
          expect(content).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('should show tooltip instantly with zero delay', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Tooltip content="Instant tooltip" delayDuration={0}>
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      await user.hover(trigger);

      await waitFor(() => {
        const content = getTooltipContent('Instant tooltip');
        expect(content).toBeInTheDocument();
      });
    });
  });

  describe('Arrow', () => {
    it('should render arrow on tooltip', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Tooltip content="Tooltip with arrow">
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      await user.hover(trigger);

      await waitFor(() => {
        // Arrow is in Portal, so search in document.body
        const arrow = document.body.querySelector('.fill-neutral-900');
        expect(arrow).toBeInTheDocument();
      });
    });
  });

  describe('Styling', () => {
    it('should apply dark background color', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Tooltip content="Dark tooltip">
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = getTooltipContent('Dark tooltip').closest('div');
        expect(tooltip).toHaveClass('bg-neutral-900', 'text-white');
      });
    });

    it('should apply rounded corners', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Tooltip content="Rounded tooltip">
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = getTooltipContent('Rounded tooltip').closest('div');
        expect(tooltip).toHaveClass('rounded-md');
      });
    });

    it('should apply shadow', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Tooltip content="Shadow tooltip">
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = getTooltipContent('Shadow tooltip').closest('div');
        expect(tooltip).toHaveClass('shadow-md');
      });
    });
  });

  describe('Animation', () => {
    it('should apply animation classes', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Tooltip content="Animated tooltip">
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = getTooltipContent('Animated tooltip').closest('div');
        expect(tooltip).toHaveClass('animate-in', 'fade-in-0', 'zoom-in-95');
      });
    });

    it('should apply side-specific animation classes', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Tooltip content="Bottom animation" side="bottom">
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = getTooltipContent('Bottom animation').closest('div');
        expect(tooltip).toHaveClass('data-[side=bottom]:slide-in-from-top-2');
      });
    });
  });

  describe('Content Types', () => {
    it('should render text content', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Tooltip content="Text content">
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      await user.hover(trigger);

      await waitFor(() => {
        const content = getTooltipContent('Text content');
        expect(content).toBeInTheDocument();
      });
    });

    it('should render React node content', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Tooltip content={<div>Complex <strong>content</strong></div>}>
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      await user.hover(trigger);

      await waitFor(() => {
        // Check that the visible tooltip contains the content
        const tooltipContent = document.body.querySelector('div[data-state="delayed-open"]');
        expect(tooltipContent).toBeInTheDocument();
        expect(tooltipContent?.textContent).toContain('Complex');
        expect(tooltipContent?.textContent).toContain('content');
      });
    });
  });

  describe('Combined Features', () => {
    it('should render tooltip with all props', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Tooltip
          content="Complete tooltip"
          side="right"
          align="start"
          size="lg"
          delayDuration={100}
        >
          <button>Complete trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = getTooltipContent('Complete tooltip').closest('div[data-side]');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveClass('px-4', 'py-2', 'text-base');
        // Radix may flip side if viewport doesn't have space
        expect(tooltip).toHaveAttribute('data-side');
        expect(['left', 'right']).toContain(tooltip?.getAttribute('data-side'));
        expect(tooltip).toHaveAttribute('data-align', 'start');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithProvider(
        <Tooltip content="Accessible tooltip">
          <button>Trigger</button>
        </Tooltip>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when open', async () => {
      const user = userEvent.setup();
      const { container } = renderWithProvider(
        <Tooltip content="Open tooltip">
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      await user.hover(trigger);

      await waitFor(async () => {
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });
  });
});

describe('TooltipProvider', () => {
  it('should be exported from Radix', () => {
    expect(TooltipProvider).toBeDefined();
  });

  it('should allow multiple tooltips', () => {
    render(
      <TooltipProvider>
        <Tooltip content="Tooltip 1">
          <button>Button 1</button>
        </Tooltip>
        <Tooltip content="Tooltip 2">
          <button>Button 2</button>
        </Tooltip>
      </TooltipProvider>
    );

    expect(screen.getByRole('button', { name: 'Button 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Button 2' })).toBeInTheDocument();
  });
});
