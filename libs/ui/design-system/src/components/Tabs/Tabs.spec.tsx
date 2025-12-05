import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Tabs, TabItem } from './Tabs';

expect.extend(toHaveNoViolations);

const mockItems: TabItem[] = [
  { value: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
  { value: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
  { value: 'tab3', label: 'Tab 3', content: <div>Content 3</div>, disabled: true },
];

describe('Tabs', () => {
  describe('Rendering', () => {
    it('should render all tab triggers', () => {
      render(<Tabs items={mockItems} />);

      expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeInTheDocument();
    });

    it('should render tab content', () => {
      render(<Tabs items={mockItems} />);

      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('should activate first tab by default', () => {
      render(<Tabs items={mockItems} />);

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      expect(tab1).toHaveAttribute('data-state', 'active');
    });

    it('should accept custom default value', () => {
      render(<Tabs items={mockItems} defaultValue="tab2" />);

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      expect(tab2).toHaveAttribute('data-state', 'active');
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render line variant', () => {
      const { container } = render(<Tabs items={mockItems} variant="line" />);
      const tabList = container.querySelector('[role="tablist"]');
      expect(tabList).toHaveClass('border-b');
    });

    it('should render enclosed variant', () => {
      const { container } = render(<Tabs items={mockItems} variant="enclosed" />);
      const tabList = container.querySelector('[role="tablist"]');
      expect(tabList).toHaveClass('bg-neutral-100');
    });

    it('should render soft variant', () => {
      render(<Tabs items={mockItems} variant="soft" />);
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      render(<Tabs items={mockItems} size="sm" />);
      const tab = screen.getByRole('tab', { name: 'Tab 1' });
      expect(tab).toHaveClass('text-sm');
    });

    it('should render medium size', () => {
      render(<Tabs items={mockItems} size="md" />);
      const tab = screen.getByRole('tab', { name: 'Tab 1' });
      expect(tab).toHaveClass('text-base');
    });

    it('should render large size', () => {
      render(<Tabs items={mockItems} size="lg" />);
      const tab = screen.getByRole('tab', { name: 'Tab 1' });
      expect(tab).toHaveClass('text-lg');
    });
  });

  describe('Orientation', () => {
    it('should render horizontal orientation by default', () => {
      const { container } = render(<Tabs items={mockItems} />);
      const tabList = container.querySelector('[role="tablist"]');
      expect(tabList).toHaveClass('flex-row');
    });

    it('should render vertical orientation', () => {
      const { container } = render(<Tabs items={mockItems} orientation="vertical" />);
      const tabList = container.querySelector('[role="tablist"]');
      expect(tabList).toHaveClass('flex-col');
    });
  });

  describe('Full Width', () => {
    it('should render full width tabs', () => {
      const { container } = render(<Tabs items={mockItems} fullWidth />);
      const tabList = container.querySelector('[role="tablist"]');
      expect(tabList).toHaveClass('w-full');
    });
  });

  describe('Interactions', () => {
    it('should switch tabs on click', async () => {
      const user = userEvent.setup();
      render(<Tabs items={mockItems} />);

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      await user.click(tab2);

      expect(tab2).toHaveAttribute('data-state', 'active');
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('should call onValueChange when tab changes', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Tabs items={mockItems} onValueChange={handleChange} />);

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      await user.click(tab2);

      expect(handleChange).toHaveBeenCalledWith('tab2');
    });

    it('should not switch to disabled tab', async () => {
      const user = userEvent.setup();
      render(<Tabs items={mockItems} />);

      const tab3 = screen.getByRole('tab', { name: 'Tab 3' });
      await user.click(tab3);

      expect(tab3).toHaveAttribute('data-state', 'inactive');
      expect(tab3).toBeDisabled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate tabs with arrow keys', async () => {
      const user = userEvent.setup();
      render(<Tabs items={mockItems} />);

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveFocus();
    });

    it('should skip disabled tabs with keyboard', async () => {
      const user = userEvent.setup();
      render(<Tabs items={mockItems} />);

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      tab2.focus();

      await user.keyboard('{ArrowRight}');
      // Should skip Tab 3 (disabled) and wrap to Tab 1
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveFocus();
    });
  });

  describe('Controlled Mode', () => {
    it('should work in controlled mode', async () => {
      const user = userEvent.setup();
      const ControlledTabs = () => {
        const [value, setValue] = React.useState('tab1');
        return <Tabs items={mockItems} value={value} onValueChange={setValue} />;
      };

      render(<ControlledTabs />);

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      await user.click(tab2);

      expect(tab2).toHaveAttribute('data-state', 'active');
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Tabs items={mockItems} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes', () => {
      const { container } = render(<Tabs items={mockItems} />);
      const tabList = container.querySelector('[role="tablist"]');
      expect(tabList).toHaveAttribute('aria-label', 'Tabs');
    });

    it('should indicate active tab', () => {
      render(<Tabs items={mockItems} defaultValue="tab2" />);
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      expect(tab2).toHaveAttribute('aria-selected', 'true');
    });

    it('should support keyboard focus', () => {
      render(<Tabs items={mockItems} />);
      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();
      expect(tab1).toHaveFocus();
    });
  });

  describe('Custom Styling', () => {
    it('should accept custom className', () => {
      const { container } = render(
        <Tabs items={mockItems} className="custom-tabs" />
      );
      expect(container.firstChild).toHaveClass('custom-tabs');
    });
  });
});
