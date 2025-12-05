import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Accordion, AccordionItem } from './Accordion';

expect.extend(toHaveNoViolations);

const mockItems: AccordionItem[] = [
  { value: 'item-1', title: 'First Item', content: 'First content' },
  { value: 'item-2', title: 'Second Item', content: 'Second content' },
  { value: 'item-3', title: 'Third Item', content: 'Third content' },
];

describe('Accordion', () => {
  describe('Rendering', () => {
    it('should render all accordion items', () => {
      render(<Accordion items={mockItems} />);
      expect(screen.getByText('First Item')).toBeInTheDocument();
      expect(screen.getByText('Second Item')).toBeInTheDocument();
      expect(screen.getByText('Third Item')).toBeInTheDocument();
    });

    it('should render item titles as buttons', () => {
      render(<Accordion items={mockItems} />);
      const firstButton = screen.getByText('First Item').closest('button');
      expect(firstButton).toBeInTheDocument();
      expect(firstButton).toHaveClass('flex', 'flex-1');
    });

    it('should hide content by default', () => {
      render(<Accordion items={mockItems} />);
      expect(screen.queryByText('First content')).not.toBeInTheDocument();
    });

    it('should render chevron icons', () => {
      const { container } = render(<Accordion items={mockItems} />);
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThanOrEqual(mockItems.length);
    });
  });

  describe('Type - Single', () => {
    it('should use single type by default', async () => {
      const user = userEvent.setup();
      render(<Accordion items={mockItems} />);

      const firstItem = screen.getByText('First Item');
      const secondItem = screen.getByText('Second Item');

      // Open first item
      await user.click(firstItem);
      await waitFor(() => {
        expect(screen.getByText('First content')).toBeInTheDocument();
      });

      // Open second item should close first
      await user.click(secondItem);
      await waitFor(() => {
        expect(screen.getByText('Second content')).toBeInTheDocument();
        expect(screen.queryByText('First content')).not.toBeInTheDocument();
      });
    });

    it('should allow only one item open at a time with type single', async () => {
      const user = userEvent.setup();
      render(<Accordion items={mockItems} type="single" />);

      await user.click(screen.getByText('First Item'));
      await user.click(screen.getByText('Second Item'));

      await waitFor(() => {
        expect(screen.getByText('Second content')).toBeInTheDocument();
        expect(screen.queryByText('First content')).not.toBeInTheDocument();
      });
    });

    it('should support collapsible single type', async () => {
      const user = userEvent.setup();
      render(<Accordion items={mockItems} type="single" collapsible />);

      const firstItem = screen.getByText('First Item');

      // Open
      await user.click(firstItem);
      await waitFor(() => {
        expect(screen.getByText('First content')).toBeInTheDocument();
      });

      // Close
      await user.click(firstItem);
      await waitFor(() => {
        expect(screen.queryByText('First content')).not.toBeInTheDocument();
      });
    });

    it('should be collapsible by default', async () => {
      const user = userEvent.setup();
      render(<Accordion items={mockItems} />);

      const firstItem = screen.getByText('First Item');

      await user.click(firstItem);
      await waitFor(() => {
        expect(screen.getByText('First content')).toBeInTheDocument();
      });

      await user.click(firstItem);
      await waitFor(() => {
        expect(screen.queryByText('First content')).not.toBeInTheDocument();
      });
    });
  });

  describe('Type - Multiple', () => {
    it('should allow multiple items open with type multiple', async () => {
      const user = userEvent.setup();
      render(<Accordion items={mockItems} type="multiple" />);

      await user.click(screen.getByText('First Item'));
      await user.click(screen.getByText('Second Item'));

      await waitFor(() => {
        expect(screen.getByText('First content')).toBeInTheDocument();
        expect(screen.getByText('Second content')).toBeInTheDocument();
      });
    });

    it('should toggle items independently with type multiple', async () => {
      const user = userEvent.setup();
      render(<Accordion items={mockItems} type="multiple" />);

      const firstItem = screen.getByText('First Item');

      // Open first
      await user.click(firstItem);
      await waitFor(() => {
        expect(screen.getByText('First content')).toBeInTheDocument();
      });

      // Close first
      await user.click(firstItem);
      await waitFor(() => {
        expect(screen.queryByText('First content')).not.toBeInTheDocument();
      });
    });
  });

  describe('Default Value', () => {
    it('should open item with defaultValue for single type', () => {
      render(<Accordion items={mockItems} defaultValue="item-2" />);
      expect(screen.getByText('Second content')).toBeInTheDocument();
    });

    it('should open multiple items with defaultValue for multiple type', () => {
      render(<Accordion items={mockItems} type="multiple" defaultValue={['item-1', 'item-3']} />);
      expect(screen.getByText('First content')).toBeInTheDocument();
      expect(screen.getByText('Third content')).toBeInTheDocument();
      expect(screen.queryByText('Second content')).not.toBeInTheDocument();
    });
  });

  describe('Controlled Value', () => {
    it('should support controlled value for single type', () => {
      const { rerender } = render(<Accordion items={mockItems} value="item-1" />);
      expect(screen.getByText('First content')).toBeInTheDocument();

      rerender(<Accordion items={mockItems} value="item-2" />);
      expect(screen.getByText('Second content')).toBeInTheDocument();
      expect(screen.queryByText('First content')).not.toBeInTheDocument();
    });

    it('should support controlled value for multiple type', () => {
      const { rerender } = render(
        <Accordion items={mockItems} type="multiple" value={['item-1']} />
      );
      expect(screen.getByText('First content')).toBeInTheDocument();

      rerender(<Accordion items={mockItems} type="multiple" value={['item-1', 'item-2']} />);
      expect(screen.getByText('First content')).toBeInTheDocument();
      expect(screen.getByText('Second content')).toBeInTheDocument();
    });

    it('should call onValueChange when value changes', async () => {
      const user = userEvent.setup();
      const handleValueChange = jest.fn();
      render(<Accordion items={mockItems} onValueChange={handleValueChange} />);

      await user.click(screen.getByText('First Item'));

      await waitFor(() => {
        expect(handleValueChange).toHaveBeenCalledWith('item-1');
      });
    });

    it('should call onValueChange with array for multiple type', async () => {
      const user = userEvent.setup();
      const handleValueChange = jest.fn();
      render(<Accordion items={mockItems} type="multiple" onValueChange={handleValueChange} />);

      await user.click(screen.getByText('First Item'));

      await waitFor(() => {
        expect(handleValueChange).toHaveBeenCalledWith(['item-1']);
      });
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      const { container } = render(<Accordion items={mockItems} variant="default" />);
      const accordion = container.firstChild as HTMLElement;
      expect(accordion).toHaveClass('space-y-2');
    });

    it('should render bordered variant', () => {
      const { container } = render(<Accordion items={mockItems} variant="bordered" />);
      const accordion = container.firstChild as HTMLElement;
      expect(accordion).toHaveClass('border', 'border-neutral-200', 'rounded-lg');
    });

    it('should render separated variant', () => {
      const { container } = render(<Accordion items={mockItems} variant="separated" />);
      const accordion = container.firstChild as HTMLElement;
      expect(accordion).toHaveClass('space-y-4');
    });

    it('should apply item styles for default variant', () => {
      const { container } = render(<Accordion items={mockItems} variant="default" />);
      const item = container.querySelector('[data-state]');
      expect(item).toHaveClass('border', 'border-neutral-200', 'rounded-md');
    });

    it('should apply item styles for separated variant', () => {
      const { container } = render(<Accordion items={mockItems} variant="separated" />);
      const item = container.querySelector('[data-state]');
      expect(item).toHaveClass('shadow-sm');
    });
  });

  describe('Disabled Items', () => {
    it('should render disabled item', () => {
      const disabledItems: AccordionItem[] = [
        { value: 'item-1', title: 'Enabled Item', content: 'Content' },
        { value: 'item-2', title: 'Disabled Item', content: 'Content', disabled: true },
      ];
      render(<Accordion items={disabledItems} />);

      const disabledButton = screen.getByText('Disabled Item').closest('button');
      expect(disabledButton).toBeDisabled();
    });

    it('should not open disabled item on click', async () => {
      const user = userEvent.setup();
      const disabledItems: AccordionItem[] = [
        { value: 'item-1', title: 'Disabled Item', content: 'Disabled content', disabled: true },
      ];
      render(<Accordion items={disabledItems} />);

      await user.click(screen.getByText('Disabled Item'));

      await waitFor(() => {
        expect(screen.queryByText('Disabled content')).not.toBeInTheDocument();
      });
    });

    it('should apply disabled styles', () => {
      const disabledItems: AccordionItem[] = [
        { value: 'item-1', title: 'Disabled', content: 'Content', disabled: true },
      ];
      const { container } = render(<Accordion items={disabledItems} />);

      const button = screen.getByText('Disabled').closest('button');
      expect(button).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });
  });

  describe('Animation', () => {
    it('should apply chevron rotation animation', async () => {
      const user = userEvent.setup();
      const { container } = render(<Accordion items={mockItems} />);

      const firstButton = screen.getByText('First Item').closest('button');
      const chevron = firstButton?.querySelector('svg');

      expect(chevron).toHaveClass('transition-transform', 'duration-200');

      await user.click(screen.getByText('First Item'));

      await waitFor(() => {
        expect(firstButton).toHaveClass('[&[data-state=open]>svg]:rotate-180');
      });
    });

    it('should apply content animation classes', () => {
      const { container } = render(<Accordion items={mockItems} defaultValue="item-1" />);
      const content = container.querySelector('[data-state=open]');
      const contentInner = content?.querySelector('.overflow-hidden');

      expect(contentInner).toHaveClass(
        'data-[state=closed]:animate-accordion-up',
        'data-[state=open]:animate-accordion-down'
      );
    });
  });

  describe('Interaction', () => {
    it('should expand item on click', async () => {
      const user = userEvent.setup();
      render(<Accordion items={mockItems} />);

      await user.click(screen.getByText('First Item'));

      await waitFor(() => {
        expect(screen.getByText('First content')).toBeInTheDocument();
      });
    });

    it('should show hover state on trigger', () => {
      render(<Accordion items={mockItems} />);
      const trigger = screen.getByText('First Item').closest('button');
      expect(trigger).toHaveClass('hover:bg-neutral-50');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Accordion items={mockItems} />);

      const firstButton = screen.getByText('First Item').closest('button');
      firstButton?.focus();
      expect(firstButton).toHaveFocus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('First content')).toBeInTheDocument();
      });
    });
  });

  describe('Complex Content', () => {
    it('should render React nodes as content', () => {
      const complexItems: AccordionItem[] = [
        {
          value: 'item-1',
          title: 'Complex Item',
          content: (
            <div>
              <h4>Heading</h4>
              <p>Paragraph</p>
              <button>Action</button>
            </div>
          ),
        },
      ];
      render(<Accordion items={complexItems} defaultValue="item-1" />);

      expect(screen.getByText('Heading')).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    it('should render string content', () => {
      render(<Accordion items={mockItems} defaultValue="item-1" />);
      expect(screen.getByText('First content')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className to root', () => {
      const { container } = render(<Accordion items={mockItems} className="custom-accordion" />);
      expect(container.firstChild).toHaveClass('custom-accordion');
    });

    it('should apply padding to trigger', () => {
      render(<Accordion items={mockItems} />);
      const trigger = screen.getByText('First Item').closest('button');
      expect(trigger).toHaveClass('px-4', 'py-3');
    });

    it('should apply padding to content', () => {
      const { container } = render(<Accordion items={mockItems} defaultValue="item-1" />);
      const contentWrapper = container.querySelector('.px-4.py-3.text-neutral-700');
      expect(contentWrapper).toBeInTheDocument();
    });

    it('should apply font styles to trigger', () => {
      render(<Accordion items={mockItems} />);
      const trigger = screen.getByText('First Item').closest('button');
      expect(trigger).toHaveClass('font-medium');
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Accordion items={mockItems} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when open', async () => {
      const { container } = render(<Accordion items={mockItems} defaultValue="item-1" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper focus styles', () => {
      render(<Accordion items={mockItems} />);
      const trigger = screen.getByText('First Item').closest('button');
      expect(trigger).toHaveClass(
        'focus:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-primary-500',
        'focus-visible:ring-offset-2'
      );
    });

    it('should support keyboard focus', () => {
      render(<Accordion items={mockItems} />);
      const firstButton = screen.getByText('First Item').closest('button');
      firstButton?.focus();
      expect(firstButton).toHaveFocus();
    });

    it('should render as semantic header element', () => {
      const { container } = render(<Accordion items={mockItems} />);
      const headers = container.querySelectorAll('h3[class*="flex"]');
      expect(headers.length).toBe(mockItems.length);
    });
  });

  describe('HTML Attributes', () => {
    it('should forward ref to accordion root', () => {
      const ref = React.createRef<React.ElementRef<typeof Accordion>>();
      render(<Accordion ref={ref} items={mockItems} />);
      expect(ref.current).toBeTruthy();
    });

    it('should render with data-state attributes', () => {
      const { container } = render(<Accordion items={mockItems} defaultValue="item-1" />);
      const openItem = container.querySelector('[data-state="open"]');
      const closedItem = container.querySelector('[data-state="closed"]');

      expect(openItem).toBeInTheDocument();
      expect(closedItem).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty items array', () => {
      const { container } = render(<Accordion items={[]} />);
      expect(container.firstChild?.childNodes.length).toBe(0);
    });

    it('should handle single item', () => {
      const singleItem: AccordionItem[] = [
        { value: 'only-item', title: 'Only Item', content: 'Only content' },
      ];
      render(<Accordion items={singleItem} />);
      expect(screen.getByText('Only Item')).toBeInTheDocument();
    });

    it('should handle items with same content', () => {
      const duplicateContent: AccordionItem[] = [
        { value: 'item-1', title: 'Item 1', content: 'Same content' },
        { value: 'item-2', title: 'Item 2', content: 'Same content' },
      ];
      render(<Accordion items={duplicateContent} type="multiple" defaultValue={['item-1', 'item-2']} />);
      const contents = screen.getAllByText('Same content');
      expect(contents).toHaveLength(2);
    });
  });
});
