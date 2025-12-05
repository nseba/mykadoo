import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from './Grid';

const meta: Meta<typeof Grid> = {
  title: 'Layout/Grid',
  component: Grid,
  tags: ['autodocs'],
  argTypes: {
    cols: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      description: 'Number of columns in the grid',
    },
    gap: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      description: 'Gap between grid items',
    },
    responsive: {
      control: 'object',
      description: 'Responsive column configuration',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Grid>;

const GridItem = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-coral-100 p-6 rounded-lg text-center ${className}`}>
    {children}
  </div>
);

export const Default: Story = {
  args: {
    children: (
      <>
        <GridItem>Item 1</GridItem>
        <GridItem>Item 2</GridItem>
        <GridItem>Item 3</GridItem>
      </>
    ),
  },
};

export const TwoColumns: Story = {
  args: {
    cols: 2,
    children: (
      <>
        <GridItem>Item 1</GridItem>
        <GridItem>Item 2</GridItem>
        <GridItem>Item 3</GridItem>
        <GridItem>Item 4</GridItem>
      </>
    ),
  },
};

export const ThreeColumns: Story = {
  args: {
    cols: 3,
    children: (
      <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <GridItem key={i}>Item {i}</GridItem>
        ))}
      </>
    ),
  },
};

export const FourColumns: Story = {
  args: {
    cols: 4,
    children: (
      <>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <GridItem key={i}>Item {i}</GridItem>
        ))}
      </>
    ),
  },
};

export const SixColumns: Story = {
  args: {
    cols: 6,
    children: (
      <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <GridItem key={i}>Item {i}</GridItem>
        ))}
      </>
    ),
  },
};

export const NoGap: Story = {
  args: {
    cols: 3,
    gap: 'none',
    children: (
      <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <GridItem key={i}>Item {i}</GridItem>
        ))}
      </>
    ),
  },
};

export const SmallGap: Story = {
  args: {
    cols: 3,
    gap: 'sm',
    children: (
      <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <GridItem key={i}>Item {i}</GridItem>
        ))}
      </>
    ),
  },
};

export const LargeGap: Story = {
  args: {
    cols: 3,
    gap: 'lg',
    children: (
      <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <GridItem key={i}>Item {i}</GridItem>
        ))}
      </>
    ),
  },
};

export const ExtraLargeGap: Story = {
  args: {
    cols: 3,
    gap: 'xl',
    children: (
      <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <GridItem key={i}>Item {i}</GridItem>
        ))}
      </>
    ),
  },
};

export const ResponsiveGrid: Story = {
  args: {
    cols: 1,
    responsive: {
      sm: 2,
      md: 3,
      lg: 4,
    },
    children: (
      <>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <GridItem key={i}>Item {i}</GridItem>
        ))}
      </>
    ),
  },
};

export const ResponsiveWithCustomBreakpoints: Story = {
  args: {
    cols: 1,
    responsive: {
      md: 2,
      xl: 4,
    },
    children: (
      <>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <GridItem key={i}>Item {i}</GridItem>
        ))}
      </>
    ),
  },
};

export const ProductGrid: Story = {
  render: () => (
    <Grid cols={1} gap="lg" responsive={{ sm: 2, md: 3, lg: 4 }}>
      {[
        'Wireless Headphones',
        'Smart Watch',
        'Coffee Maker',
        'Yoga Mat',
        'Travel Backpack',
        'Phone Case',
        'Water Bottle',
        'Desk Lamp',
      ].map((product, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-neutral-200 h-48 flex items-center justify-center">
            <span className="text-neutral-400">Product Image</span>
          </div>
          <div className="p-4">
            <h3 className="font-semibold mb-2">{product}</h3>
            <p className="text-sm text-neutral-600 mb-3">Perfect gift for any occasion</p>
            <div className="flex items-center justify-between">
              <span className="text-coral-600 font-bold">$29.99</span>
              <button className="bg-coral-500 text-white px-4 py-2 rounded text-sm hover:bg-coral-600">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </Grid>
  ),
};

export const ImageGallery: Story = {
  render: () => (
    <Grid cols={2} gap="sm" responsive={{ md: 3, lg: 4 }}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
        <div key={i} className="aspect-square bg-neutral-200 rounded-lg overflow-hidden">
          <img
            src={`https://via.placeholder.com/300x300?text=Image+${i}`}
            alt={`Gallery item ${i}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </Grid>
  ),
};

export const DashboardLayout: Story = {
  render: () => (
    <div className="space-y-6">
      <Grid cols={1} gap="md" responsive={{ md: 2, lg: 4 }}>
        {[
          { title: 'Total Revenue', value: '$12,345', change: '+12.5%', color: 'bg-blue-500' },
          { title: 'Total Orders', value: '1,234', change: '+8.2%', color: 'bg-coral-500' },
          { title: 'Active Users', value: '5,678', change: '+15.3%', color: 'bg-green-500' },
          { title: 'Conversion Rate', value: '3.2%', change: '+2.1%', color: 'bg-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-neutral-600">{stat.title}</h3>
              <div className={`w-10 h-10 ${stat.color} rounded-lg`} />
            </div>
            <p className="text-3xl font-bold mb-2">{stat.value}</p>
            <p className="text-sm text-green-600">{stat.change} vs last month</p>
          </div>
        ))}
      </Grid>

      <Grid cols={1} gap="md" responsive={{ lg: 2 }}>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 pb-3 border-b last:border-0">
                <div className="w-10 h-10 bg-coral-100 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Activity {i}</p>
                  <p className="text-xs text-neutral-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Top Products</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between pb-3 border-b last:border-0">
                <span className="text-sm">Product {i}</span>
                <span className="text-sm font-semibold">{100 - i * 10} sales</span>
              </div>
            ))}
          </div>
        </div>
      </Grid>
    </div>
  ),
};

export const BlogGrid: Story = {
  render: () => (
    <Grid cols={1} gap="lg" responsive={{ md: 2, xl: 3 }}>
      {[
        'The Ultimate Gift Guide 2025',
        'Top 10 Gifts for Tech Lovers',
        'Sustainable Gift Ideas',
        'Last-Minute Gift Solutions',
        'Corporate Gift Etiquette',
        'Personalized Gift Trends',
      ].map((title, i) => (
        <article key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-neutral-200 h-48 flex items-center justify-center">
            <span className="text-neutral-400">Featured Image</span>
          </div>
          <div className="p-6">
            <div className="text-xs text-coral-600 font-semibold mb-2">GIFT GUIDES</div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-neutral-600 text-sm mb-4">
              Discover amazing gift ideas that will make your loved ones smile.
              Our expert curators have selected the best options for every occasion.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">Dec 5, 2025</span>
              <a href="#" className="text-coral-600 text-sm font-semibold hover:underline">
                Read More →
              </a>
            </div>
          </div>
        </article>
      ))}
    </Grid>
  ),
};

export const MasonryStyleGrid: Story = {
  render: () => (
    <Grid cols={1} gap="md" responsive={{ sm: 2, lg: 3 }}>
      {[
        { height: 'h-48', title: 'Quick Tip 1' },
        { height: 'h-64', title: 'Featured Article' },
        { height: 'h-48', title: 'Quick Tip 2' },
        { height: 'h-72', title: 'In-Depth Guide' },
        { height: 'h-56', title: 'Medium Post' },
        { height: 'h-48', title: 'Quick Tip 3' },
      ].map((item, i) => (
        <div key={i} className={`bg-coral-100 rounded-lg p-6 ${item.height} flex items-center justify-center`}>
          <h3 className="text-lg font-semibold text-center">{item.title}</h3>
        </div>
      ))}
    </Grid>
  ),
};
