import type { Metadata } from 'next';
import { SubscriptionManagementClient } from './SubscriptionManagementClient';

export const metadata: Metadata = {
  title: 'Manage Subscription',
  description: 'Manage your Mykadoo subscription, view usage, and update billing.',
  robots: { index: false, follow: false },
};

export default function SubscriptionManagementPage() {
  return <SubscriptionManagementClient />;
}
