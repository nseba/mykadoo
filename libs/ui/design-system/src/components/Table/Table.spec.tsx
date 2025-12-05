import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from './Table';

expect.extend(toHaveNoViolations);

describe('Table', () => {
  describe('Rendering', () => {
    it('should render table element', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('should render with wrapper div', () => {
      const { container } = render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('w-full', 'overflow-auto');
    });

    it('should apply custom className', () => {
      render(
        <Table className="custom-table">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = screen.getByRole('table');
      expect(table).toHaveClass('custom-table');
    });

    it('should apply base styles', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = screen.getByRole('table');
      expect(table).toHaveClass('w-full', 'caption-bottom', 'text-sm');
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      render(
        <Table variant="default">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = screen.getByRole('table');
      expect(table).not.toHaveClass('border');
    });

    it('should render bordered variant', () => {
      render(
        <Table variant="bordered">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = screen.getByRole('table');
      expect(table).toHaveClass('border', 'border-neutral-200');
    });

    it('should render striped variant', () => {
      render(
        <Table variant="striped">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
  });

  describe('HTML Attributes', () => {
    it('should forward ref to table element', () => {
      const ref = React.createRef<HTMLTableElement>();
      render(
        <Table ref={ref}>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(ref.current).toBeInstanceOf(HTMLTableElement);
    });

    it('should spread additional props', () => {
      render(
        <Table data-testid="table-test">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByTestId('table-test')).toBeInTheDocument();
    });

    it('should support aria attributes', () => {
      render(
        <Table aria-label="Data table">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = screen.getByRole('table', { name: 'Data table' });
      expect(table).toHaveAttribute('aria-label', 'Data table');
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

describe('TableHeader', () => {
  describe('Rendering', () => {
    it('should render thead element', () => {
      const { container } = render(
        <table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </table>
      );
      const thead = container.querySelector('thead');
      expect(thead).toBeInTheDocument();
    });

    it('should apply background and border styles', () => {
      const { container } = render(
        <table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </table>
      );
      const thead = container.querySelector('thead');
      expect(thead).toHaveClass('border-b', 'border-neutral-200', 'bg-neutral-50');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <table>
          <TableHeader className="custom-header">
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </table>
      );
      const thead = container.querySelector('thead');
      expect(thead).toHaveClass('custom-header');
    });
  });

  describe('HTML Attributes', () => {
    it('should forward ref to thead element', () => {
      const ref = React.createRef<HTMLTableSectionElement>();
      render(
        <table>
          <TableHeader ref={ref}>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </table>
      );
      expect(ref.current).toBeInstanceOf(HTMLTableSectionElement);
      expect(ref.current?.tagName).toBe('THEAD');
    });

    it('should spread additional props', () => {
      const { container } = render(
        <table>
          <TableHeader data-testid="header-test">
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </table>
      );
      expect(container.querySelector('[data-testid="header-test"]')).toBeInTheDocument();
    });
  });
});

describe('TableBody', () => {
  describe('Rendering', () => {
    it('should render tbody element', () => {
      const { container } = render(
        <table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </table>
      );
      const tbody = container.querySelector('tbody');
      expect(tbody).toBeInTheDocument();
    });

    it('should not apply striped styles by default', () => {
      const { container } = render(
        <table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </table>
      );
      const tbody = container.querySelector('tbody');
      expect(tbody).not.toHaveClass('[&_tr:nth-child(even)]:bg-neutral-50');
    });

    it('should apply striped styles when striped is true', () => {
      const { container } = render(
        <table>
          <TableBody striped>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </table>
      );
      const tbody = container.querySelector('tbody');
      expect(tbody).toHaveClass('[&_tr:nth-child(even)]:bg-neutral-50');
    });

    it('should not apply hover styles by default', () => {
      const { container } = render(
        <table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </table>
      );
      const tbody = container.querySelector('tbody');
      expect(tbody).not.toHaveClass('[&_tr]:hover:bg-neutral-100');
    });

    it('should apply hover styles when hoverable is true', () => {
      const { container } = render(
        <table>
          <TableBody hoverable>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </table>
      );
      const tbody = container.querySelector('tbody');
      expect(tbody).toHaveClass(
        '[&_tr]:hover:bg-neutral-100',
        '[&_tr]:transition-colors'
      );
    });

    it('should apply both striped and hoverable styles', () => {
      const { container } = render(
        <table>
          <TableBody striped hoverable>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </table>
      );
      const tbody = container.querySelector('tbody');
      expect(tbody).toHaveClass('[&_tr:nth-child(even)]:bg-neutral-50');
      expect(tbody).toHaveClass('[&_tr]:hover:bg-neutral-100');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <table>
          <TableBody className="custom-body">
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </table>
      );
      const tbody = container.querySelector('tbody');
      expect(tbody).toHaveClass('custom-body');
    });
  });

  describe('HTML Attributes', () => {
    it('should forward ref to tbody element', () => {
      const ref = React.createRef<HTMLTableSectionElement>();
      render(
        <table>
          <TableBody ref={ref}>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </table>
      );
      expect(ref.current).toBeInstanceOf(HTMLTableSectionElement);
      expect(ref.current?.tagName).toBe('TBODY');
    });

    it('should spread additional props', () => {
      const { container } = render(
        <table>
          <TableBody data-testid="body-test">
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </table>
      );
      expect(container.querySelector('[data-testid="body-test"]')).toBeInTheDocument();
    });
  });
});

describe('TableFooter', () => {
  describe('Rendering', () => {
    it('should render tfoot element', () => {
      const { container } = render(
        <table>
          <TableFooter>
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </table>
      );
      const tfoot = container.querySelector('tfoot');
      expect(tfoot).toBeInTheDocument();
    });

    it('should apply styles', () => {
      const { container } = render(
        <table>
          <TableFooter>
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </table>
      );
      const tfoot = container.querySelector('tfoot');
      expect(tfoot).toHaveClass('border-t', 'border-neutral-200', 'bg-neutral-50', 'font-medium');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <table>
          <TableFooter className="custom-footer">
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </table>
      );
      const tfoot = container.querySelector('tfoot');
      expect(tfoot).toHaveClass('custom-footer');
    });
  });

  describe('HTML Attributes', () => {
    it('should forward ref to tfoot element', () => {
      const ref = React.createRef<HTMLTableSectionElement>();
      render(
        <table>
          <TableFooter ref={ref}>
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </table>
      );
      expect(ref.current).toBeInstanceOf(HTMLTableSectionElement);
      expect(ref.current?.tagName).toBe('TFOOT');
    });

    it('should spread additional props', () => {
      const { container } = render(
        <table>
          <TableFooter data-testid="footer-test">
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </table>
      );
      expect(container.querySelector('[data-testid="footer-test"]')).toBeInTheDocument();
    });
  });
});

describe('TableRow', () => {
  describe('Rendering', () => {
    it('should render tr element', () => {
      const { container } = render(
        <table>
          <tbody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </tbody>
        </table>
      );
      const tr = container.querySelector('tr');
      expect(tr).toBeInTheDocument();
    });

    it('should apply border styles', () => {
      const { container } = render(
        <table>
          <tbody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </tbody>
        </table>
      );
      const tr = container.querySelector('tr');
      expect(tr).toHaveClass('border-b', 'border-neutral-200');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <table>
          <tbody>
            <TableRow className="custom-row">
              <TableCell>Cell</TableCell>
            </TableRow>
          </tbody>
        </table>
      );
      const tr = container.querySelector('tr');
      expect(tr).toHaveClass('custom-row');
    });
  });

  describe('HTML Attributes', () => {
    it('should forward ref to tr element', () => {
      const ref = React.createRef<HTMLTableRowElement>();
      render(
        <table>
          <tbody>
            <TableRow ref={ref}>
              <TableCell>Cell</TableCell>
            </TableRow>
          </tbody>
        </table>
      );
      expect(ref.current).toBeInstanceOf(HTMLTableRowElement);
    });

    it('should spread additional props', () => {
      const { container } = render(
        <table>
          <tbody>
            <TableRow data-testid="row-test">
              <TableCell>Cell</TableCell>
            </TableRow>
          </tbody>
        </table>
      );
      expect(container.querySelector('[data-testid="row-test"]')).toBeInTheDocument();
    });

    it('should support onClick handler', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      const { container } = render(
        <table>
          <tbody>
            <TableRow onClick={handleClick}>
              <TableCell>Clickable</TableCell>
            </TableRow>
          </tbody>
        </table>
      );

      const row = container.querySelector('tr') as HTMLElement;
      await user.click(row);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});

describe('TableHead', () => {
  describe('Rendering', () => {
    it('should render th element', () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <TableHead>Header</TableHead>
            </tr>
          </thead>
        </table>
      );
      const th = container.querySelector('th');
      expect(th).toBeInTheDocument();
    });

    it('should render content in div by default', () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <TableHead>Header</TableHead>
            </tr>
          </thead>
        </table>
      );
      const div = container.querySelector('th > div');
      expect(div).toBeInTheDocument();
    });

    it('should apply base styles', () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <TableHead>Header</TableHead>
            </tr>
          </thead>
        </table>
      );
      const th = container.querySelector('th');
      expect(th).toHaveClass('h-12', 'px-4', 'text-left', 'align-middle', 'font-medium', 'text-neutral-700');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <TableHead className="custom-head">Header</TableHead>
            </tr>
          </thead>
        </table>
      );
      const th = container.querySelector('th');
      expect(th).toHaveClass('custom-head');
    });
  });

  describe('Sortable', () => {
    it('should render as button when sortable', () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <TableHead sortable>Sortable Header</TableHead>
            </tr>
          </thead>
        </table>
      );
      const button = container.querySelector('th > button');
      expect(button).toBeInTheDocument();
    });

    it('should apply cursor pointer when sortable', () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <TableHead sortable>Sortable</TableHead>
            </tr>
          </thead>
        </table>
      );
      const th = container.querySelector('th');
      expect(th).toHaveClass('cursor-pointer', 'select-none');
    });

    it('should call onSort when clicked', async () => {
      const user = userEvent.setup();
      const handleSort = jest.fn();
      const { container } = render(
        <table>
          <thead>
            <tr>
              <TableHead sortable onSort={handleSort}>
                Sortable
              </TableHead>
            </tr>
          </thead>
        </table>
      );

      const button = container.querySelector('th > button') as HTMLElement;
      await user.click(button);

      expect(handleSort).toHaveBeenCalledTimes(1);
    });

    it('should render sort icon when sortable', () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <TableHead sortable>Sortable</TableHead>
            </tr>
          </thead>
        </table>
      );
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-4', 'w-4', 'transition-transform');
    });

    it('should show sort direction with ascending', () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <TableHead sortable sortDirection="asc">
                Ascending
              </TableHead>
            </tr>
          </thead>
        </table>
      );
      const icon = container.querySelector('svg');
      expect(icon).not.toHaveClass('rotate-180');
      expect(icon).not.toHaveClass('opacity-30');
    });

    it('should show sort direction with descending', () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <TableHead sortable sortDirection="desc">
                Descending
              </TableHead>
            </tr>
          </thead>
        </table>
      );
      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('rotate-180');
    });

    it('should show inactive sort icon when no direction', () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <TableHead sortable sortDirection={null}>
                Not Sorted
              </TableHead>
            </tr>
          </thead>
        </table>
      );
      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('opacity-30');
    });
  });

  describe('HTML Attributes', () => {
    it('should forward ref to th element', () => {
      const ref = React.createRef<HTMLTableCellElement>();
      render(
        <table>
          <thead>
            <tr>
              <TableHead ref={ref}>Header</TableHead>
            </tr>
          </thead>
        </table>
      );
      expect(ref.current).toBeInstanceOf(HTMLTableCellElement);
      expect(ref.current?.tagName).toBe('TH');
    });

    it('should spread additional props', () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <TableHead data-testid="head-test">Header</TableHead>
            </tr>
          </thead>
        </table>
      );
      expect(container.querySelector('[data-testid="head-test"]')).toBeInTheDocument();
    });

    it('should support scope attribute', () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <TableHead scope="col">Header</TableHead>
            </tr>
          </thead>
        </table>
      );
      const th = container.querySelector('th');
      expect(th).toHaveAttribute('scope', 'col');
    });
  });
});

