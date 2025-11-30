import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';
import { Spinner } from './Spinner';
import { Progress } from './Progress';
import { Skeleton, SkeletonCard, SkeletonAvatar, SkeletonList } from './Skeleton';

const meta: Meta = {
  title: 'Components/Feedback/Showcase',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/**
 * All Alert variants
 */
export const Alerts: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Alert Variants</h3>

      <Alert variant="info" title="Information">
        This is an informational message. Review the details below.
      </Alert>

      <Alert variant="success" title="Success!">
        Your changes have been saved successfully.
      </Alert>

      <Alert variant="warning" title="Warning">
        Please review your settings before proceeding.
      </Alert>

      <Alert variant="error" title="Error">
        There was a problem processing your request.
      </Alert>

      <h3 className="text-lg font-semibold mt-8 mb-4">Closable Alerts</h3>

      <Alert variant="info" closable>
        You can close this alert by clicking the X button.
      </Alert>

      <Alert variant="success" title="Saved" closable onClose={() => console.log('Closed!')}>
        Your draft has been saved. You can continue editing later.
      </Alert>
    </div>
  ),
};

/**
 * All Spinner variants
 */
export const Spinners: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Spinner Sizes</h3>
        <div className="flex items-center gap-6">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <Spinner size="xl" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Spinner Variants</h3>
        <div className="flex items-center gap-6">
          <Spinner variant="primary" />
          <Spinner variant="secondary" />
          <Spinner variant="neutral" />
          <div className="bg-neutral-900 p-4 rounded">
            <Spinner variant="white" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Loading States</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Spinner size="sm" />
            <span className="text-sm text-neutral-600">Loading...</span>
          </div>

          <div className="flex items-center gap-3">
            <Spinner size="md" />
            <span>Processing your request...</span>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Progress bars
 */
export const ProgressBars: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Progress Variants</h3>
        <div className="space-y-4">
          <Progress value={65} variant="primary" />
          <Progress value={45} variant="secondary" />
          <Progress value={80} variant="success" />
          <Progress value={30} variant="warning" />
          <Progress value={15} variant="error" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">With Labels</h3>
        <div className="space-y-4">
          <Progress value={65} showLabel />
          <Progress value={75} label="Uploading... 75%" />
          <Progress value={100} variant="success" label="Complete!" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Sizes</h3>
        <div className="space-y-4">
          <Progress value={60} size="sm" />
          <Progress value={60} size="md" />
          <Progress value={60} size="lg" />
        </div>
      </div>
    </div>
  ),
};

/**
 * Skeleton loaders
 */
export const Skeletons: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Text Skeletons</h3>
        <div className="space-y-2">
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Shapes</h3>
        <div className="flex gap-4 items-center">
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="circular" width={60} height={60} />
          <Skeleton variant="rectangular" width={100} height={100} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Pre-built Layouts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-3">Card Skeleton</h4>
            <SkeletonCard />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Avatar Skeleton</h4>
            <SkeletonList items={3} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Animation Types</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-neutral-600 mb-2">Pulse (default)</p>
            <Skeleton animation="pulse" height={40} />
          </div>
          <div>
            <p className="text-sm text-neutral-600 mb-2">Wave</p>
            <Skeleton animation="wave" height={40} />
          </div>
          <div>
            <p className="text-sm text-neutral-600 mb-2">None</p>
            <Skeleton animation="none" height={40} />
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Complete loading state example
 */
export const LoadingStates: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="max-w-md p-6 bg-white rounded-lg border border-neutral-200">
        <h3 className="text-lg font-semibold mb-4">Uploading Files</h3>

        <div className="space-y-4">
          <Progress value={65} label="main-document.pdf" variant="primary" />
          <Progress value={30} label="images.zip" variant="primary" />
          <Progress value={100} label="data.csv" variant="success" />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Spinner size="sm" />
          <span className="text-sm text-neutral-600">Uploading 2 files...</span>
        </div>
      </div>

      <div className="max-w-2xl p-6 bg-white rounded-lg border border-neutral-200">
        <div className="flex items-center gap-4 mb-4">
          <Spinner />
          <h3 className="text-lg font-semibold">Loading Content</h3>
        </div>

        <SkeletonList items={4} />
      </div>
    </div>
  ),
};

/**
 * All feedback components together
 */
export const AllComponents: Story = {
  render: () => (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-4">Alerts</h2>
        <div className="space-y-3">
          <Alert variant="info">Informational message</Alert>
          <Alert variant="success" title="Success" closable>Success message</Alert>
          <Alert variant="warning" title="Warning">Warning message</Alert>
          <Alert variant="error" title="Error">Error message</Alert>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Spinners</h2>
        <div className="flex items-center gap-4">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Progress Bars</h2>
        <div className="space-y-3">
          <Progress value={25} variant="primary" showLabel />
          <Progress value={50} variant="warning" showLabel />
          <Progress value={100} variant="success" showLabel />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Skeletons</h2>
        <div className="grid grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonList items={2} />
        </div>
      </section>
    </div>
  ),
};
