import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TopNav } from './TopNav';
import { Breadcrumbs } from './Breadcrumbs';
import { Tabs } from './Tabs';
import { Pagination } from './Pagination';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Button } from './Button';

const meta: Meta = {
  title: 'Components/Navigation/Showcase',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/**
 * TopNav component examples
 */
export const TopNavigation: Story = {
  render: () => {
    const logo = (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center text-white font-bold">
          M
        </div>
        <span className="text-lg font-bold">Mykadoo</span>
      </div>
    );

    const links = [
      { label: 'Home', href: '#', active: true },
      { label: 'Products', href: '#' },
      { label: 'About', href: '#' },
      { label: 'Contact', href: '#' },
    ];

    const actions = (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          Sign In
        </Button>
        <Button variant="primary" size="sm">
          Sign Up
        </Button>
      </div>
    );

    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Light Variant (Fixed)</h3>
          <TopNav logo={logo} links={links} actions={actions} variant="light" fixed bordered />
        </div>

        <div className="bg-neutral-900 p-8">
          <h3 className="text-lg font-semibold mb-4 text-white">Dark Variant</h3>
          <TopNav logo={logo} links={links} actions={actions} variant="dark" bordered={false} />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Transparent Variant</h3>
          <TopNav logo={logo} links={links} actions={actions} variant="transparent" bordered />
        </div>
      </div>
    );
  },
};

/**
 * Breadcrumbs component examples
 */
export const BreadcrumbsExamples: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Default Breadcrumbs</h3>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '#' },
            { label: 'Products', href: '#' },
            { label: 'Electronics', href: '#' },
            { label: 'Laptops' },
          ]}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Custom Separator</h3>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '#' },
            { label: 'Category', href: '#' },
            { label: 'Subcategory' },
          ]}
          separator={<span className="text-neutral-400">→</span>}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Size Variants</h3>
        <div className="space-y-3">
          <Breadcrumbs
            size="sm"
            items={[
              { label: 'Home', href: '#' },
              { label: 'Products', href: '#' },
              { label: 'Detail' },
            ]}
          />
          <Breadcrumbs
            size="md"
            items={[
              { label: 'Home', href: '#' },
              { label: 'Products', href: '#' },
              { label: 'Detail' },
            ]}
          />
          <Breadcrumbs
            size="lg"
            items={[
              { label: 'Home', href: '#' },
              { label: 'Products', href: '#' },
              { label: 'Detail' },
            ]}
          />
        </div>
      </div>
    </div>
  ),
};

/**
 * Tabs component examples
 */
export const TabsExamples: Story = {
  render: () => {
    const tabItems = [
      {
        value: 'tab1',
        label: 'Account',
        content: (
          <div className="p-4">
            <h4 className="text-lg font-semibold mb-2">Account Settings</h4>
            <p className="text-neutral-600">Manage your account settings and preferences.</p>
          </div>
        ),
      },
      {
        value: 'tab2',
        label: 'Password',
        content: (
          <div className="p-4">
            <h4 className="text-lg font-semibold mb-2">Password Settings</h4>
            <p className="text-neutral-600">Change your password and security settings.</p>
          </div>
        ),
      },
      {
        value: 'tab3',
        label: 'Notifications',
        content: (
          <div className="p-4">
            <h4 className="text-lg font-semibold mb-2">Notification Preferences</h4>
            <p className="text-neutral-600">Manage how you receive notifications.</p>
          </div>
        ),
      },
      {
        value: 'tab4',
        label: 'Disabled',
        disabled: true,
        content: <div>Disabled content</div>,
      },
    ];

    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Line Variant (Default)</h3>
          <Tabs items={tabItems} variant="line" />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Enclosed Variant</h3>
          <Tabs items={tabItems} variant="enclosed" />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Soft Variant</h3>
          <Tabs items={tabItems} variant="soft" />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Full Width</h3>
          <Tabs items={tabItems.slice(0, 3)} variant="line" fullWidth />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Vertical Orientation</h3>
          <Tabs items={tabItems.slice(0, 3)} variant="line" orientation="vertical" />
        </div>
      </div>
    );
  },
};

/**
 * Pagination component examples
 */