describe('TableCell', () => {
  describe('Rendering', () => {
    it('should render td element', () => {
      const { container } = render(
        <table>
          <tbody>
            <tr>
              <TableCell>Cell content</TableCell>
            </tr>
          </tbody>
        </table>
      );
      const td = container.querySelector('td');
      expect(td).toBeInTheDocument();
    });

    it('should apply base styles', () => {
      const { container } = render(
        <table>
          <tbody>
            <tr>
              <TableCell>Cell</TableCell>
            </tr>
          </tbody>
        </table>
      );
      const td = container.querySelector('td');
      expect(td).toHaveClass('p-4', 'align-middle');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <table>
          <tbody>
            <tr>
              <TableCell className="custom-cell">Cell</TableCell>
            </tr>
          </tbody>
        </table>
      );
      const td = container.querySelector('td');
      expect(td).toHaveClass('custom-cell');
    });

    it('should render children', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell>
                <div>Complex content</div>
              </TableCell>
            </tr>
          </tbody>
        </table>
      );
      expect(screen.getByText('Complex content')).toBeInTheDocument();
    });
  });

  describe('HTML Attributes', () => {
    it('should forward ref to td element', () => {
      const ref = React.createRef<HTMLTableCellElement>();
      render(
        <table>
          <tbody>
            <tr>
              <TableCell ref={ref}>Cell</TableCell>
            </tr>
          </tbody>
        </table>
      );
      expect(ref.current).toBeInstanceOf(HTMLTableCellElement);
      expect(ref.current?.tagName).toBe('TD');
    });

    it('should spread additional props', () => {
      const { container } = render(
        <table>
          <tbody>
            <tr>
              <TableCell data-testid="cell-test">Cell</TableCell>
            </tr>
          </tbody>
        </table>
      );
      expect(container.querySelector('[data-testid="cell-test"]')).toBeInTheDocument();
    });

    it('should support colSpan attribute', () => {
      const { container } = render(
        <table>
          <tbody>
            <tr>
              <TableCell colSpan={2}>Spanning cell</TableCell>
            </tr>
          </tbody>
        </table>
      );
      const td = container.querySelector('td');
      expect(td).toHaveAttribute('colSpan', '2');
    });

    it('should support rowSpan attribute', () => {
      const { container } = render(
        <table>
          <tbody>
            <tr>
              <TableCell rowSpan={2}>Spanning cell</TableCell>
            </tr>
          </tbody>
        </table>
      );
      const td = container.querySelector('td');
      expect(td).toHaveAttribute('rowSpan', '2');
    });
  });
});

