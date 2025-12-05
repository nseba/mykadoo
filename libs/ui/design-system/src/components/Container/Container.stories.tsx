import type { Meta, StoryObj } from '@storybook/react';
import { Container } from './Container';

const meta: Meta<typeof Container> = {
  title: 'Layout/Container',
  component: Container,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', '2xl', 'full'],
      description: 'Maximum width of the container',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Horizontal padding',
    },
    centered: {
      control: 'boolean',
      description: 'Center the container horizontally',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Container>;

export const Default: Story = {
  args: {
    children: (
      <div className="bg-coral-100 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Default Container</h2>
        <p className="text-neutral-600">
          This is a default container with lg max-width, md padding, and centered alignment.
          The container provides a consistent width wrapper for your content across different screen sizes.
        </p>
      </div>
    ),
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: (
      <div className="bg-blue-100 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-3">Small Container</h3>
        <p className="text-neutral-600">
          Max-width: 640px - Perfect for narrow content like blog posts or forms.
        </p>
      </div>
    ),
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    children: (
      <div className="bg-blue-100 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-3">Medium Container</h3>
        <p className="text-neutral-600">
          Max-width: 768px - Ideal for articles and single-column layouts.
        </p>
      </div>
    ),
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: (
      <div className="bg-blue-100 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-3">Large Container</h3>
        <p className="text-neutral-600">
          Max-width: 1024px - Great for general content and multi-column layouts.
        </p>
      </div>
    ),
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    children: (
      <div className="bg-blue-100 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-3">Extra Large Container</h3>
        <p className="text-neutral-600">
          Max-width: 1280px - Suitable for wide content and dashboard layouts.
        </p>
      </div>
    ),
  },
};

export const ExtraExtraLarge: Story = {
  args: {
    size: '2xl',
    children: (
      <div className="bg-blue-100 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-3">2XL Container</h3>
        <p className="text-neutral-600">
          Max-width: 1536px - For very wide layouts on large screens.
        </p>
      </div>
    ),
  },
};

export const FullWidth: Story = {
  args: {
    size: 'full',
    children: (
      <div className="bg-blue-100 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-3">Full Width Container</h3>
        <p className="text-neutral-600">
          No max-width constraint - Spans the entire available width.
        </p>
      </div>
    ),
  },
};

export const NoPadding: Story = {
  args: {
    padding: 'none',
    children: (
      <div className="bg-coral-100 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-3">No Padding</h3>
        <p className="text-neutral-600">
          Container with no horizontal padding - content extends to edges.
        </p>
      </div>
    ),
  },
};

export const SmallPadding: Story = {
  args: {
    padding: 'sm',
    children: (
      <div className="bg-coral-100 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-3">Small Padding (16px)</h3>
        <p className="text-neutral-600">
          Compact padding for mobile-first designs.
        </p>
      </div>
    ),
  },
};

export const LargePadding: Story = {
  args: {
    padding: 'lg',
    children: (
      <div className="bg-coral-100 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-3">Large Padding (32px)</h3>
        <p className="text-neutral-600">
          Generous padding for spacious layouts.
        </p>
      </div>
    ),
  },
};

export const NotCentered: Story = {
  args: {
    centered: false,
    children: (
      <div className="bg-blue-100 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-3">Not Centered</h3>
        <p className="text-neutral-600">
          Container aligned to the left without auto margins.
        </p>
      </div>
    ),
  },
};

export const PageLayout: Story = {
  render: () => (
    <div className="min-h-screen bg-neutral-50">
      <Container padding="lg" className="py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h1 className="text-4xl font-bold text-coral-600 mb-4">Welcome to Mykadoo</h1>
          <p className="text-lg text-neutral-600 mb-6">
            Find the perfect gift for your loved ones with our AI-powered gift search engine.
          </p>
          <button className="bg-coral-500 text-white px-6 py-3 rounded-lg hover:bg-coral-600">
            Start Searching
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-3">Feature {i}</h3>
              <p className="text-neutral-600">
                Discover amazing features that help you find the perfect gift.
              </p>
            </div>
          ))}
        </div>
      </Container>
    </div>
  ),
};

export const ArticleLayout: Story = {
  render: () => (
    <Container size="md" padding="lg" className="py-12">
      <article className="prose max-w-none">
        <h1 className="text-4xl font-bold mb-4">Gift Giving Guide 2025</h1>
        <p className="text-neutral-500 mb-8">Published on December 5, 2025</p>
        <div className="bg-neutral-100 rounded-lg p-6 mb-8">
          <img
            src="https://via.placeholder.com/800x400"
            alt="Gift guide hero"
            className="w-full rounded-lg mb-4"
          />
        </div>
        <p className="text-lg text-neutral-700 mb-4">
          Finding the perfect gift can be challenging, but with the right approach and tools,
          you can make gift-giving a joy rather than a chore.
        </p>
        <p className="text-neutral-700 mb-4">
          Our comprehensive guide covers everything from understanding your recipient's interests
          to leveraging AI-powered recommendations for personalized suggestions.
        </p>
      </article>
    </Container>
  ),
};

export const NestedContainers: Story = {
  render: () => (
    <Container size="full" padding="none" className="bg-neutral-900 py-12">
      <Container size="xl" padding="lg">
        <div className="bg-white rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-6">Nested Container Pattern</h2>
          <Container size="md" padding="sm" className="bg-coral-50 rounded-lg py-6">
            <p className="text-neutral-700">
              You can nest containers to create sophisticated layouts with multiple width
              constraints and padding levels.
            </p>
          </Container>
        </div>
      </Container>
    </Container>
  ),
};

export const ResponsiveSections: Story = {
  render: () => (
    <div className="space-y-0">
      <Container size="full" padding="lg" className="bg-coral-500 text-white py-16">
        <h1 className="text-4xl font-bold text-center mb-4">Full-Width Hero Section</h1>
        <p className="text-center text-xl opacity-90">
          This section spans the entire viewport width
        </p>
      </Container>

      <Container size="lg" padding="lg" className="py-12">
        <h2 className="text-3xl font-bold mb-6">Constrained Content Section</h2>
        <p className="text-neutral-700 mb-4">
          This section uses the default large container width for readable content.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-neutral-100 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">Column 1</h3>
            <p className="text-sm text-neutral-600">Content in column 1</p>
          </div>
          <div className="bg-neutral-100 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">Column 2</h3>
            <p className="text-sm text-neutral-600">Content in column 2</p>
          </div>
        </div>
      </Container>
    </div>
  ),
};
