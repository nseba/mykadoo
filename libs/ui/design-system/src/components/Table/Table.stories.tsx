import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
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

const meta: Meta<typeof Table> = {
  title: 'Components/Content/Table',
  component: Table,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Tables display structured data in rows and columns. They support sorting, different variants, hover states, and dense layouts. Ideal for displaying lists, reports, and data grids.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description: 'Table visual style',
      control: { type: 'select' },
      options: ['default', 'striped', 'bordered'],
    },
    hoverable: {
      description: 'Enable row hover effects',
      control: { type: 'boolean' },
    },
    dense: {
      description: 'Compact padding for dense layouts',
      control: { type: 'boolean' },
    },
    className: {
      description: 'Additional CSS classes',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer', status: 'Inactive' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', status: 'Active' },
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleData.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>{user.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const Striped: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody striped>
        {sampleData.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>{user.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Table with alternating row background colors for better readability.',
      },
    },
  },
};

export const Bordered: Story = {
  render: () => (
    <Table variant="bordered">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleData.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>{user.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Table with outer border for clear boundaries.',
      },
    },
  },
};

export const Hoverable: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody hoverable>
        {sampleData.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>{user.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Table with row hover effects for interactive feedback.',
      },
    },
  },
};

export const WithFooter: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Wireless Headphones</TableCell>
          <TableCell>2</TableCell>
          <TableCell className="text-right">$299.00</TableCell>
          <TableCell className="text-right">$598.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Phone Case</TableCell>
          <TableCell>1</TableCell>
          <TableCell className="text-right">$29.00</TableCell>
          <TableCell className="text-right">$29.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">USB Cable</TableCell>
          <TableCell>3</TableCell>
          <TableCell className="text-right">$12.00</TableCell>
          <TableCell className="text-right">$36.00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3} className="text-right">
            Subtotal
          </TableCell>
          <TableCell className="text-right">$663.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={3} className="text-right">
            Tax (8%)
          </TableCell>
          <TableCell className="text-right">$53.04</TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={3} className="text-right font-semibold">
            Total
          </TableCell>
          <TableCell className="text-right font-semibold">$716.04</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Table with footer section for totals and summary information.',
      },
    },
  },
};

export const WithCaption: Story = {
  render: () => (
    <Table>
      <TableCaption>A list of recent user registrations</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">John Doe</TableCell>
          <TableCell>john@example.com</TableCell>
          <TableCell>2024-03-15</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Jane Smith</TableCell>
          <TableCell>jane@example.com</TableCell>
          <TableCell>2024-03-14</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Table with caption describing the data.',
      },
    },
  },
};

export const Sortable: Story = {
  render: () => {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

    const handleSort = (column: string) => {
      if (sortColumn === column) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc');
        if (sortDirection === 'desc') setSortColumn(null);
      } else {
        setSortColumn(column);
        setSortDirection('asc');
      }
    };

    const sortedData = [...sampleData].sort((a, b) => {
      if (!sortColumn || !sortDirection) return 0;
      const aVal = a[sortColumn as keyof typeof a];
      const bVal = b[sortColumn as keyof typeof b];
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      return aVal > bVal ? multiplier : aVal < bVal ? -multiplier : 0;
    });

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              sortable
              sortDirection={sortColumn === 'name' ? sortDirection : null}
              onSort={() => handleSort('name')}
            >
              Name
            </TableHead>
            <TableHead
              sortable
              sortDirection={sortColumn === 'email' ? sortDirection : null}
              onSort={() => handleSort('email')}
            >
              Email
            </TableHead>
            <TableHead
              sortable
              sortDirection={sortColumn === 'role' ? sortDirection : null}
              onSort={() => handleSort('role')}
            >
              Role
            </TableHead>
            <TableHead
              sortable
              sortDirection={sortColumn === 'status' ? sortDirection : null}
              onSort={() => handleSort('status')}
            >
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody hoverable>
          {sortedData.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with sortable columns. Click column headers to sort.',
      },
    },
  },
};

export const WithSelection: Story = {
  render: () => {
    const [selected, setSelected] = useState<number[]>([]);

    const toggleSelect = (id: number) => {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    };

    const toggleSelectAll = () => {
      setSelected((prev) =>
        prev.length === sampleData.length ? [] : sampleData.map((u) => u.id)
      );
    };

    return (
      <div className="space-y-4">
        <div className="text-sm text-neutral-600">
          {selected.length} of {sampleData.length} selected
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selected.length === sampleData.length}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody hoverable>
            {sampleData.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.includes(user.id)}
                    onChange={() => toggleSelect(user.id)}
                    className="rounded"
                  />
                </TableCell>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with row selection checkboxes.',
      },
    },
  },
};