describe('TableCaption', () => {
  describe('Rendering', () => {
    it('should render caption element', () => {
      const { container } = render(
        <table>
          <TableCaption>Table caption</TableCaption>
          <tbody>
            <tr>
              <td>Cell</td>
            </tr>
          </tbody>
        </table>
      );
      const caption = container.querySelector('caption');
      expect(caption).toBeInTheDocument();
    });

    it('should apply styles', () => {
      const { container } = render(
        <table>
          <TableCaption>Caption</TableCaption>
          <tbody>
            <tr>
              <td>Cell</td>
            </tr>
          </tbody>
        </table>
      );
      const caption = container.querySelector('caption');
      expect(caption).toHaveClass('mt-4', 'text-sm', 'text-neutral-600');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <table>
          <TableCaption className="custom-caption">Caption</TableCaption>
          <tbody>
            <tr>
              <td>Cell</td>
            </tr>
          </tbody>
        </table>
      );
      const caption = container.querySelector('caption');
      expect(caption).toHaveClass('custom-caption');
    });
  });

  describe('HTML Attributes', () => {
    it('should forward ref to caption element', () => {
      const ref = React.createRef<HTMLTableCaptionElement>();
      render(
        <table>
          <TableCaption ref={ref}>Caption</TableCaption>
          <tbody>
            <tr>
              <td>Cell</td>
            </tr>
          </tbody>
        </table>
      );
      expect(ref.current).toBeInstanceOf(HTMLTableCaptionElement);
    });

    it('should spread additional props', () => {
      const { container } = render(
        <table>
          <TableCaption data-testid="caption-test">Caption</TableCaption>
          <tbody>
            <tr>
              <td>Cell</td>
            </tr>
          </tbody>
        </table>
      );
      expect(container.querySelector('[data-testid="caption-test"]')).toBeInTheDocument();
    });
  });
});

