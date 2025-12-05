import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Components/Navigation/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Pagination allows users to navigate through large sets of data by breaking content into multiple pages. Essential for tables, lists, and search results.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    currentPage: {
      description: 'Current active page (1-indexed)',
      control: { type: 'number', min: 1 },
    },
    totalPages: {
      description: 'Total number of pages',
      control: { type: 'number', min: 1 },
    },
    onPageChange: {
      description: 'Callback when page changes',
      action: 'page changed',
    },
    siblingCount: {
      description: 'Number of page buttons to show around current page',
      control: { type: 'number', min: 0, max: 3 },
    },
    size: {
      description: 'Size variant',
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    showFirstLast: {
      description: 'Show first and last page buttons',
      control: { type: 'boolean' },
    },
    showPreviousNext: {
      description: 'Show previous and next buttons',
      control: { type: 'boolean' },
    },
    className: {
      description: 'Additional CSS classes',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    onPageChange: (page) => console.log('Page:', page),
  },
};

export const SmallSize: Story = {
  args: {
    currentPage: 3,
    totalPages: 8,
    size: 'sm',
    onPageChange: (page) => console.log('Page:', page),
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact pagination for tight spaces or mobile views.',
      },
    },
  },
};

export const LargeSize: Story = {
  args: {
    currentPage: 4,
    totalPages: 10,
    size: 'lg',
    onPageChange: (page) => console.log('Page:', page),
  },
  parameters: {
    docs: {
      description: {
        story: 'Large pagination for better touch targets on mobile or emphasis.',
      },
    },
  },
};

export const FewPages: Story = {
  args: {
    currentPage: 2,
    totalPages: 5,
    onPageChange: (page) => console.log('Page:', page),
  },
  parameters: {
    docs: {
      description: {
        story: 'With only a few pages, all page numbers are displayed without ellipsis.',
      },
    },
  },
};

export const ManyPages: Story = {
  args: {
    currentPage: 15,
    totalPages: 50,
    onPageChange: (page) => console.log('Page:', page),
  },
  parameters: {
    docs: {
      description: {
        story: 'With many pages, ellipsis appears to condense the page numbers.',
      },
    },
  },
};

export const FirstPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    onPageChange: (page) => console.log('Page:', page),
  },
  parameters: {
    docs: {
      description: {
        story: 'At the first page, previous and first buttons are disabled.',
      },
    },
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10,
    onPageChange: (page) => console.log('Page:', page),
  },
  parameters: {
    docs: {
      description: {
        story: 'At the last page, next and last buttons are disabled.',
      },
    },
  },
};

export const WithoutFirstLast: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    showFirstLast: false,
    onPageChange: (page) => console.log('Page:', page),
  },
  parameters: {
    docs: {
      description: {
        story: 'Hide first/last buttons for a more compact pagination.',
      },
    },
  },
};

export const WithoutPreviousNext: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    showPreviousNext: false,
    onPageChange: (page) => console.log('Page:', page),
  },
  parameters: {
    docs: {
      description: {
        story: 'Hide previous/next buttons, showing only page numbers.',
      },
    },
  },
};

export const MinimalPagination: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    showFirstLast: false,
    showPreviousNext: false,
    onPageChange: (page) => console.log('Page:', page),
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal pagination with only page numbers.',
      },
    },
  },
};

export const CustomSiblingCount: Story = {
  args: {
    currentPage: 10,
    totalPages: 20,
    siblingCount: 2,
    onPageChange: (page) => console.log('Page:', page),
  },
  parameters: {
    docs: {
      description: {
        story: 'Show more pages around current page with increased sibling count.',
      },
    },
  },
};

export const Interactive: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 15;

    return (
      <div className="space-y-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
        <div className="text-center p-4 bg-neutral-50 rounded">
          <p className="text-sm text-neutral-600">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Showing {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, 150)} of 150 items
          </p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive pagination with state management showing items count.',
      },
    },
  },
};

export const RealWorldProductList: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 12;
    const itemsPerPage = 12;
    const totalItems = 142;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div className="max-w-4xl space-y-6">
        {/* Mock product grid */}
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: Math.min(itemsPerPage, totalItems - startItem + 1) }).map((_, i) => (
            <div key={i} className="aspect-square bg-neutral-100 rounded-lg flex items-center justify-center">
              <span className="text-neutral-400 text-sm">Product {startItem + i}</span>
            </div>
          ))}
        </div>

        {/* Results info */}
        <div className="text-sm text-neutral-600 text-center">
          Showing {startItem}-{endItem} of {totalItems} products
        </div>

        {/* Pagination */}
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            size="md"
          />
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'E-commerce product listing with pagination.',
      },
    },
  },
};

export const RealWorldTablePagination: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 8;

    return (
      <div className="max-w-3xl space-y-4">
        {/* Mock table */}
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-700">Order ID</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-700">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-700">Status</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-700">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-900">#ORD-{1000 + (currentPage - 1) * 10 + i}</td>
                  <td className="px-4 py-3 text-neutral-600">Customer {i + 1}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-success-100 text-success-700">
                      Completed
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-900 font-medium">
                    ${(Math.random() * 500 + 50).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-neutral-600">
            Page {currentPage} of {totalPages}
          </span>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            size="sm"
          />
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Data table with pagination for navigating through records.',
      },
    },
  },
};

export const RealWorldSearchResults: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 25;
    const resultsPerPage = 10;
    const totalResults = 248;

    return (
      <div className="max-w-2xl space-y-6">
        {/* Search header */}
        <div className="pb-4 border-b border-neutral-200">
          <p className="text-sm text-neutral-600">
            About {totalResults} results
          </p>
        </div>

        {/* Mock search results */}
        <div className="space-y-4">
          {Array.from({ length: resultsPerPage }).map((_, i) => (
            <div key={i} className="pb-4 border-b border-neutral-200 last:border-0">
              <h3 className="text-lg text-primary-600 hover:underline cursor-pointer mb-1">
                Search Result {(currentPage - 1) * resultsPerPage + i + 1}
              </h3>
              <p className="text-sm text-neutral-600 mb-1">
                www.example.com/page-{(currentPage - 1) * resultsPerPage + i + 1}
              </p>
              <p className="text-sm text-neutral-700">
                This is a brief description of the search result content that matches your query...
              </p>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            siblingCount={2}
          />
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Search results page with pagination for browsing through findings.',
      },
    },
  },
};
