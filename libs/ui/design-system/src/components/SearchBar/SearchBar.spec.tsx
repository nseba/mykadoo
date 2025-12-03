import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SearchBar } from './SearchBar';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('SearchBar', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      expect(input).toBeInTheDocument();
    });

    it('renders search icon', () => {
      const { container } = render(<SearchBar />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      render(<SearchBar placeholder="Search products..." />);
      const input = screen.getByPlaceholderText('Search products...');
      expect(input).toBeInTheDocument();
    });

    it('does not show search button by default', () => {
      render(<SearchBar />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('shows search button when showButton is true', () => {
      render(<SearchBar showButton />);
      const button = screen.getByRole('button', { name: /search/i });
      expect(button).toBeInTheDocument();
    });

    it('renders button with custom text', () => {
      render(<SearchBar showButton buttonText="Find" />);
      const button = screen.getByRole('button', { name: /find/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      render(<SearchBar size="sm" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveClass('text-sm');
    });

    it('renders medium size (default)', () => {
      render(<SearchBar size="md" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveClass('text-base');
    });

    it('renders large size', () => {
      render(<SearchBar size="lg" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveClass('text-lg');
    });
  });

  describe('Search interactions', () => {
    it('calls onSearch when Enter key is pressed', async () => {
      const handleSearch = jest.fn();
      const user = userEvent.setup();

      render(<SearchBar onSearch={handleSearch} />);
      const input = screen.getByRole('searchbox');

      await user.type(input, 'search query');
      await user.keyboard('{Enter}');

      expect(handleSearch).toHaveBeenCalledWith('search query');
    });

    it('calls onSearch when search button is clicked', async () => {
      const handleSearch = jest.fn();
      const user = userEvent.setup();

      render(<SearchBar showButton onSearch={handleSearch} />);
      const input = screen.getByRole('searchbox');
      const button = screen.getByRole('button', { name: /search/i });

      await user.type(input, 'test search');
      await user.click(button);

      expect(handleSearch).toHaveBeenCalledWith('test search');
    });

    it('calls onChange when input value changes', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<SearchBar onChange={handleChange} />);
      const input = screen.getByRole('searchbox');

      await user.type(input, 'a');

      expect(handleChange).toHaveBeenCalled();
    });

    it('does not call onSearch when Enter is pressed in disabled state', async () => {
      const handleSearch = jest.fn();
      const user = userEvent.setup();

      render(<SearchBar disabled onSearch={handleSearch} />);
      const input = screen.getByRole('searchbox');

      await user.type(input, 'query');
      await user.keyboard('{Enter}');

      expect(handleSearch).not.toHaveBeenCalled();
    });

    it('search button is disabled when input is disabled', () => {
      render(<SearchBar showButton disabled />);
      const button = screen.getByRole('button', { name: /search/i });
      expect(button).toBeDisabled();
    });

    it('prevents default form submission on Enter', async () => {
      const handleSearch = jest.fn();
      const handleSubmit = jest.fn((e) => e.preventDefault());
      const user = userEvent.setup();

      render(
        <form onSubmit={handleSubmit}>
          <SearchBar onSearch={handleSearch} />
        </form>
      );
      const input = screen.getByRole('searchbox');

      await user.type(input, 'query');
      await user.keyboard('{Enter}');

      expect(handleSearch).toHaveBeenCalledWith('query');
      // Form should not have submitted due to preventDefault
      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Controlled/Uncontrolled', () => {
    it('supports controlled value', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      const { rerender } = render(
        <SearchBar value="initial" onChange={handleChange} />
      );
      const input = screen.getByRole('searchbox') as HTMLInputElement;
      expect(input.value).toBe('initial');

      await user.type(input, ' updated');

      rerender(<SearchBar value="initial updated" onChange={handleChange} />);
      expect(input.value).toBe('initial updated');
    });

    it('supports defaultValue', () => {
      render(<SearchBar defaultValue="default search" />);
      const input = screen.getByRole('searchbox') as HTMLInputElement;
      expect(input.value).toBe('default search');
    });

    it('uses internal state when uncontrolled', async () => {
      const user = userEvent.setup();

      render(<SearchBar />);
      const input = screen.getByRole('searchbox') as HTMLInputElement;

      await user.type(input, 'test');
      expect(input.value).toBe('test');
    });
  });

  describe('States', () => {
    it('handles disabled state', () => {
      render(<SearchBar disabled />);
      const input = screen.getByRole('searchbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:bg-neutral-100');
    });

    it('applies focus styles on focus', async () => {
      const user = userEvent.setup();

      render(<SearchBar />);
      const input = screen.getByRole('searchbox');

      await user.click(input);
      expect(input).toHaveFocus();
      expect(input).toHaveClass('focus:ring-primary-500');
    });
  });

  describe('Keyboard support', () => {
    it('triggers search on Enter key', async () => {
      const handleSearch = jest.fn();
      const user = userEvent.setup();

      render(<SearchBar onSearch={handleSearch} />);
      const input = screen.getByRole('searchbox');

      await user.type(input, 'search term');
      await user.keyboard('{Enter}');

      expect(handleSearch).toHaveBeenCalledWith('search term');
      expect(handleSearch).toHaveBeenCalledTimes(1);
    });

    it('calls onKeyDown prop when provided', async () => {
      const handleKeyDown = jest.fn();
      const user = userEvent.setup();

      render(<SearchBar onKeyDown={handleKeyDown} />);
      const input = screen.getByRole('searchbox');

      await user.type(input, 'a');

      expect(handleKeyDown).toHaveBeenCalled();
    });

    it('allows custom onKeyDown to work alongside Enter handling', async () => {
      const handleKeyDown = jest.fn();
      const handleSearch = jest.fn();
      const user = userEvent.setup();

      render(
        <SearchBar onKeyDown={handleKeyDown} onSearch={handleSearch} />
      );
      const input = screen.getByRole('searchbox');

      await user.type(input, 'query');
      await user.keyboard('{Enter}');

      expect(handleKeyDown).toHaveBeenCalled();
      expect(handleSearch).toHaveBeenCalledWith('query');
    });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<SearchBar />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations (with button)', async () => {
      const { container } = render(<SearchBar showButton />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations (disabled)', async () => {
      const { container } = render(<SearchBar disabled />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper input type', () => {
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('type', 'search');
    });

    it('has accessible search role', () => {
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Custom styling', () => {
    it('applies custom className to input', () => {
      render(<SearchBar className="custom-search" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveClass('custom-search');
    });

    it('applies custom wrapperClassName', () => {
      const { container } = render(
        <SearchBar wrapperClassName="custom-wrapper" />
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-wrapper');
    });
  });

  describe('HTML attributes', () => {
    it('supports all standard input attributes', () => {
      render(
        <SearchBar
          name="search"
          autoComplete="off"
          autoFocus
          aria-label="Search input"
        />
      );
      const input = screen.getByRole('searchbox');

      expect(input).toHaveAttribute('name', 'search');
      expect(input).toHaveAttribute('autocomplete', 'off');
      expect(input).toHaveFocus();
      expect(input).toHaveAttribute('aria-label', 'Search input');
    });
  });

  describe('Search button styling', () => {
    it('applies correct button styles', () => {
      render(<SearchBar showButton />);
      const button = screen.getByRole('button', { name: /search/i });

      expect(button).toHaveClass('bg-primary-500');
      expect(button).toHaveClass('hover:bg-primary-600');
      expect(button).toHaveClass('active:bg-primary-700');
    });

    it('positions button correctly inside input', () => {
      render(<SearchBar showButton />);
      const button = screen.getByRole('button', { name: /search/i });

      expect(button).toHaveClass('absolute', 'right-1');
    });
  });
});