describe('Complete Table Integration', () => {
  it('should render complete table structure', () => {
    render(
      <Table>
        <TableCaption>User Data</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead sortable sortDirection="asc" onSort={() => {}}>
              Age
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody striped hoverable>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>john@example.com</TableCell>
            <TableCell>30</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Jane Smith</TableCell>
            <TableCell>jane@example.com</TableCell>
            <TableCell>25</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total Users</TableCell>
            <TableCell>2</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    expect(screen.getByText('User Data')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
  });

  it('should have no accessibility violations with complete structure', async () => {
    const { container } = render(
      <Table>
        <TableCaption>Accessible Table</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Column 1</TableHead>
            <TableHead scope="col">Column 2</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Data 1</TableCell>
            <TableCell>Data 2</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should support interactive features', async () => {
    const user = userEvent.setup();
    const handleSort = jest.fn();
    const handleRowClick = jest.fn();

    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable onSort={handleSort}>
              Sortable Column
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody hoverable>
          <TableRow onClick={handleRowClick}>
            <TableCell>Interactive Row</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const sortButton = screen.getByText('Sortable Column').closest('button') as HTMLElement;
    await user.click(sortButton);
    expect(handleSort).toHaveBeenCalledTimes(1);

    const { container } = render(
      <table>
        <tbody>
          <TableRow onClick={handleRowClick}>
            <TableCell>Click me</TableCell>
          </TableRow>
        </tbody>
      </table>
    );
    const row = container.querySelector('tr') as HTMLElement;
    await user.click(row);
    expect(handleRowClick).toHaveBeenCalled();
  });
});
