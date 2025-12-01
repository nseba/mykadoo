import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Pagination } from './Pagination';

expect.extend(toHaveNoViolations);

describe('Pagination', () => {
  const onPageChange = jest.fn();

  beforeEach(() => {
    onPageChange.mockClear();
  });

  it('renders current page and total pages', () => {
    render(<Pagination currentPage={1} totalPages={10} onPageChange={onPageChange} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('calls onPageChange when page button is clicked', () => {
    render(<Pagination currentPage={1} totalPages={10} onPageChange={onPageChange} />);

    const page2Button = screen.getByLabelText('Go to page 2');
    fireEvent.click(page2Button);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange when next button is clicked', () => {
    render(<Pagination currentPage={1} totalPages={10} onPageChange={onPageChange} />);

    const nextButton = screen.getByLabelText('Go to next page');
    fireEvent.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange when previous button is clicked', () => {
    render(<Pagination currentPage={5} totalPages={10} onPageChange={onPageChange} />);

    const prevButton = screen.getByLabelText('Go to previous page');
    fireEvent.click(prevButton);

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('disables previous and first buttons on first page', () => {
    render(<Pagination currentPage={1} totalPages={10} onPageChange={onPageChange} />);

    const firstButton = screen.getByLabelText('Go to first page');
    const prevButton = screen.getByLabelText('Go to previous page');

    expect(firstButton).toBeDisabled();
    expect(prevButton).toBeDisabled();
  });

  it('disables next and last buttons on last page', () => {
    render(<Pagination currentPage={10} totalPages={10} onPageChange={onPageChange} />);

    const nextButton = screen.getByLabelText('Go to next page');
    const lastButton = screen.getByLabelText('Go to last page');

    expect(nextButton).toBeDisabled();
    expect(lastButton).toBeDisabled();
  });

  it('marks current page with aria-current', () => {
    render(<Pagination currentPage={5} totalPages={10} onPageChange={onPageChange} />);

    const currentPageButton = screen.getByLabelText('Go to page 5');
    expect(currentPageButton).toHaveAttribute('aria-current', 'page');
  });

  it('shows ellipsis for large page ranges', () => {
    render(<Pagination currentPage={10} totalPages={100} onPageChange={onPageChange} />);

    const ellipsis = screen.getAllByText('...');
    expect(ellipsis.length).toBeGreaterThan(0);
  });

  it('hides first/last buttons when showFirstLast is false', () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={10}
        onPageChange={onPageChange}
        showFirstLast={false}
      />
    );

    expect(screen.queryByLabelText('Go to first page')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Go to last page')).not.toBeInTheDocument();
  });

  it('hides previous/next buttons when showPreviousNext is false', () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={10}
        onPageChange={onPageChange}
        showPreviousNext={false}
      />
    );

    expect(screen.queryByLabelText('Go to previous page')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Go to next page')).not.toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <Pagination currentPage={5} totalPages={10} onPageChange={onPageChange} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