export const PaginationExamples: Story = {
  render: () => {
    const [page1, setPage1] = useState(1);
    const [page2, setPage2] = useState(5);
    const [page3, setPage3] = useState(1);

    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Default Pagination</h3>
          <Pagination currentPage={page1} totalPages={10} onPageChange={setPage1} />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Many Pages</h3>
          <Pagination currentPage={page2} totalPages={100} onPageChange={setPage2} siblingCount={2} />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Small Size</h3>
          <Pagination
            currentPage={page3}
            totalPages={5}
            onPageChange={setPage3}
            size="sm"
            showFirstLast={false}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Large Size</h3>
          <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} size="lg" />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Minimal (No First/Last)</h3>
          <Pagination
            currentPage={3}
            totalPages={10}
            onPageChange={() => {}}
            showFirstLast={false}
          />
        </div>
      </div>
    );
  },
};

/**
 * Sidebar component examples
 */
export const SidebarExamples: Story = {
  render: () => {
    const sidebarItems = [
      {
        label: 'Dashboard',
        href: '#',
        active: true,
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        ),
      },
      {
        label: 'Products',
        href: '#',
        badge: 12,
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        ),
        children: [
          { label: 'All Products', href: '#' },
          { label: 'Categories', href: '#' },
          { label: 'Inventory', href: '#' },
        ],
      },
      {
        label: 'Orders',
        href: '#',
        badge: 3,
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        ),
      },
      {
        label: 'Settings',
        href: '#',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        ),
      },
    ];

    const header = (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center text-white font-bold">
          M
        </div>
        <span className="text-lg font-bold">Mykadoo</span>
      </div>
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Light Variant</h3>
          <div className="h-96 border border-neutral-200 rounded-lg overflow-hidden">
            <Sidebar items={sidebarItems} header={header} variant="light" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Dark Variant</h3>
          <div className="h-96 border border-neutral-800 rounded-lg overflow-hidden">
            <Sidebar items={sidebarItems} header={header} variant="dark" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Collapsible</h3>
          <div className="h-96 border border-neutral-200 rounded-lg overflow-hidden">
            <Sidebar items={sidebarItems} header={header} variant="light" collapsible />
          </div>
        </div>
      </div>
    );
  },
};

/**
 * BottomNav component examples
 */
export const BottomNavExamples: Story = {
  render: () => {
    const navItems = [
      {
        label: 'Home',
        href: '#',
        active: true,
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        ),
      },
      {
        label: 'Search',
        href: '#',
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        ),
      },
      {
        label: 'Favorites',
        href: '#',
        badge: 5,
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        ),
      },
      {
        label: 'Cart',
        href: '#',
        badge: 3,
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ),
      },
      {
        label: 'Profile',
        href: '#',
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        ),
      },
    ];

    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Light Variant with Labels</h3>
          <div className="relative h-32 border border-neutral-200 rounded-lg overflow-hidden">
            <BottomNav items={navItems} variant="light" showLabels bordered />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Dark Variant with Labels</h3>
          <div className="relative h-32 bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
            <BottomNav items={navItems} variant="dark" showLabels bordered />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Icons Only</h3>
          <div className="relative h-24 border border-neutral-200 rounded-lg overflow-hidden">
            <BottomNav items={navItems} variant="light" showLabels={false} bordered />
          </div>
        </div>
      </div>
    );
  },
};

/**
 * All navigation components together
 */
export const AllComponents: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);

    return (
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-4">Top Navigation</h2>
          <TopNav
            logo={<span className="font-bold text-lg">Logo</span>}
            links={[
              { label: 'Home', href: '#', active: true },
              { label: 'About', href: '#' },
              { label: 'Contact', href: '#' },
            ]}
            variant="light"
            fixed={false}
          />
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Breadcrumbs</h2>
          <Breadcrumbs
            items={[
              { label: 'Home', href: '#' },
              { label: 'Products', href: '#' },
              { label: 'Detail' },
            ]}
          />
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Tabs</h2>
          <Tabs
            items={[
              { value: '1', label: 'Tab 1', content: <div className="p-4">Content 1</div> },
              { value: '2', label: 'Tab 2', content: <div className="p-4">Content 2</div> },
              { value: '3', label: 'Tab 3', content: <div className="p-4">Content 3</div> },
            ]}
            variant="line"
          />
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Pagination</h2>
          <Pagination currentPage={currentPage} totalPages={10} onPageChange={setCurrentPage} />
        </section>
      </div>
    );
  },
};