export const WithActions: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody hoverable>
        {sampleData.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <button className="px-3 py-1 text-xs bg-neutral-100 text-neutral-900 rounded hover:bg-neutral-200">
                  Edit
                </button>
                <button className="px-3 py-1 text-xs bg-error-100 text-error-700 rounded hover:bg-error-200">
                  Delete
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Table with action buttons in each row.',
      },
    },
  },
};

export const WithBadges: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody hoverable>
        {sampleData.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                {user.role}
              </span>
            </TableCell>
            <TableCell>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  user.status === 'Active'
                    ? 'bg-success-100 text-success-800'
                    : 'bg-neutral-100 text-neutral-800'
                }`}
              >
                {user.status}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Table with badge components for status and roles.',
      },
    },
  },
};

export const RealWorldOrderTable: Story = {
  render: () => {
    const orders = [
      { id: 'ORD-1234', customer: 'John Doe', date: '2024-03-15', total: 299.99, status: 'Delivered' },
      { id: 'ORD-1235', customer: 'Jane Smith', date: '2024-03-14', total: 149.50, status: 'Shipped' },
      { id: 'ORD-1236', customer: 'Bob Johnson', date: '2024-03-14', total: 89.99, status: 'Processing' },
      { id: 'ORD-1237', customer: 'Alice Brown', date: '2024-03-13', total: 459.00, status: 'Delivered' },
      { id: 'ORD-1238', customer: 'Charlie Davis', date: '2024-03-13', total: 199.99, status: 'Cancelled' },
    ];

    const statusColors = {
      Delivered: 'bg-success-100 text-success-800',
      Shipped: 'bg-info-100 text-info-800',
      Processing: 'bg-warning-100 text-warning-800',
      Cancelled: 'bg-error-100 text-error-800',
    };

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900">Recent Orders</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody hoverable>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell className="text-right font-medium">${order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status as keyof typeof statusColors]}`}>
                    {order.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <button className="text-sm text-primary-600 hover:text-primary-700">
                    View Details
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Order management table with status badges and action links.',
      },
    },
  },
};

export const RealWorldProductInventory: Story = {
  render: () => {
    const products = [
      { id: 1, name: 'Wireless Headphones', sku: 'WH-001', stock: 145, price: 299.99, category: 'Electronics' },
      { id: 2, name: 'Phone Case', sku: 'PC-002', stock: 8, price: 29.00, category: 'Accessories' },
      { id: 3, name: 'USB Cable', sku: 'UC-003', stock: 0, price: 12.00, category: 'Accessories' },
      { id: 4, name: 'Laptop Stand', sku: 'LS-004', stock: 67, price: 89.99, category: 'Office' },
      { id: 5, name: 'Wireless Mouse', sku: 'WM-005', stock: 234, price: 49.99, category: 'Electronics' },
    ];

    const getStockStatus = (stock: number) => {
      if (stock === 0) return { text: 'Out of Stock', color: 'text-error-600' };
      if (stock < 20) return { text: 'Low Stock', color: 'text-warning-600' };
      return { text: 'In Stock', color: 'text-success-600' };
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900">Product Inventory</h2>
          <button className="px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700">
            Add Product
          </button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody hoverable striped>
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-neutral-600">{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{product.stock}</TableCell>
                  <TableCell>
                    <span className={`text-sm font-medium ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button className="p-1 hover:bg-neutral-100 rounded">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="p-1 hover:bg-error-50 text-error-600 rounded">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Product inventory table with stock status indicators and inline actions.',
      },
    },
  },
};

export const RealWorldUserActivity: Story = {
  render: () => {
    const activities = [
      { user: 'John Doe', action: 'Created new project', timestamp: '2 minutes ago', avatar: 'https://i.pravatar.cc/150?img=1' },
      { user: 'Jane Smith', action: 'Updated profile settings', timestamp: '15 minutes ago', avatar: 'https://i.pravatar.cc/150?img=2' },
      { user: 'Bob Johnson', action: 'Uploaded 5 files', timestamp: '1 hour ago', avatar: 'https://i.pravatar.cc/150?img=3' },
      { user: 'Alice Brown', action: 'Commented on issue #42', timestamp: '3 hours ago', avatar: 'https://i.pravatar.cc/150?img=4' },
      { user: 'Charlie Davis', action: 'Merged pull request', timestamp: '5 hours ago', avatar: 'https://i.pravatar.cc/150?img=5' },
    ];

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900">Recent Activity</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody hoverable>
            {activities.map((activity, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={activity.avatar}
                      alt={activity.user}
                      className="h-8 w-8 rounded-full"
                    />
                    <span className="font-medium">{activity.user}</span>
                  </div>
                </TableCell>
                <TableCell className="text-neutral-600">{activity.action}</TableCell>
                <TableCell className="text-right text-sm text-neutral-500">
                  {activity.timestamp}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Activity log table with user avatars and timestamps.',
      },
    },
  },
};
